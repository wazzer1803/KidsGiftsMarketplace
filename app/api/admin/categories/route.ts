import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category";
import { ensureSeedData } from "@/lib/seed";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const authUser = await getCurrentUserFromToken(token);

  if (!authUser || authUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await ensureSeedData();

  const categories = await CategoryModel.find().sort({ position: 1, name: 1 }).lean();

  return NextResponse.json({
    categories: categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      heroImage: category.heroImage,
      accentColor: category.accentColor,
      position: category.position
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

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const heroImage = String(body.heroImage || "").trim();
    const accentColor = String(body.accentColor || "#f56a4a").trim() || "#f56a4a";
    const slugInput = String(body.slug || name).trim();
    const slugBase = slugify(slugInput);

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    if (!slugBase) {
      return NextResponse.json({ error: "Valid category slug is required." }, { status: 400 });
    }

    await connectDB();

    const existingExact = await CategoryModel.findOne({ slug: slugBase }).lean();
    const slug = existingExact ? `${slugBase}-${Date.now()}` : slugBase;

    const parsedPosition = Number(body.position);
    let position = Number.isFinite(parsedPosition) ? Math.max(1, Math.floor(parsedPosition)) : 0;

    if (!position) {
      const lastCategory = await CategoryModel.findOne().sort({ position: -1 }).select("position").lean();
      position = Math.max(1, Number(lastCategory?.position || 0) + 1);
    }

    const created = await CategoryModel.create({
      name,
      slug,
      description,
      heroImage,
      accentColor,
      position
    });

    return NextResponse.json({
      success: true,
      category: {
        id: created._id.toString(),
        name: created.name,
        slug: created.slug
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
