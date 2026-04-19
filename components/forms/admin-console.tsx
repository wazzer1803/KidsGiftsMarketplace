"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  accentColor?: string;
};

type Product = {
  id: string;
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
  category?: { id: string; name: string; slug: string };
};

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  adminNotes?: string;
  contactPhone?: string;
  createdAt: string;
  user?: { name?: string; phone?: string };
  product?: { title?: string };
  products?: Array<{ id: string; title?: string; slug?: string }>;
};

type ProductDraft = {
  title: string;
  shortDescription: string;
  description: string;
  price: string;
  image: string;
  tags: string;
  categoryId: string;
  stockCount: string;
  inStock: boolean;
  featured: boolean;
};

type CategoryDraft = {
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  accentColor: string;
  position: string;
};

type DisplaySettings = {
  showPrice: boolean;
  showQuantity: boolean;
  whatsappNumbers: string[];
  activeWhatsappNumber: string;
};

const defaultDisplaySettings: DisplaySettings = {
  showPrice: true,
  showQuantity: true,
  whatsappNumbers: [],
  activeWhatsappNumber: ""
};

const emptyProduct: ProductDraft = {
  title: "",
  shortDescription: "",
  description: "",
  price: "",
  image: "",
  tags: "",
  categoryId: "",
  stockCount: "0",
  inStock: true,
  featured: false
};

const emptyCategory: CategoryDraft = {
  name: "",
  slug: "",
  description: "",
  heroImage: "",
  accentColor: "#f56a4a",
  position: ""
};

function normalizeDisplaySettings(value?: Partial<DisplaySettings>): DisplaySettings {
  const whatsappNumbers = Array.from(
    new Set(
      (Array.isArray(value?.whatsappNumbers) ? value.whatsappNumbers : [])
        .map((item) => String(item || "").replace(/\D/g, ""))
        .filter(Boolean)
    )
  );
  const activeCandidate = String(value?.activeWhatsappNumber || "").replace(/\D/g, "");
  const activeWhatsappNumber =
    activeCandidate && whatsappNumbers.includes(activeCandidate) ? activeCandidate : whatsappNumbers[0] || "";

  return {
    showPrice: value?.showPrice !== false,
    showQuantity: value?.showQuantity !== false,
    whatsappNumbers,
    activeWhatsappNumber
  };
}

function parseOptionalPrice(raw: string) {
  const value = raw.trim();
  if (!value) {
    return {
      value: null as number | null,
      valid: true
    };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      value: null as number | null,
      valid: false
    };
  }

  return {
    value: parsed,
    valid: true
  };
}

function productPayload(draft: ProductDraft) {
  const priceResult = parseOptionalPrice(draft.price);

  return {
    title: draft.title.trim(),
    shortDescription: draft.shortDescription.trim(),
    description: draft.description.trim(),
    price: priceResult.value,
    categoryId: draft.categoryId,
    images: draft.image.trim() ? [draft.image.trim()] : [],
    tags: draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    stockCount: Math.max(0, Number(draft.stockCount || 0)),
    inStock: draft.inStock,
    featured: draft.featured
  };
}

function fromProduct(product: Product): ProductDraft {
  return {
    title: product.title,
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    price: product.price === null || product.price === undefined ? "" : String(product.price),
    image: product.images?.[0] || "",
    tags: (product.tags || []).join(", "),
    categoryId: product.category?.id || "",
    stockCount: String(product.stockCount || 0),
    inStock: product.inStock,
    featured: product.featured
  };
}

function validateProduct(draft: ProductDraft) {
  if (!draft.categoryId || !draft.title.trim() || !draft.shortDescription.trim() || !draft.description.trim()) {
    return false;
  }

  const priceResult = parseOptionalPrice(draft.price);
  if (!priceResult.valid) {
    return false;
  }

  const stock = Number(draft.stockCount);
  if (!Number.isFinite(stock) || stock < 0) {
    return false;
  }

  return true;
}

