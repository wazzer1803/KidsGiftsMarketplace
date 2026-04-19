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
  return <NextImage {...props} unoptimized={props.unoptimized ?? shouldBypassOptimizer(props.src)} />;
}
