import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
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

export async function PATCH(request: NextRequest, context: Params) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();
    await connectDB();

    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (body.title !== undefined) {
      const title = String(body.title || "").trim();
      if (title) product.title = title;
    }

    if (body.slug !== undefined) {
      const normalizedSlug = slugify(String(body.slug || "").trim());
      if (normalizedSlug) {
        product.slug = normalizedSlug;
      }
    }

    if (body.shortDescription !== undefined) {
      const shortDescription = String(body.shortDescription || "").trim();
      if (shortDescription) product.shortDescription = shortDescription;
    }

    if (body.description !== undefined) {
      const description = String(body.description || "").trim();
      if (description) product.description = description;
    }

    if (body.images !== undefined && Array.isArray(body.images)) {
      product.images = body.images.filter(Boolean).map((image: unknown) => String(image));
    }

    if (body.image !== undefined) {
      const image = String(body.image || "").trim();
      product.images = image ? [image] : [];
    }

    if (body.tags !== undefined) {
      if (Array.isArray(body.tags)) {
        product.tags = body.tags.filter(Boolean).map((tag: unknown) => String(tag).trim());
      } else {
        product.tags = String(body.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    if (body.categoryId !== undefined && String(body.categoryId).trim()) {
      const categoryId = String(body.categoryId).trim();

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
      }

      const category = await CategoryModel.findById(categoryId).lean();
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      product.category = category._id;
    }

    if (body.inStock !== undefined) product.inStock = Boolean(body.inStock);
    if (body.stockCount !== undefined) product.stockCount = Math.max(0, Number(body.stockCount || 0));
    if (body.featured !== undefined) product.featured = Boolean(body.featured);
    if (body.price !== undefined) {
      const priceResult = parseOptionalPrice(body.price);
      if (priceResult.error) {
        return NextResponse.json({ error: priceResult.error }, { status: 400 });
      }
      product.price = priceResult.value;
    }

    await product.save();

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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectDB();
    await ProductModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
