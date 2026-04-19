import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import CategoryModel from "@/lib/models/Category";
import ProductModel from "@/lib/models/Product";
import { slugify } from "@/lib/utils";

function parseOptionalPrice(value: unknown) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return {
      value: null as number | null,
      error: null as string | null
    };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      value: null as number | null,
      error: "Price must be a number greater than or equal to 0."
    };
  }

  return {
    value: parsed,
    error: null as string | null
  };
}

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const authUser = await getCurrentUserFromToken(token);

  if (!authUser || authUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await ensureSeedData();

  const products = await ProductModel.find()
    .populate("category", "name slug")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    products: products.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      images: product.images || [],
      tags: product.tags || [],
      stockCount: product.stockCount,
      inStock: product.inStock,
      featured: product.featured,
      category: product.category
        ? {
            id: String((product.category as any)._id || ""),
            name: (product.category as any).name,
            slug: (product.category as any).slug
          }
        : undefined,
      updatedAt: product.updatedAt
    }))
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const shortDescription = String(body.shortDescription || "").trim();
    const description = String(body.description || "").trim();
    const categoryId = String(body.categoryId || "").trim();
    const priceResult = parseOptionalPrice(body.price);

    if (!title || !shortDescription || !description) {
      return NextResponse.json(
        { error: "Title, short description and description are required." },
        { status: 400 }
      );
    }

    if (priceResult.error) {
      return NextResponse.json({ error: priceResult.error }, { status: 400 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Valid category id is required." }, { status: 400 });
    }

    const category = await CategoryModel.findById(categoryId).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const baseSlug = slugify(String(body.slug || title));
    const existing = await ProductModel.countDocuments({ slug: baseSlug });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = await ProductModel.create({
      title,
      slug,
      shortDescription,
      description,
      price: priceResult.value,
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
      category: category._id,
      tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : [],
      inStock: body.inStock === undefined ? true : Boolean(body.inStock),
      stockCount: Number(body.stockCount || 0),
      featured: Boolean(body.featured)
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product._id.toString(),
        slug: product.slug
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
