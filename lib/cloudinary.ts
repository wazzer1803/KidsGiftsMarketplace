import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
};

const DEFAULT_CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "kids-marketplace";

function getCloudinaryConfigFromEnv(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret
  };
}

export function getCloudinaryConfig() {
  return getCloudinaryConfigFromEnv();
}

export function getCloudinaryFolder() {
  return DEFAULT_CLOUDINARY_FOLDER;
}

export function assertCloudinaryConfigured() {
  const config = getCloudinaryConfigFromEnv();
  if (!config) {
    throw new Error("Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET.");
  }

  return config;
}

export function isCloudinaryUrlForCloud(url: string, cloudName?: string) {
  if (!url) {
    return false;
  }

  const configuredCloudName = cloudName || getCloudinaryConfigFromEnv()?.cloudName;
  if (!configuredCloudName) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") {
      return false;
    }

    const cloud = parsed.pathname.split("/").filter(Boolean)[0];
    return cloud === configuredCloudName;
  } catch {
    return false;
  }
}

function createCloudinarySignature(params: Record<string, string | number>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => [key, String(value)] as const)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

function sanitizePublicIdSeed(seed: string) {
  const normalized = seed
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");

  return normalized || "asset";
}

export function createCloudinaryPublicId(seed: string) {
  const base = sanitizePublicIdSeed(seed).slice(0, 90);
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}

type UploadImageOptions = {
  folder?: string;
  publicId?: string;
  fileName?: string;
};

async function uploadImageToCloudinary(source: string | Blob | File, options: UploadImageOptions = {}) {
  const config = assertCloudinaryConfigured();
  const folder = options.folder?.trim();
  const publicId = options.publicId?.trim();
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = createCloudinarySignature(
    {
      folder: folder || "",
      public_id: publicId || "",
      timestamp
    },
    config.apiSecret
  );

  const formData = new FormData();
  if (typeof source === "string") {
    formData.append("file", source);
  } else {
    formData.append("file", source, options.fileName || "upload.jpg");
  }

  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  if (folder) formData.append("folder", folder);
  if (publicId) formData.append("public_id", publicId);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    const reason =
      typeof data?.error?.message === "string" ? data.error.message : "Cloudinary upload failed.";
    throw new Error(reason);
  }

  return data as CloudinaryUploadResult;
}

export async function uploadImageFile(file: Blob | File, options: UploadImageOptions = {}) {
  return uploadImageToCloudinary(file, options);
}

export async function uploadImageFromRemoteUrl(url: string, options: UploadImageOptions = {}) {
  return uploadImageToCloudinary(url, options);
}

function getMimeTypeFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".avif") return "image/avif";
  return "image/jpeg";
}

export async function uploadImageFromPublicPath(publicPath: string, options: UploadImageOptions = {}) {
  const cleanPath = publicPath.split("?")[0].split("#")[0].replace(/^\/+/, "");
  if (!cleanPath || cleanPath.includes("..")) {
    throw new Error("Invalid public image path.");
  }

  const absolutePath = path.join(process.cwd(), "public", cleanPath);
  const fileBuffer = await fs.readFile(absolutePath);
  const mimeType = getMimeTypeFromPath(absolutePath);
  const fileName = path.basename(absolutePath);

  if (typeof File !== "undefined") {
    const file = new File([fileBuffer], fileName, { type: mimeType });
    return uploadImageToCloudinary(file, { ...options, fileName });
  }

  const blob = new Blob([fileBuffer], { type: mimeType });
  return uploadImageToCloudinary(blob, { ...options, fileName });
}
