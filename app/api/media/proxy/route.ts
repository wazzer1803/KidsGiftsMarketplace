import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com"
]);

function normalizeRemoteUrl(raw: string) {
  const value = raw.trim();
  const withProtocol = value.startsWith("//") ? `https:${value}` : value;
  const parsed = new URL(withProtocol);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Unsupported protocol.");
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error("Host is not allowed.");
  }

  return parsed.toString();
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json({ error: "Missing url query parameter." }, { status: 400 });
  }

  let remoteUrl: string;
  try {
    remoteUrl = normalizeRemoteUrl(raw);
  } catch {
    return NextResponse.json({ error: "Invalid or unsupported image URL." }, { status: 400 });
  }

  try {
    const upstream = await fetch(remoteUrl, {
      method: "GET",
      headers: {
        Accept: "image/*,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store"
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch remote image." }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Remote response is not an image." }, { status: 415 });
    }

    const data = await upstream.arrayBuffer();
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
      }
    });
  } catch {
    return NextResponse.json({ error: "Image proxy request timed out." }, { status: 504 });
  }
}

