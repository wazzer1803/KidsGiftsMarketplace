import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import {
  createCloudinaryPublicId,
  getCloudinaryFolder,
  uploadImageFile
} from "@/lib/cloudinary";

function getUploadSubfolder(kind: string) {
  if (kind === "product") return "products";
  if (kind === "category") return "categories";
  if (kind === "brand") return "brand";
  return "uploads";
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!fileValue.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    if (fileValue.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file must be 10MB or smaller." }, { status: 400 });
    }

    const kind = String(formData.get("kind") || "upload").toLowerCase().trim();
    const folder = `${getCloudinaryFolder()}/${getUploadSubfolder(kind)}`;
    const publicId = createCloudinaryPublicId(`${kind}-${Date.now()}-${fileValue.name || "image"}`);

    const uploaded = await uploadImageFile(fileValue, {
      folder,
      publicId,
      fileName: fileValue.name || "upload.jpg"
    });

    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload image to Cloudinary."
      },
      { status: 500 }
    );
  }
}
