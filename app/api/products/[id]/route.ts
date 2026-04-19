import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
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

type Params = {
  params: Promise<{ id: string }>;
};

async function findProduct(idOrSlug: string) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await ProductModel.findById(idOrSlug).populate("category", "name slug").lean();
    if (byId) return byId;
  }

  return ProductModel.findOne({ slug: idOrSlug }).populate("category", "name slug").lean();
}

export async function GET(_request: NextRequest, context: Params) {
  try {
    await connectDB();
    const { id } = await context.params;
    const product = await findProduct(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        id: product._id.toString(),
        title: product.title,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        images: product.images,
        inStock: product.inStock,
        stockCount: product.stockCount,
        featured: product.featured,
        tags: product.tags,
        category: product.category
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Params) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;
    const body = await request.json();
    const current = mongoose.Types.ObjectId.isValid(id)
      ? await ProductModel.findById(id)
      : await ProductModel.findOne({ slug: id });

    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (body.title) {
      current.title = String(body.title).trim();
    }

    if (body.slug) {
      current.slug = slugify(String(body.slug));
    }

    if (body.shortDescription) {
      current.shortDescription = String(body.shortDescription).trim();
    }

    if (body.description) {
      current.description = String(body.description).trim();
    }

    if (body.price !== undefined) {
      const priceResult = parseOptionalPrice(body.price);
      if (priceResult.error) {
        return NextResponse.json({ error: priceResult.error }, { status: 400 });
      }
      current.price = priceResult.value;
    }

    if (body.images && Array.isArray(body.images)) {
      current.images = body.images.filter(Boolean);
    }

    if (body.tags && Array.isArray(body.tags)) {
      current.tags = body.tags.filter(Boolean);
    }

    if (body.inStock !== undefined) {
      current.inStock = Boolean(body.inStock);
    }

    if (body.stockCount !== undefined) {
      current.stockCount = Number(body.stockCount || 0);
    }

    if (body.featured !== undefined) {
      current.featured = Boolean(body.featured);
    }

    if (body.categoryId && mongoose.Types.ObjectId.isValid(String(body.categoryId))) {
      const category = await CategoryModel.findById(body.categoryId);
      if (category) {
        current.category = category._id;
      }
    } else if (body.categorySlug) {
      const category = await CategoryModel.findOne({ slug: String(body.categorySlug) });
      if (category) {
        current.category = category._id;
      }
    }

    await current.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      await ProductModel.findByIdAndDelete(id);
    } else {
      await ProductModel.findOneAndDelete({ slug: id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
