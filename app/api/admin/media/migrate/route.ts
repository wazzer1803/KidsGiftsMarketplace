import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category";
import ProductModel from "@/lib/models/Product";
import { ensureSeedData } from "@/lib/seed";
import {
  assertCloudinaryConfigured,
  createCloudinaryPublicId,
  getCloudinaryFolder,
  isCloudinaryUrlForCloud,
  uploadImageFromPublicPath,
  uploadImageFromRemoteUrl
} from "@/lib/cloudinary";
import { DEFAULT_BRAND_LOGO_URL } from "@/lib/brand";

type MigrationFailure = {
  source: string;
  reason: string;
};

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudinaryConfig = assertCloudinaryConfigured();
    const cloudinaryFolder = getCloudinaryFolder();
    const failures: MigrationFailure[] = [];
    const sourceToTarget = new Map<string, string>();

    await connectDB();
    await ensureSeedData();

    async function migrateImageSource(source: string, folder: string, seed: string) {
      const trimmed = String(source || "").trim();
      if (!trimmed) {
        return trimmed;
      }

      if (sourceToTarget.has(trimmed)) {
        return sourceToTarget.get(trimmed) as string;
      }

      if (isCloudinaryUrlForCloud(trimmed, cloudinaryConfig.cloudName)) {
        sourceToTarget.set(trimmed, trimmed);
        return trimmed;
      }

      try {
        const publicId = createCloudinaryPublicId(seed);
        const uploaded = trimmed.startsWith("/")
          ? await uploadImageFromPublicPath(trimmed, { folder, publicId })
          : isHttpUrl(trimmed)
            ? await uploadImageFromRemoteUrl(trimmed, { folder, publicId })
            : null;

        if (!uploaded?.secure_url) {
          sourceToTarget.set(trimmed, trimmed);
          failures.push({
            source: trimmed,
            reason: "Unsupported source format. Use an absolute URL or /public-file path."
          });
          return trimmed;
        }

        sourceToTarget.set(trimmed, uploaded.secure_url);
        return uploaded.secure_url;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown migration error.";
        sourceToTarget.set(trimmed, trimmed);
        failures.push({ source: trimmed, reason });
        return trimmed;
      }
    }

    const categories = await CategoryModel.find();
    const products = await ProductModel.find();

    let categoryDocumentsUpdated = 0;
    let categoryImagesMigrated = 0;
    let productDocumentsUpdated = 0;
    let productImagesMigrated = 0;

    for (const category of categories) {
      const currentHero = String(category.heroImage || "").trim();
      if (!currentHero) {
        continue;
      }

      const migratedHero = await migrateImageSource(
        currentHero,
        `${cloudinaryFolder}/categories`,
        `category-${category.slug || category._id.toString()}`
      );

      if (migratedHero !== currentHero) {
        category.heroImage = migratedHero;
        await category.save();
        categoryDocumentsUpdated += 1;
        categoryImagesMigrated += 1;
      }
    }

    for (const product of products) {
      const currentImages = Array.isArray(product.images) ? product.images.map((item) => String(item || "").trim()) : [];
      if (!currentImages.length) {
        continue;
      }

      const migratedImages: string[] = [];
      let changed = false;

      for (let index = 0; index < currentImages.length; index += 1) {
        const currentImage = currentImages[index];
        if (!currentImage) {
          continue;
        }

        const migratedImage = await migrateImageSource(
          currentImage,
          `${cloudinaryFolder}/products`,
          `product-${product.slug || product._id.toString()}-${index + 1}`
        );

        migratedImages.push(migratedImage);
        if (migratedImage !== currentImage) {
          changed = true;
          productImagesMigrated += 1;
        }
      }

      if (changed) {
        product.images = migratedImages;
        await product.save();
        productDocumentsUpdated += 1;
      }
    }

    const configuredBrandLogo = String(
      process.env.NEXT_PUBLIC_BRAND_LOGO_URL || DEFAULT_BRAND_LOGO_URL
    ).trim();

    let recommendedBrandLogoUrl: string | null = null;
    if (configuredBrandLogo) {
      const migratedBrandLogo = await migrateImageSource(
        configuredBrandLogo,
        `${cloudinaryFolder}/brand`,
        "brand-home-and-kids-corner-logo"
      );

      if (migratedBrandLogo !== configuredBrandLogo) {
        recommendedBrandLogoUrl = migratedBrandLogo;
      }
    }

    return NextResponse.json({
      success: true,
      cloudName: cloudinaryConfig.cloudName,
      summary: {
        categoryDocumentsUpdated,
        categoryImagesMigrated,
        productDocumentsUpdated,
        productImagesMigrated,
        processedSources: sourceToTarget.size,
        failures: failures.length
      },
      recommendedBrandLogoUrl,
      failures: failures.slice(0, 25)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to migrate images to Cloudinary."
      },
      { status: 500 }
    );
  }
}
