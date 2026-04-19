"use client";

import Image from "@/components/ui/app-image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatOptionalINR, hasValidPrice } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  price: number | null;
  images: string[];
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  };
};

type ProductSearchPanelProps = {
  products: ProductItem[];
  categories: CategoryOption[];
  showPrice?: boolean;
};

type StockFilter = "all" | "in_stock" | "out_stock";
type SortFilter = "featured" | "price_low" | "price_high" | "name_az" | "name_za";

export default function ProductSearchPanel({ products, categories, showPrice = true }: ProductSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [stock, setStock] = useState<StockFilter>("all");
  const [sortBy, setSortBy] = useState<SortFilter>("featured");
  const [showCategoryFilters, setShowCategoryFilters] = useState(true);
  const [showPriceFilters, setShowPriceFilters] = useState(false);

  const priceBounds = useMemo(() => {
    const pricedItems = products.filter((item) => hasValidPrice(item.price));
    if (!pricedItems.length) {
      return { min: 0, max: 0, hasPricedProducts: false };
    }

    const values = pricedItems.map((item) => item.price as number);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      hasPricedProducts: true
    };
  }, [products]);

  const sliderStep = useMemo(() => {
    const span = priceBounds.max - priceBounds.min;
    if (span > 5000) return 100;
    if (span > 1000) return 50;
    if (span > 200) return 10;
    return 1;
  }, [priceBounds.max, priceBounds.min]);

  const [rangeMin, setRangeMin] = useState(priceBounds.min);
  const [rangeMax, setRangeMax] = useState(priceBounds.max);

  useEffect(() => {
    setRangeMin((current) => {
      if (!priceBounds.hasPricedProducts) return 0;
      return Math.min(Math.max(current, priceBounds.min), priceBounds.max);
    });

    setRangeMax((current) => {
      if (!priceBounds.hasPricedProducts) return 0;
      return Math.max(Math.min(current, priceBounds.max), priceBounds.min);
    });
  }, [priceBounds.hasPricedProducts, priceBounds.max, priceBounds.min]);

  const filteredProducts = useMemo(() => {
    let items = [...products];
    const normalizedQuery = query.trim().toLowerCase();
    const effectiveSort =
      showPrice || (sortBy !== "price_low" && sortBy !== "price_high") ? sortBy : ("featured" as SortFilter);

    if (normalizedQuery) {
      items = items.filter((item) => {
        const categoryName = item.category?.name?.toLowerCase() || "";
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.slug.toLowerCase().includes(normalizedQuery) ||
          item.shortDescription.toLowerCase().includes(normalizedQuery) ||
          categoryName.includes(normalizedQuery)
        );
      });
    }

    if (selectedCategoryIds.length > 0) {
      items = items.filter((item) =>
        item.category?.id ? selectedCategoryIds.includes(item.category.id) : false
      );
    }

    if (stock === "in_stock") {
      items = items.filter((item) => item.inStock);
    }

    if (stock === "out_stock") {
      items = items.filter((item) => !item.inStock);
    }

    if (showPrice && priceBounds.hasPricedProducts) {
      items = items.filter(
        (item) => hasValidPrice(item.price) && item.price >= rangeMin && item.price <= rangeMax
      );
    }

    if (effectiveSort === "featured") {
      items.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));
    }

    if (effectiveSort === "price_low") {
      items.sort((a, b) => {
        const left = hasValidPrice(a.price) ? a.price : Number.POSITIVE_INFINITY;
        const right = hasValidPrice(b.price) ? b.price : Number.POSITIVE_INFINITY;
        return left - right;
      });
    }

    if (effectiveSort === "price_high") {
      items.sort((a, b) => {
        const left = hasValidPrice(a.price) ? a.price : Number.NEGATIVE_INFINITY;
        const right = hasValidPrice(b.price) ? b.price : Number.NEGATIVE_INFINITY;
        return right - left;
      });
    }

    if (effectiveSort === "name_az") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (effectiveSort === "name_za") {
      items.sort((a, b) => b.title.localeCompare(a.title));
    }

    return items;
  }, [products, query, selectedCategoryIds, stock, sortBy, showPrice, priceBounds.hasPricedProducts, rangeMin, rangeMax]);

  function resetFilters() {
    setQuery("");
    setSelectedCategoryIds([]);
    setStock("all");
    setRangeMin(priceBounds.min);
    setRangeMax(priceBounds.max);
    setSortBy("featured");
  }

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  function onChangeMinSlider(nextValue: number) {
    setRangeMin(nextValue);
    setRangeMax((current) => Math.max(current, nextValue));
  }

  function onChangeMaxSlider(nextValue: number) {
    setRangeMax(nextValue);
    setRangeMin((current) => Math.min(current, nextValue));
  }

  return (
    <div className="space-y-6">
      <section className="soft-card rounded-3xl p-5 md:p-6">
        <h2 className="text-2xl font-black md:text-3xl">Search & Filter Products</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {showPrice
            ? "Filter by name, category, stock, and price range. Sort by price or name."
            : "Filter by name, category, and stock. Sort by featured or name."}
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input
            className="input-plain"
            placeholder="Search by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            className="input-plain"
            value={stock}
            onChange={(event) => setStock(event.target.value as StockFilter)}
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="out_stock">Out of Stock</option>
          </select>

          <select
            className="input-plain"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortFilter)}
          >
            <option value="featured">Featured First</option>
            {showPrice ? <option value="price_low">Price: Low to High</option> : null}
            {showPrice ? <option value="price_high">Price: High to Low</option> : null}
            <option value="name_az">Name: A to Z</option>
            <option value="name_za">Name: Z to A</option>
          </select>

          <div className="rounded-2xl border border-outline-variant/45 bg-surface-container-low p-3 md:col-span-2 lg:col-span-3">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setShowCategoryFilters((prev) => !prev)}
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Categories</p>
              <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-xs font-bold text-primary">
                {showCategoryFilters ? "Hide" : "Show"}
              </span>
            </button>

            {showCategoryFilters ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedCategoryIds.length === 0
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                  }`}
                  onClick={() => setSelectedCategoryIds([])}
                >
                  All Categories
                </button>
                {categories.map((category) => {
                  const selected = selectedCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={selected}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selected
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {showPrice ? (
            <div className="rounded-2xl border border-outline-variant/45 bg-surface-container-low p-4 md:col-span-2 lg:col-span-3">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setShowPriceFilters((prev) => !prev)}
              >
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Price Range</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-secondary">
                    {formatOptionalINR(rangeMin)} - {formatOptionalINR(rangeMax)}
                  </p>
                  <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-xs font-bold text-primary">
                    {showPriceFilters ? "Hide" : "Show"}
                  </span>
                </div>
              </button>

              {showPriceFilters ? (
                <>
                  {priceBounds.hasPricedProducts ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-on-surface-variant">Min Price</p>
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          step={sliderStep}
                          value={rangeMin}
                          onChange={(event) => onChangeMinSlider(Number(event.target.value))}
                          className="mt-2 w-full accent-primary"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface-variant">Max Price</p>
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          step={sliderStep}
                          value={rangeMax}
                          onChange={(event) => onChangeMaxSlider(Number(event.target.value))}
                          className="mt-2 w-full accent-secondary"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-on-surface-variant">No priced products available for range filtering.</p>
                  )}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
          <p className="text-sm font-semibold text-on-surface-variant">{filteredProducts.length} product(s) found</p>
        </div>
      </section>

      {filteredProducts.length ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-3xl soft-card">
              <Link href={`/product/${item.slug}`} className="relative block h-56 bg-surface-container-low">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : null}
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {item.category?.name || "Stationery"}
                </div>
                <div
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                    item.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.inStock ? "In Stock" : "Out of Stock"}
                </div>
              </Link>

              <div className="space-y-2 p-4">
                <h3 className="break-words text-xl font-black leading-tight">{item.title}</h3>
                <p className="line-clamp-2 text-sm text-on-surface-variant">{item.shortDescription}</p>
                <p className="js-quantity text-xs font-semibold text-on-surface-variant">Available qty: {item.stockCount}</p>
                <div className="flex items-center justify-between pt-1">
                  <p className="js-price text-lg font-black text-secondary">{formatOptionalINR(item.price)}</p>
                  <Link href={`/product/${item.slug}`} className="btn-primary !rounded-full !px-4 !py-2">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="soft-card rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-black">No matching products</h3>
          <p className="mt-2 text-on-surface-variant">Try changing filters or clear all filters to see everything.</p>
        </section>
      )}
    </div>
  );
}

