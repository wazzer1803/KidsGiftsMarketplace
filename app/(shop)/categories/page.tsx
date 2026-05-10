import Image from "@/components/ui/app-image";
import Link from "next/link";
import SectionTitle from "@/components/section-title";
import { getCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const categoriesRaw = await getCategories();

  const categories = categoriesRaw.map((category: any) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    heroImage: category.heroImage,
    accentColor: category.accentColor
  }));

  return (
    <div className="space-y-10">
      <section className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">The Atelier</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
          Choose Your <span className="italic text-primary">Creative Adventure</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant md:text-lg">
          Clean alignment and smoother transitions built for quick browsing.
        </p>
        <Link href="/products" className="btn-primary mt-5">
          Open Product Search & Filters
        </Link>
      </section>

      <section>
        <SectionTitle
          eyebrow="Category Worlds"
          title={`Browse All ${categories.length} Stationery Categories`}
          subtitle="Each category has a structured card layout with consistent height and motion."
        />

        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative flex h-full min-h-[280px] overflow-hidden rounded-3xl soft-card transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:min-h-[320px]"
            >
              <div className="absolute inset-0">
                {category.heroImage ? (
                  <Image
                    src={category.heroImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full" style={{ backgroundColor: category.accentColor || "#f56a4a" }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              </div>

              <div className="relative z-10 mt-auto p-6">
                <span
                  className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                  style={{ backgroundColor: category.accentColor || "#f56a4a" }}
                >
                  Explore
                </span>
                <h2 className="break-words text-2xl font-black text-white sm:text-3xl">{category.name}</h2>
                <p className="mt-2 line-clamp-3 max-w-lg text-sm text-white/85">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-secondary p-8 text-on-secondary md:p-10">
        <h2 className="text-3xl font-black md:text-4xl">Not sure where to start?</h2>
        <p className="mt-2 max-w-3xl text-on-secondary/80">
          Open any product and use the WhatsApp button to ask availability, pricing, or bundle customization instantly.
        </p>
      </section>
    </div>
  );
}

