import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data";

export async function GET() {
  try {
    const categories = await getCategories();

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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load categories" }, { status: 500 });
  }
}
