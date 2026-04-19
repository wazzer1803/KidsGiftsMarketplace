import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category";
import ProductModel from "@/lib/models/Product";
import { ensureSeedData } from "@/lib/seed";

export async function getCategories() {
  await connectDB();
  await ensureSeedData();

  return CategoryModel.find().sort({ position: 1, name: 1 }).lean();
}

export async function getFeaturedProducts(limit = 6) {
  await connectDB();
  await ensureSeedData();

  return ProductModel.find({ featured: true })
    .populate("category", "name slug")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getProductsByCategorySlug(slug: string) {
  await connectDB();
  await ensureSeedData();

  const category = await CategoryModel.findOne({ slug }).lean();

  if (!category) {
    return {
      category: null,
      products: []
    };
  }

  const products = await ProductModel.find({ category: category._id })
    .populate("category", "name slug")
    .sort({ featured: -1, updatedAt: -1 })
    .lean();

  return {
    category,
    products
  };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  await ensureSeedData();

  return ProductModel.findOne({ slug }).populate("category", "name slug").lean();
}

export async function getAllProducts(limit = 100) {
  await connectDB();
  await ensureSeedData();

  return ProductModel.find()
    .populate("category", "name slug")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
}
