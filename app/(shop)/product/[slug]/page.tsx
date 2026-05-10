import Image from "@/components/ui/app-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductCard from "@/components/product-card";
import WhatsAppAppLink from "@/components/whatsapp-app-link";
import { BubbleTip } from "@/components/ui/bubble-tip";
import { getCurrentUser } from "@/lib/auth";
import { getProductBySlug, getProductsByCategorySlug } from "@/lib/data";
import { getDisplaySettings } from "@/lib/site-settings";
import { getWhatsAppOrderSettings } from "@/lib/whatsapp-order-settings";
import { formatOptionalINR, hasValidPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

type MappedProduct = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number | null;
  images: string[];
  tags: string[];
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  category?:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | undefined;
};

function mapProduct(product: any): MappedProduct {
  return {
    _id: product._id.toString(),
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: hasValidPrice(product.price) ? product.price : null,
    images: Array.isArray(product.images) ? product.images.filter(Boolean).map(String) : [],
    tags: (product.tags || []) as string[],
    inStock: product.inStock,
    stockCount: product.stockCount,
    featured: product.featured,
    category: product.category
      ? {
          id: product.category._id?.toString?.() || "",
          name: product.category.name,
          slug: product.category.slug
        }
      : undefined
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const productRaw = await getProductBySlug(slug);

  if (!productRaw) {
    notFound();
  }

  const product = mapProduct(productRaw);

  const relatedRaw = product.category?.slug
    ? (await getProductsByCategorySlug(product.category.slug)).products
    : [];

  const related = relatedRaw
    .map(mapProduct)
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const [currentUser, displaySettings, whatsappSettings] = await Promise.all([
    getCurrentUser(),
    getDisplaySettings(),
    getWhatsAppOrderSettings()
  ]);
  const canShowPrice = displaySettings.showPrice && Boolean(currentUser);
  const whatsappPhone = whatsappSettings.activeWhatsappNumber || "";
  const productImageUrl = product.images[0] || "";
  const productPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/product/${product.slug}`;
  const priceLine = canShowPrice
    ? hasValidPrice(product.price)
      ? `Price: ${formatOptionalINR(product.price)}`
      : "Price: On request"
    : "";

  const whatsappMessage = [
    "Hi, I want to order this product from Home And Kids Corner:",
    `Product Name: ${product.title}`,
    "Quantity: 1",
    priceLine,
    // productImageUrl ? `Product Image: ${productImageUrl}` : "",
    // `Product URL: ${productPageUrl}`,
    currentUser?.phone ? `My phone: ${currentUser.phone}` : "",
    "Please share availability and next steps."
  ]
    .filter(Boolean)
    .join("\n");

  const heroImage = product.images[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuBaIDzkWZKLTMi4vKk28ON8I9D6tCjLrRcHRyg-wCoU4Sr0pkMnnaFGePkAlbPriyMlHmbXeDZ6h5_dnRmKYD0c_SpIhapuGVraEZZBx3kgK5itlfPpGyl0FkS4FPrurU1CkuPsuHB29SOo_CywVYaDOH17BsIhmO68a94MmaQrjLIM53eOtBkXrYRkZOvcAJDFmV1vefC-qdEsYliXQmlq0jT1cuXc6mAK-d0VKPSg518-c3UeRskNM8Py0vHCXpao8NWIW867uig";

  return (
    <div className="space-y-12">
      <section className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl soft-card">
            <Image src={heroImage} alt={product.title} fill className="object-cover" sizes="60vw" priority />
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1, 4).map((image) => (
                <div key={image} className="relative aspect-square overflow-hidden rounded-2xl soft-card">
                  <Image src={image} alt={product.title} fill className="object-cover" sizes="20vw" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {product.category?.name || "Stationery"}
            </p>
            <h1 className="mt-2 break-words text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">{product.title}</h1>
            <p className="js-price mt-2 text-lg font-semibold text-secondary">{formatOptionalINR(product.price)}</p>
          </div>

          <p className="text-on-surface-variant">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface"
              >
                {tag}
              </span>
            ))}
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              {product.inStock ? (
                <>
                  In Stock <span className="js-quantity">({product.stockCount})</span>
                </>
              ) : (
                "Out of Stock"
              )}
            </span>
          </div>

          <div className="soft-card rounded-3xl p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <AddToCartButton
                product={{
                  id: product._id,
                  title: product.title,
                  slug: product.slug,
                  price: product.price,
                  image: product.images[0],
                  inStock: product.inStock
                }}
              />
              <WhatsAppAppLink
                className="btn-secondary !justify-center !border-green-500/40 !bg-green-50 !font-bold !text-green-700"
                phone={whatsappPhone}
                message={whatsappMessage}
              >
                WhatsApp Order Enquiry
              </WhatsAppAppLink>
              <Link className="btn-secondary md:col-span-2" href={`/tickets?product=${product._id}`}>
                Raise Support / Enquiry Ticket
              </Link>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant">
            Contact flow: user logs in with email-password, opens product, taps WhatsApp, and sends pre-filled item enquiry.
          </p>
        </div>
      </section>

      <BubbleTip
        tips={[
          {
            title: "Wonder Tip",
            body: "Pair journals with matching pen sets to increase repeat purchases and make planning easier for parents."
          },
          {
            title: "Enquiry Tip",
            body: "Mention size, color preference, and quantity in your WhatsApp message to get faster confirmation."
          },
          {
            title: "Stock Tip",
            body: "For school season, save frequent items in cart and review stock weekly before placing a final order."
          },
          {
            title: "Gift Tip",
            body: "Combine one practical stationery item and one fun add-on to create balanced gift bundles."
          },
          {
            title: "Care Tip",
            body: "Store markers horizontally and close caps tightly so colors stay smooth for longer use."
          }
        ]}
      />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Other Magical Finds</h2>
          <Link href="/categories" className="text-sm font-bold text-primary">
            See all categories
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {related.length ? (
            related.map((item) => <ProductCard key={item._id} product={item} />)
          ) : (
            <p className="text-sm text-on-surface-variant">No related products found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