export default function AdminConsole() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"products" | "categories" | "tickets" | "display">("products");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<"info" | "error" | "success">("info");
  const [mode, setMode] = useState<"category" | "name">("category");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [createDraft, setCreateDraft] = useState<ProductDraft>(emptyProduct);
  const [editDraft, setEditDraft] = useState<ProductDraft>(emptyProduct);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [savingDisplay, setSavingDisplay] = useState(false);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState("");
  const [uploadingCreateImage, setUploadingCreateImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [migratingImages, setMigratingImages] = useState(false);

  const canRender = useMemo(() => authorized === true, [authorized]);

  async function loadAll() {
    const meRes = await fetch("/api/auth/me", { cache: "no-store" });
    const meData = await meRes.json();

    if (!meData.user || meData.user.role !== "admin") {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);

    const [categoriesRes, productsRes, ticketsRes, settingsRes] = await Promise.all([
      fetch("/api/categories", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" }),
      fetch("/api/admin/tickets", { cache: "no-store" }),
      fetch("/api/admin/settings", { cache: "no-store" })
    ]);

    const categoriesData = await categoriesRes.json();
    const productsData = await productsRes.json();
    const ticketsData = await ticketsRes.json();
    const settingsData = await settingsRes.json();

    setCategories((categoriesData.categories || []) as Category[]);
    setProducts((productsData.products || []) as Product[]);
    setTickets((ticketsData.tickets || []) as Ticket[]);
    setDisplaySettings(normalizeDisplaySettings((settingsData.settings || {}) as Partial<DisplaySettings>));
  }

  useEffect(() => {
    loadAll().catch(() => {
      setStatusTone("error");
      setStatus("Failed to load admin data.");
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let items = [...products];

    if (mode === "category" && selectedCategoryId !== "all") {
      items = items.filter((item) => item.category?.id === selectedCategoryId);
    }

    if (mode === "name" && query.trim()) {
      const normalizedQuery = query.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.slug.toLowerCase().includes(normalizedQuery)
      );
    }

    return items.sort((a, b) => a.title.localeCompare(b.title));
  }, [products, mode, selectedCategoryId, query]);

  async function uploadImageAsset(file: File, kind: "product" | "category") {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("kind", kind);

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: payload
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Image upload failed.");
    }

    return String(data.url || "");
  }

  async function onCreateImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploadingCreateImage(true);
    try {
      const uploadedUrl = await uploadImageAsset(file, "product");
      setCreateDraft((prev) => ({ ...prev, image: uploadedUrl }));
      setStatusTone("success");
      setStatus("Product image uploaded to Cloudinary.");
    } catch (error) {
      setStatusTone("error");
      setStatus(error instanceof Error ? error.message : "Failed to upload product image.");
    } finally {
      setUploadingCreateImage(false);
    }
  }

  async function onEditImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploadingEditImage(true);
    try {
      const uploadedUrl = await uploadImageAsset(file, "product");
      setEditDraft((prev) => ({ ...prev, image: uploadedUrl }));
      setStatusTone("success");
      setStatus("Product edit image uploaded to Cloudinary.");
    } catch (error) {
      setStatusTone("error");
      setStatus(error instanceof Error ? error.message : "Failed to upload image for edit.");
    } finally {
      setUploadingEditImage(false);
    }
  }

  async function onCategoryImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploadingCategoryImage(true);
    try {
      const uploadedUrl = await uploadImageAsset(file, "category");
      setCategoryDraft((prev) => ({ ...prev, heroImage: uploadedUrl }));
      setStatusTone("success");
      setStatus("Category image uploaded to Cloudinary.");
    } catch (error) {
      setStatusTone("error");
      setStatus(error instanceof Error ? error.message : "Failed to upload category image.");
    } finally {
      setUploadingCategoryImage(false);
    }
  }

  async function onMigrateImagesToCloudinary() {
    setMigratingImages(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/media/migrate", {
        method: "POST"
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to migrate images.");
      }

      const summary = data.summary || {};
      const migratedProducts = Number(summary.productImagesMigrated || 0);
      const migratedCategories = Number(summary.categoryImagesMigrated || 0);
      const failed = Number(summary.failures || 0);
      const brandHint = data.recommendedBrandLogoUrl
        ? ` Set NEXT_PUBLIC_BRAND_LOGO_URL=${data.recommendedBrandLogoUrl} in .env.local and restart the app.`
        : "";

      setStatusTone(failed > 0 ? "info" : "success");
      setStatus(
        `Cloudinary migration completed. Products migrated: ${migratedProducts}, categories migrated: ${migratedCategories}, failures: ${failed}.${brandHint}`
      );

      await loadAll();
    } catch (error) {
      setStatusTone("error");
      setStatus(error instanceof Error ? error.message : "Image migration failed.");
    } finally {
      setMigratingImages(false);
    }
  }

  async function onCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateProduct(createDraft)) {
      setStatusTone("error");
      setStatus("Please fill product fields correctly. Price is optional but must be valid if provided.");
      return;
    }

    setCreating(true);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productPayload(createDraft))
    });

    const data = await res.json();

    if (!res.ok) {
      setCreating(false);
      setStatusTone("error");
      setStatus(data.error || "Could not add product.");
      return;
    }

    setCreateDraft(emptyProduct);
    setStatusTone("success");
    setStatus("Product added.");
    await loadAll();
    setCreating(false);
  }

  async function onSaveProduct(productId: string) {
    if (!validateProduct(editDraft)) {
      setStatusTone("error");
      setStatus("Please fill product fields correctly. Price is optional but must be valid if provided.");
      return;
    }

    setSaving(true);

    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productPayload(editDraft))
    });

    const data = await res.json();

    if (!res.ok) {
      setSaving(false);
      setStatusTone("error");
      setStatus(data.error || "Could not save product.");
      return;
    }

    setStatusTone("success");
    setStatus("Product updated.");
    setEditingId(null);
    setEditDraft(emptyProduct);
    await loadAll();
    setSaving(false);
  }

  async function onDeleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.title}?`)) {
      return;
    }

    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });

    if (!res.ok) {
      setStatusTone("error");
      setStatus("Could not delete product.");
      return;
    }

    setStatusTone("success");
    setStatus("Product deleted.");
    await loadAll();
  }

  async function onCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryDraft.name.trim()) {
      setStatusTone("error");
      setStatus("Category name is required.");
      return;
    }

    setCreatingCategory(true);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: categoryDraft.name,
        slug: categoryDraft.slug,
        description: categoryDraft.description,
        heroImage: categoryDraft.heroImage,
        accentColor: categoryDraft.accentColor,
        position: categoryDraft.position ? Number(categoryDraft.position) : undefined
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setCreatingCategory(false);
      setStatusTone("error");
      setStatus(data.error || "Could not add category.");
      return;
    }

    setCategoryDraft(emptyCategory);
    setStatusTone("success");
    setStatus("Category added.");
    await loadAll();
    setCreatingCategory(false);
  }

  async function onUpdateTicket(event: FormEvent<HTMLFormElement>, ticket: Ticket) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const res = await fetch(`/api/admin/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: formData.get("status"),
        adminNotes: formData.get("adminNotes")
      })
    });

    if (!res.ok) {
      setStatusTone("error");
      setStatus("Could not update ticket.");
      return;
    }

    setStatusTone("success");
    setStatus("Ticket updated.");
    await loadAll();
  }

  async function onSaveDisplaySettings() {
    setSavingDisplay(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(displaySettings)
    });

    const data = await res.json();

    if (!res.ok) {
      setSavingDisplay(false);
      setStatusTone("error");
      setStatus(data.error || "Could not save display and WhatsApp settings.");
      return;
    }

    setDisplaySettings(normalizeDisplaySettings((data.settings || {}) as Partial<DisplaySettings>));
    setSavingDisplay(false);
    setStatusTone("success");
    setStatus("Display and WhatsApp settings saved.");
  }

  function onAddWhatsappNumber() {
    const normalized = newWhatsappNumber.replace(/\D/g, "");

    if (!normalized) {
      setStatusTone("error");
      setStatus("Enter a valid WhatsApp number.");
      return;
    }

    setDisplaySettings((prev) => {
      if (prev.whatsappNumbers.includes(normalized)) {
        return {
          ...prev,
          activeWhatsappNumber: normalized
        };
      }

      const whatsappNumbers = [...prev.whatsappNumbers, normalized];
      return {
        ...prev,
        whatsappNumbers,
        activeWhatsappNumber: prev.activeWhatsappNumber || normalized
      };
    });
    setNewWhatsappNumber("");
    setStatusTone("info");
    setStatus("WhatsApp number added. Click save to apply.");
  }

  function onRemoveWhatsappNumber(phone: string) {
    setDisplaySettings((prev) => {
      const whatsappNumbers = prev.whatsappNumbers.filter((item) => item !== phone);
      return {
        ...prev,
        whatsappNumbers,
        activeWhatsappNumber:
          prev.activeWhatsappNumber === phone ? whatsappNumbers[0] || "" : prev.activeWhatsappNumber
      };
    });
    setStatusTone("info");
    setStatus("WhatsApp number removed. Click save to apply.");
  }

  if (authorized === null) {
    return <div className="soft-card rounded-3xl p-6">Checking admin access...</div>;
  }

  if (!canRender) {
    return (
      <div className="soft-card rounded-3xl p-6">
        <h2 className="text-2xl font-black">Admin access only</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Only numbers in `ADMIN_PHONES` or `ADMIN_PHONE` can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          className={`btn-secondary ${tab === "products" ? "!bg-primary !text-on-primary" : ""}`}
          onClick={() => setTab("products")}
          type="button"
        >
          Products
        </button>
        <button
          className={`btn-secondary ${tab === "categories" ? "!bg-primary !text-on-primary" : ""}`}
          onClick={() => setTab("categories")}
          type="button"
        >
          Categories
        </button>
        <button
          className={`btn-secondary ${tab === "tickets" ? "!bg-primary !text-on-primary" : ""}`}
          onClick={() => setTab("tickets")}
          type="button"
        >
          Tickets
        </button>
        <button
          className={`btn-secondary ${tab === "display" ? "!bg-primary !text-on-primary" : ""}`}
          onClick={() => setTab("display")}
          type="button"
        >
          Display & WhatsApp
        </button>
        <button
          className="btn-secondary"
          type="button"
          disabled={migratingImages}
          onClick={() => void onMigrateImagesToCloudinary()}
        >
          {migratingImages ? "Migrating Images..." : "Migrate Existing Images to Cloudinary"}
        </button>
      </div>

      {status ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            statusTone === "success"
              ? "bg-emerald-100 text-emerald-700"
              : statusTone === "error"
                ? "bg-red-100 text-red-700"
                : "bg-secondary/10 text-secondary"
          }`}
        >
          {status}
        </p>
      ) : null}

      {tab === "products" ? (
        <div className="space-y-6">
          <form onSubmit={onCreateProduct} className="soft-card grid gap-4 rounded-3xl p-6 md:grid-cols-2 md:p-8">
            <h3 className="text-2xl font-black md:col-span-2">Add Product</h3>

            <select
              className="input-plain"
              value={createDraft.categoryId}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              className="input-plain"
              placeholder="Product name"
              value={createDraft.title}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, title: event.target.value }))}
            />

            <input
              type="number"
              min={0}
              className="input-plain"
              placeholder="Price (optional)"
              value={createDraft.price}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, price: event.target.value }))}
            />

            <input
              type="number"
              min={0}
              className="input-plain"
              placeholder="Stock count"
              value={createDraft.stockCount}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, stockCount: event.target.value }))}
            />

            <input
              className="input-plain md:col-span-2"
              placeholder="Short description"
              value={createDraft.shortDescription}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, shortDescription: event.target.value }))}
            />

            <textarea
              rows={4}
              className="input-plain md:col-span-2"
              placeholder="Full description"
              value={createDraft.description}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, description: event.target.value }))}
            />

            <input
              className="input-plain"
              placeholder="Image URL"
              value={createDraft.image}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, image: event.target.value }))}
            />

            <label className="flex flex-col gap-2 rounded-2xl border border-outline-variant/45 bg-surface-container-low p-3 text-xs font-semibold text-on-surface-variant">
              Upload image to Cloudinary
              <input
                type="file"
                accept="image/*"
                className="input-plain"
                onChange={(event) => void onCreateImageUpload(event)}
                disabled={uploadingCreateImage}
              />
            </label>

            <input
              className="input-plain"
              placeholder="Tags: new, featured"
              value={createDraft.tags}
              onChange={(event) => setCreateDraft((prev) => ({ ...prev, tags: event.target.value }))}
            />

            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={createDraft.inStock}
                onChange={(event) => setCreateDraft((prev) => ({ ...prev, inStock: event.target.checked }))}
              />
              In Stock
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={createDraft.featured}
                onChange={(event) => setCreateDraft((prev) => ({ ...prev, featured: event.target.checked }))}
              />
              Featured
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button className="btn-primary" disabled={creating}>
                {creating ? "Adding..." : "Add Product"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setCreateDraft(emptyProduct)}>
                Reset
              </button>
            </div>
          </form>

          <div className="soft-card space-y-4 rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black">Find & Edit Products</h3>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={`btn-secondary ${mode === "category" ? "!bg-primary !text-on-primary" : ""}`}
                onClick={() => setMode("category")}
              >
                Search by Category
              </button>
              <button
                type="button"
                className={`btn-secondary ${mode === "name" ? "!bg-primary !text-on-primary" : ""}`}
                onClick={() => setMode("name")}
              >
                Search by Name
              </button>
            </div>

            {mode === "category" ? (
              <select
                className="input-plain max-w-md"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input-plain max-w-md"
                placeholder="Search product name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            )}

            <p className="text-sm font-semibold text-on-surface-variant">{filteredProducts.length} product(s) found</p>

            <div className="space-y-4">
              {filteredProducts.map((item) => (
                <article key={item.id} className="rounded-2xl border border-outline-variant/45 bg-surface-container-low p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                        {item.category?.name || "No category"}
                      </p>
                      <h4 className="text-2xl font-black">{item.title}</h4>
                      <p className="text-sm text-on-surface-variant">/{item.slug}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditDraft(fromProduct(item));
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary !border-red-300 !text-red-700"
                        type="button"
                        onClick={() => void onDeleteProduct(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <form
                      className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void onSaveProduct(item.id);
                      }}
                    >
                      <select
                        className="input-plain"
                        value={editDraft.categoryId}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, categoryId: event.target.value }))}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        className="input-plain"
                        value={editDraft.title}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, title: event.target.value }))}
                      />

                      <input
                        type="number"
                        min={0}
                        className="input-plain"
                        placeholder="Price (optional)"
                        value={editDraft.price}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, price: event.target.value }))}
                      />

                      <input
                        type="number"
                        min={0}
                        className="input-plain"
                        value={editDraft.stockCount}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, stockCount: event.target.value }))}
                      />

                      <input
                        className="input-plain md:col-span-2"
                        value={editDraft.shortDescription}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, shortDescription: event.target.value }))}
                      />

                      <textarea
                        rows={3}
                        className="input-plain md:col-span-2"
                        value={editDraft.description}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, description: event.target.value }))}
                      />

                      <input
                        className="input-plain"
                        value={editDraft.image}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, image: event.target.value }))}
                      />

                      <label className="flex flex-col gap-2 rounded-2xl border border-outline-variant/45 bg-surface-container-low p-3 text-xs font-semibold text-on-surface-variant">
                        Upload replacement image to Cloudinary
                        <input
                          type="file"
                          accept="image/*"
                          className="input-plain"
                          onChange={(event) => void onEditImageUpload(event)}
                          disabled={uploadingEditImage}
                        />
                      </label>

                      <input
                        className="input-plain"
                        value={editDraft.tags}
                        onChange={(event) => setEditDraft((prev) => ({ ...prev, tags: event.target.value }))}
                      />

                      <label className="inline-flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={editDraft.inStock}
                          onChange={(event) => setEditDraft((prev) => ({ ...prev, inStock: event.target.checked }))}
                        />
                        In Stock
                      </label>

                      <label className="inline-flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={editDraft.featured}
                          onChange={(event) => setEditDraft((prev) => ({ ...prev, featured: event.target.checked }))}
                        />
                        Featured
                      </label>

                      <div className="flex flex-wrap gap-3 md:col-span-2">
                        <button className="btn-primary" disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft(emptyProduct);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "categories" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <form onSubmit={onCreateCategory} className="soft-card grid gap-4 rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black">Add Category</h3>

            <input
              className="input-plain"
              placeholder="Category name"
              value={categoryDraft.name}
              onChange={(event) => setCategoryDraft((prev) => ({ ...prev, name: event.target.value }))}
            />

            <input
              className="input-plain"
              placeholder="Slug (optional)"
              value={categoryDraft.slug}
              onChange={(event) => setCategoryDraft((prev) => ({ ...prev, slug: event.target.value }))}
            />

            <textarea
              rows={3}
              className="input-plain"
              placeholder="Description"
              value={categoryDraft.description}
              onChange={(event) => setCategoryDraft((prev) => ({ ...prev, description: event.target.value }))}
            />

            <input
              className="input-plain"
              placeholder="Hero image URL"
              value={categoryDraft.heroImage}
              onChange={(event) => setCategoryDraft((prev) => ({ ...prev, heroImage: event.target.value }))}
            />

            <label className="flex flex-col gap-2 rounded-2xl border border-outline-variant/45 bg-surface-container-low p-3 text-xs font-semibold text-on-surface-variant">
              Upload category image to Cloudinary
              <input
                type="file"
                accept="image/*"
                className="input-plain"
                onChange={(event) => void onCategoryImageUpload(event)}
                disabled={uploadingCategoryImage}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="color"
                className="input-plain h-12"
                value={categoryDraft.accentColor}
                onChange={(event) => setCategoryDraft((prev) => ({ ...prev, accentColor: event.target.value }))}
              />
              <input
                type="number"
                min={1}
                className="input-plain"
                placeholder="Position (optional)"
                value={categoryDraft.position}
                onChange={(event) => setCategoryDraft((prev) => ({ ...prev, position: event.target.value }))}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" disabled={creatingCategory}>
                {creatingCategory ? "Adding..." : "Add Category"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setCategoryDraft(emptyCategory)}>
                Reset
              </button>
            </div>
          </form>

          <div className="soft-card rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black">All Categories ({categories.length})</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <article key={category.id} className="overflow-hidden rounded-2xl border border-outline-variant/45 bg-surface-container-low">
                  {category.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={category.heroImage} alt={category.name} className="h-24 w-full object-cover" />
                  ) : (
                    <div className="h-24 w-full" style={{ backgroundColor: category.accentColor || "#f56a4a" }} />
                  )}
                  <div className="p-3">
                    <p className="font-black">{category.name}</p>
                    <p className="text-xs text-on-surface-variant">/{category.slug}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "tickets" ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <form key={ticket.id} className="soft-card rounded-3xl p-5" onSubmit={(event) => void onUpdateTicket(event, ticket)}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    {ticket.user?.name || "Anonymous"} - {ticket.contactPhone || ticket.user?.phone || "No phone"}
                  </p>
                  <h4 className="text-2xl font-black">{ticket.subject}</h4>
                  <p className="mt-1 text-sm text-on-surface-variant">{ticket.message}</p>
                  {ticket.product?.title ? (
                    <p className="mt-1 text-xs font-semibold text-secondary">Product: {ticket.product.title}</p>
                  ) : null}
                  {ticket.products && ticket.products.length > 1 ? (
                    <p className="mt-1 text-xs font-semibold text-secondary">
                      Linked products: {ticket.products.map((item) => item.title || item.id).join(", ")}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs text-on-surface-variant">{new Date(ticket.createdAt).toLocaleString("en-IN")}</p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <select name="status" defaultValue={ticket.status} className="input-plain">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <textarea
                  name="adminNotes"
                  defaultValue={ticket.adminNotes || ""}
                  rows={3}
                  className="input-plain md:col-span-2"
                  placeholder="Admin notes"
                />
              </div>

              <button className="btn-primary mt-4">Save Ticket Update</button>
            </form>
          ))}

          {tickets.length === 0 ? (
            <p className="rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">No tickets found.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "display" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <div className="soft-card rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black">Storefront Display & WhatsApp</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Control storefront visibility and choose the active WhatsApp number for order enquiries.
            </p>

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/45 bg-surface-container-low px-4 py-3">
                <div>
                  <p className="font-semibold">Show Price</p>
                  <p className="text-xs text-on-surface-variant">Display price on cards, search, cart, and product page.</p>
                </div>
                <input
                  type="checkbox"
                  checked={displaySettings.showPrice}
                  onChange={(event) =>
                    setDisplaySettings((prev) => ({
                      ...prev,
                      showPrice: event.target.checked
                    }))
                  }
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/45 bg-surface-container-low px-4 py-3">
                <div>
                  <p className="font-semibold">Show Quantity</p>
                  <p className="text-xs text-on-surface-variant">Display available stock quantity labels on storefront.</p>
                </div>
                <input
                  type="checkbox"
                  checked={displaySettings.showQuantity}
                  onChange={(event) =>
                    setDisplaySettings((prev) => ({
                      ...prev,
                      showQuantity: event.target.checked
                    }))
                  }
                />
              </label>

              <div className="rounded-2xl border border-outline-variant/45 bg-surface-container-low p-4">
                <p className="font-semibold">WhatsApp Order Numbers</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Add one or more numbers and select which number receives new order enquiries.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="input-plain min-w-[220px] flex-1"
                    placeholder="Add number, e.g. 918692088987"
                    value={newWhatsappNumber}
                    onChange={(event) => setNewWhatsappNumber(event.target.value)}
                  />
                  <button type="button" className="btn-secondary" onClick={onAddWhatsappNumber}>
                    Add Number
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {displaySettings.whatsappNumbers.length ? (
                    displaySettings.whatsappNumbers.map((phone) => (
                      <div
                        key={phone}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/45 bg-surface px-3 py-2"
                      >
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
                          <input
                            type="radio"
                            name="active-whatsapp-number"
                            checked={displaySettings.activeWhatsappNumber === phone}
                            onChange={() =>
                              setDisplaySettings((prev) => ({
                                ...prev,
                                activeWhatsappNumber: phone
                              }))
                            }
                          />
                          {phone}
                        </label>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600"
                          onClick={() => onRemoveWhatsappNumber(phone)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl bg-surface px-3 py-2 text-xs text-on-surface-variant">
                      No WhatsApp number added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button className="btn-primary mt-6" disabled={savingDisplay} onClick={() => void onSaveDisplaySettings()}>
              {savingDisplay ? "Saving..." : "Save Display & WhatsApp Settings"}
            </button>
          </div>

          <div className="soft-card rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black">Preview Impact</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface-variant">
                Price visibility:{" "}
                <span className="font-bold text-on-surface">{displaySettings.showPrice ? "Visible" : "Hidden"}</span>
              </p>
              <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface-variant">
                Quantity visibility:{" "}
                <span className="font-bold text-on-surface">{displaySettings.showQuantity ? "Visible" : "Hidden"}</span>
              </p>
              <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface-variant">
                Active WhatsApp number:{" "}
                <span className="font-bold text-on-surface">
                  {displaySettings.activeWhatsappNumber || "Not configured"}
                </span>
              </p>
              <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface-variant">
                Applies on home cards, category pages, product page, product search, and cart views.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
