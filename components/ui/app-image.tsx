import NextImage, { type ImageProps } from "next/image";

function shouldBypassOptimizer(src: ImageProps["src"]) {
  if (typeof src !== "string") {
    return false;
  }

  const value = src.trim();
  return (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("//") ||
    value.startsWith("res.cloudinary.com/")
  );
}

export default function AppImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src.trim() : props.src;

  if (typeof src === "string" && !src) {
    return null;
  }

  return <NextImage {...props} src={src} unoptimized={props.unoptimized ?? shouldBypassOptimizer(src)} />;
}
