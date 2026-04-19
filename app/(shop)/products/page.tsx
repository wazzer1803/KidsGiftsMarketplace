import ProductSearchPanel from "@/components/forms/product-search-panel";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts, getCategories } from "@/lib/data";
import { getDisplaySettings } from "@/lib/site-settings";

function mapProduct(item: any) {
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    price: item.price,
    images: item.images || [],
    inStock: item.inStock,
    stockCount: item.stockCount,
    featured: item.featured,
    category: item.category
      ? {
          id: item.category._id?.toString?.() || "",
          name: item.category.name,
          slug: item.category.slug
        }
      : undefined
  };
}

export default async function ProductsPage() {
  const [productsRaw, categoriesRaw, displaySettings, currentUser] = await Promise.all([
    getAllProducts(300),
    getCategories(),
    getDisplaySettings(),
    getCurrentUser()
  ]);
  const canShowPrice = displaySettings.showPrice && Boolean(currentUser);

  const products = productsRaw.map(mapProduct);
  const categories = categoriesRaw.map((category: any) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug
  }));

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Product Search</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">All Products</h1>
        <p className="mt-2 text-on-surface-variant">
          {canShowPrice
            ? "Full product list with filters for category, stock, price range, and sorting."
            : "Full product list with filters for category and stock. Login required for price visibility."}
        </p>
      </div>

      <ProductSearchPanel products={products} categories={categories} showPrice={canShowPrice} />
    </section>
  );
}
