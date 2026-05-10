import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category";
import ProductModel from "@/lib/models/Product";
import { slugify } from "@/lib/utils";

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
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const body = await request.json();
    await connectDB();

    const category = await CategoryModel.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    let nextName = category.name;
    if (body.name !== undefined) {
      const name = String(body.name || "").trim();
      if (!name) {
        return NextResponse.json({ error: "Category name is required." }, { status: 400 });
      }

      category.name = name;
      nextName = name;
    }

    if (body.slug !== undefined) {
      const normalizedSlug = slugify(String(body.slug || nextName).trim());
      if (!normalizedSlug) {
        return NextResponse.json({ error: "Valid category slug is required." }, { status: 400 });
      }

      const existing = await CategoryModel.findOne({
        _id: { $ne: category._id },
        slug: normalizedSlug
      }).lean();

      if (existing) {
        return NextResponse.json({ error: "Another category already uses this slug." }, { status: 409 });
      }

      category.slug = normalizedSlug;
    }

    if (body.description !== undefined) {
      category.description = String(body.description || "").trim();
    }

    if (body.heroImage !== undefined) {
      category.heroImage = String(body.heroImage || "").trim();
    }

    if (body.accentColor !== undefined) {
      category.accentColor = String(body.accentColor || "#f56a4a").trim() || "#f56a4a";
    }

    if (body.position !== undefined && body.position !== null && String(body.position).trim()) {
      const position = Number(body.position);
      if (!Number.isFinite(position) || position < 1) {
        return NextResponse.json({ error: "Position must be a number greater than or equal to 1." }, { status: 400 });
      }

      category.position = Math.floor(position);
    }

    await category.save();

    return NextResponse.json({
      success: true,
      category: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        heroImage: category.heroImage,
        accentColor: category.accentColor,
        position: category.position
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    await connectDB();

    const category = await CategoryModel.findById(id).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const assignedProductCount = await ProductModel.countDocuments({ category: category._id });
    if (assignedProductCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}" because ${assignedProductCount} product${
            assignedProductCount === 1 ? " is" : "s are"
          } still assigned to it. Move those products to another category first, then try deleting again.`,
          assignedProductCount
        },
        { status: 409 }
      );
    }

    await CategoryModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
