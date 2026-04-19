import Image from "@/components/ui/app-image";
import Link from "next/link";
import { formatOptionalINR } from "@/lib/utils";

type Category = {
  name: string;
  slug: string;
};

type ProductCardProps = {
  product: {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    price: number | null;
    images: string[];
    inStock: boolean;
    category?: Category;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl soft-card transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">No image</div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {product.category?.name || "Stationery"}
        </div>

        {!product.inStock ? (
          <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Out of Stock
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="break-words text-xl font-black leading-tight text-on-surface sm:text-2xl">{product.title}</h3>
        <p className="mt-2 text-sm text-on-surface-variant">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="js-price text-xl font-black text-secondary">{formatOptionalINR(product.price)}</span>
          <Link href={`/product/${product.slug}`} className="btn-primary !rounded-full !px-4 !py-2">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

