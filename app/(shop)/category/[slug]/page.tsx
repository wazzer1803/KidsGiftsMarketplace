import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product-card";
import ProductCarousel from "@/components/product-carousel";
import SectionTitle from "@/components/section-title";
import { getProductsByCategorySlug } from "@/lib/data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

function mapProduct(product: any) {
  return {
    _id: product._id.toString(),
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    images: product.images || [],
    inStock: product.inStock,
    stockCount: product.stockCount,
    featured: product.featured,
    category: product.category
      ? {
          name: product.category.name,
          slug: product.category.slug
        }
      : undefined
  };
}

export default async function CategoryListingPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { category, products: productsRaw } = await getProductsByCategorySlug(slug);

  if (!category) {
    notFound();
  }

  const products = productsRaw.map(mapProduct);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-surface-container-low p-6 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Premium Collection</p>
        <h1 className="mt-2 break-words text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant md:text-lg">{category.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface">
            Live Availability
          </span>
          <span className="rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface">
            WhatsApp Enquiry Ready
          </span>
          <Link href="/categories" className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-on-primary">
            All Categories
          </Link>
        </div>
      </section>

      <ProductCarousel
        title="Category Quick Swipe"
        subtitle="Smooth horizontal product browsing for this category."
        items={products.map((product) => ({
          id: product._id,
          title: product.title,
          slug: product.slug,
          image: product.images?.[0],
          shortDescription: product.shortDescription,
          categoryName: category.name
        }))}
      />

      <section>
        <SectionTitle
          eyebrow="Category Shelf"
          title={`${products.length} Product${products.length === 1 ? "" : "s"} Available`}
          subtitle="Click any product to view full details, stock, and direct WhatsApp order message flow."
        />

        {products.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-surface-container-low p-8 text-center text-on-surface-variant">
            No products in this category yet. Add from admin dashboard.
          </div>
        )}
      </section>
    </div>
  );
}
