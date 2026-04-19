import Image from "@/components/ui/app-image";
import Link from "next/link";
import HeroCarousel from "@/components/hero-carousel";
import ProductCard from "@/components/product-card";
import ProductCarousel from "@/components/product-carousel";
import SectionTitle from "@/components/section-title";
import CategoryShowcaseCarousel from "@/components/category-showcase-carousel";
import { BubbleTip } from "@/components/ui/bubble-tip";
import { BRAND_LOGO_URL } from "@/lib/brand";
import { getAllProducts, getCategories, getFeaturedProducts } from "@/lib/data";

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

export default async function HomePage() {
  const [categoriesRaw, featuredRaw, allRaw] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getAllProducts(12)
  ]);

  const categories = categoriesRaw.map((category: any) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    heroImage: category.heroImage,
    accentColor: category.accentColor
  }));

  const featuredProducts = featuredRaw.map(mapProduct);
  const allProducts = allRaw.map(mapProduct);

  const slides = categories.slice(0, 5).map((category, index) => ({
    id: category.id,
    image: category.heroImage || featuredProducts[index]?.images?.[0] || "",
    title: category.name,
    subtitle: category.description || "Playful stationery picks for creative kids.",
    badge: index === 0 ? "Top Collection" : "Explore",
    ctaHref: `/category/${category.slug}`
  }));

  const spotlight = featuredProducts[0];
  const side = featuredProducts.slice(1, 3);

  return (
    <div className="space-y-14">
      <section className="soft-card rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm shadow-primary/20">
            <Image
              src={BRAND_LOGO_URL}
              alt="Home And Kids Corner logo"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Home And Kids Corner</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-on-surface sm:text-3xl">
              Handmade Finds For Kids And Home
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant sm:text-base">
              Colors, toys, and playful essentials curated in the same vibe as your new logo.
            </p>
          </div>
        </div>
      </section>

      <HeroCarousel slides={slides} />

      <CategoryShowcaseCarousel items={categories.slice(0, 10)} />

      {spotlight ? (
        <section>
          <SectionTitle
            eyebrow="Trending Now"
            title="Free-flowing Picks This Week"
            subtitle="Hand-picked favourites with quick WhatsApp contact from each product page."
          />

          <div className="grid gap-5 md:grid-cols-12">
            <article className="md:col-span-8 overflow-hidden rounded-3xl soft-card transition-shadow duration-500 hover:shadow-2xl">
              <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Hot Pick</p>
                  <h3 className="mt-3 break-words text-3xl font-black leading-tight sm:text-4xl">{spotlight.title}</h3>
                  <p className="mt-3 line-clamp-4 text-on-surface-variant">{spotlight.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/product/${spotlight.slug}`} className="btn-primary">
                      View Product
                    </Link>
                    <Link href={`/category/${spotlight.category?.slug || "categories"}`} className="btn-secondary">
                      Explore Category
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[280px] bg-surface-container-low">
                  <Image src={spotlight.images[0]} alt={spotlight.title} fill className="object-cover" sizes="50vw" />
                </div>
              </div>
            </article>

            <div className="space-y-5 md:col-span-4">
              {side.map((item) => (
                <Link
                  key={item._id}
                  href={`/product/${item.slug}`}
                  className="group block overflow-hidden rounded-3xl soft-card transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-44 bg-surface-container-low">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-xl font-black">{item.title}</h4>
                    <p className="mt-1 text-sm text-on-surface-variant">{item.shortDescription}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ProductCarousel
        title="Swipe Through Popular Picks"
        subtitle="A quick free-flowing product rail for fast browsing."
        items={allProducts.slice(0, 10).map((item) => ({
          id: item._id,
          title: item.title,
          slug: item.slug,
          image: item.images?.[0],
          shortDescription: item.shortDescription,
          categoryName: item.category?.name
        }))}
      />

      <section className="flowing-gradient relative overflow-hidden rounded-3xl p-8 text-white md:p-12">
        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Back to School</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-6xl">Dream big. Pack smart.</h2>
            <p className="mt-3 text-white/90 md:text-lg">
              Create complete school bundles, add custom wishlist notes, and contact instantly on WhatsApp.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/category/lunch-box" className="btn-secondary !rounded-full !bg-white !px-7 !text-primary">
              Explore Lunch Box
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Free delivery over Rs. 999</p>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="More Magical Finds"
          title="Discover Across Collections"
          subtitle="A playful mix of journals, pens, stickers, and creative craft packs."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {allProducts.slice(0, 6).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <BubbleTip
        tips={[
          {
            title: "Wonder Tip",
            body: "Color-sorting pencils before homework helps kids focus faster and keeps the study desk tidy."
          },
          {
            title: "Bundle Tip",
            body: "Pair doodle notebooks with glitter gel pens as one bundle to increase cross-category orders."
          },
          {
            title: "Gifting Tip",
            body: "Pre-build return-gift packs with stickers, mini crayons, and craft cards for birthdays."
          },
          {
            title: "Classroom Tip",
            body: "Keep a labeled refill box for erasers, sharpeners, and highlighters to save prep time."
          },
          {
            title: "Art Corner Tip",
            body: "Offer color families together like ocean tones or sunset tones for easy creative picks."
          },
          {
            title: "Parent Tip",
            body: "Create one ready-to-go homework starter kit so kids can begin study time without delays."
          }
        ]}
      />
    </div>
  );
}

