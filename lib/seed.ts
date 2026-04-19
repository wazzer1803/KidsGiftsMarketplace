import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category";
import ProductModel from "@/lib/models/Product";
import UserModel from "@/lib/models/User";
import { getAdminPhoneAllowlist } from "@/lib/auth";

const legacyCategorySlugs = [
  "doodle-diaries",
  "galaxy-pens",
  "glitter-stickers",
  "art-and-craft-kits",
  "school-essentials",
  "coloring-books",
  "washi-tape-decor",
  "pencil-cases-organizers",
  "geometry-math-tools",
  "calligraphy-lettering"
];

const legacyProductSlugs = [
  "glitter-galaxy-notebook",
  "botanical-sketcher-diary",
  "neon-dream-gel-pens",
  "super-nova-brush-marker-set",
  "iridescent-butterfly-decals",
  "magic-sticker-mega-pack",
  "pastel-dreams-craft-box",
  "dreamy-dew-brush-set",
  "adventure-school-combo",
  "classroom-geometry-essentials",
  "rainbow-quest-coloring-book",
  "stardust-washi-tape-set",
  "pop-up-pencil-organizer",
  "math-wizard-geometry-box",
  "lettering-starter-calligraphy-set"
];

const seedCategories = [
  {
    name: "Bottle / Sipper / Stanley",
    slug: "bottle-sipper-stanley",
    description: "Durable bottles and sippers for school, sports, and travel.",
    heroImage:
      "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#22c55e",
    position: 1
  },
  {
    name: "Return Gift",
    slug: "return-gift",
    description: "Cute and affordable return gift packs for birthdays and school events.",
    heroImage:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#f43f5e",
    position: 2
  },
  {
    name: "Household Product",
    slug: "household-product",
    description: "Daily-use household helpers that are useful for kids and parents.",
    heroImage:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#0ea5e9",
    position: 3
  },
  {
    name: "Pouch / Pencil Box",
    slug: "pouch-pencil-box",
    description: "Pouches and pencil boxes with fun designs and easy organization.",
    heroImage:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#a855f7",
    position: 4
  },
  {
    name: "Bags",
    slug: "bags",
    description: "School bags, mini backpacks, and carry bags for all age groups.",
    heroImage:
      "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#3b82f6",
    position: 5
  },
  {
    name: "Lunch Box",
    slug: "lunch-box",
    description: "Smart lunch boxes with leak-proof compartments and kid-safe materials.",
    heroImage:
      "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#f59e0b",
    position: 6
  },
  {
    name: "Toys",
    slug: "toys",
    description: "Learning and fun toys to keep kids active, creative, and engaged.",
    heroImage:
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#ef4444",
    position: 7
  },
  {
    name: "Fancy Eraser",
    slug: "fancy-eraser",
    description: "Colorful fancy erasers in playful shapes kids love to collect.",
    heroImage:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#14b8a6",
    position: 8
  }
];

const seedProducts = [
  {
    title: "Insulated Stanley Style Bottle",
    slug: "insulated-stanley-style-bottle",
    shortDescription: "Large insulated bottle for long school days.",
    description: "Keeps drinks cool for hours with a strong handle and spill-safe lid.",
    price: 1299,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80"],
    tags: ["featured", "new"],
    inStock: true,
    stockCount: 40,
    featured: true,
    categorySlug: "bottle-sipper-stanley"
  },
  {
    title: "Kids Flip-Top Sipper",
    slug: "kids-flip-top-sipper",
    shortDescription: "Lightweight daily-use sipper for kids.",
    description: "Easy one-click opening with leak-resistant lock and carrying strap.",
    price: 499,
    images: ["https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80"],
    tags: ["daily-use"],
    inStock: true,
    stockCount: 65,
    featured: false,
    categorySlug: "bottle-sipper-stanley"
  },
  {
    title: "Birthday Return Gift Combo Pack",
    slug: "birthday-return-gift-combo-pack",
    shortDescription: "10-piece return gift combo set.",
    description: "Includes mini stationery, stickers, and toy goodies in one pack.",
    price: 899,
    images: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80"],
    tags: ["party", "combo"],
    inStock: true,
    stockCount: 30,
    featured: true,
    categorySlug: "return-gift"
  },
  {
    title: "Mini Surprise Gift Pouches",
    slug: "mini-surprise-gift-pouches",
    shortDescription: "Colorful pouches ideal for return gifts.",
    description: "Pre-filled mini gifts for school events, birthdays, and playdates.",
    price: 350,
    images: ["https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80"],
    tags: ["gift"],
    inStock: true,
    stockCount: 78,
    featured: false,
    categorySlug: "return-gift"
  },
  {
    title: "Drawer Organizer Set",
    slug: "drawer-organizer-set",
    shortDescription: "Household organizer trays set of 4.",
    description: "Neat storage for crayons, clips, and daily-use desk items.",
    price: 699,
    images: ["https://images.unsplash.com/photo-1633526543814-9718c8922b7a?auto=format&fit=crop&w=1200&q=80"],
    tags: ["household"],
    inStock: true,
    stockCount: 26,
    featured: false,
    categorySlug: "household-product"
  },
  {
    title: "Multipurpose Storage Basket",
    slug: "multipurpose-storage-basket",
    shortDescription: "Compact basket for books and accessories.",
    description: "Durable household basket for study table, toys, or utility use.",
    price: 549,
    images: ["https://images.unsplash.com/photo-1616627459022-7f6d9ab2a5bd?auto=format&fit=crop&w=1200&q=80"],
    tags: ["home"],
    inStock: true,
    stockCount: 19,
    featured: false,
    categorySlug: "household-product"
  },
  {
    title: "Unicorn Zipper Pouch",
    slug: "unicorn-zipper-pouch",
    shortDescription: "Soft zipper pouch with wide opening.",
    description: "Stores pencils, pens, erasers, and sharpeners with cute design.",
    price: 299,
    images: ["https://images.unsplash.com/photo-1556266561-fc43c0c7b6d8?auto=format&fit=crop&w=1200&q=80"],
    tags: ["pouch"],
    inStock: true,
    stockCount: 54,
    featured: false,
    categorySlug: "pouch-pencil-box"
  },
  {
    title: "Hard Case Pencil Box",
    slug: "hard-case-pencil-box",
    shortDescription: "Hard-shell pencil box with compartments.",
    description: "Strong and lightweight case with space for geometry tools.",
    price: 420,
    images: ["https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80"],
    tags: ["school"],
    inStock: true,
    stockCount: 33,
    featured: true,
    categorySlug: "pouch-pencil-box"
  },
  {
    title: "Classic School Backpack",
    slug: "classic-school-backpack",
    shortDescription: "Everyday backpack with padded straps.",
    description: "Multiple compartments with water bottle slots and durable zip.",
    price: 1399,
    images: ["https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80"],
    tags: ["bags", "featured"],
    inStock: true,
    stockCount: 23,
    featured: true,
    categorySlug: "bags"
  },
  {
    title: "Mini Kids Day Bag",
    slug: "mini-kids-day-bag",
    shortDescription: "Light mini bag for toddlers and juniors.",
    description: "Soft, washable, and easy for small kids to carry.",
    price: 799,
    images: ["https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=1200&q=80"],
    tags: ["kids"],
    inStock: true,
    stockCount: 28,
    featured: false,
    categorySlug: "bags"
  },
  {
    title: "Steel Lunch Box Duo",
    slug: "steel-lunch-box-duo",
    shortDescription: "2-compartment steel lunch box.",
    description: "Food-safe compartments that keep lunch fresh and separated.",
    price: 999,
    images: ["https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=1200&q=80"],
    tags: ["lunch", "featured"],
    inStock: true,
    stockCount: 35,
    featured: true,
    categorySlug: "lunch-box"
  },
  {
    title: "Cartoon Lunch Box",
    slug: "cartoon-lunch-box",
    shortDescription: "Colorful lunch box with easy lock.",
    description: "Kid-friendly shape and easy-clean interior for daily school use.",
    price: 599,
    images: ["https://images.unsplash.com/photo-1610465299993-e6675c9f9efa?auto=format&fit=crop&w=1200&q=80"],
    tags: ["lunch"],
    inStock: true,
    stockCount: 47,
    featured: false,
    categorySlug: "lunch-box"
  },
  {
    title: "STEM Building Blocks Kit",
    slug: "stem-building-blocks-kit",
    shortDescription: "Creative toy set with 120 blocks.",
    description: "Encourages imagination, motor skills, and teamwork through play.",
    price: 1499,
    images: ["https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1200&q=80"],
    tags: ["toys", "learning"],
    inStock: true,
    stockCount: 18,
    featured: true,
    categorySlug: "toys"
  },
  {
    title: "Puzzle Play Set",
    slug: "puzzle-play-set",
    shortDescription: "Kids logic puzzle board game.",
    description: "Interactive puzzle set built for memory and problem-solving fun.",
    price: 699,
    images: ["https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80"],
    tags: ["toys"],
    inStock: true,
    stockCount: 29,
    featured: false,
    categorySlug: "toys"
  },
  {
    title: "Dessert Shape Fancy Eraser Set",
    slug: "dessert-shape-fancy-eraser-set",
    shortDescription: "Cute fancy erasers in fun food shapes.",
    description: "Non-toxic mini erasers loved by kids for school and gifting.",
    price: 199,
    images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80"],
    tags: ["eraser", "gift"],
    inStock: true,
    stockCount: 120,
    featured: false,
    categorySlug: "fancy-eraser"
  },
  {
    title: "Animal Fancy Eraser Jar",
    slug: "animal-fancy-eraser-jar",
    shortDescription: "Jar of mixed animal-theme erasers.",
    description: "Value jar with assorted erasers perfect for return gifts and class rewards.",
    price: 349,
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=80"],
    tags: ["eraser", "featured"],
    inStock: true,
    stockCount: 66,
    featured: true,
    categorySlug: "fancy-eraser"
  }
];

let seedPromise: Promise<void> | null = null;
let didLegacyCleanup = false;

export async function ensureSeedData() {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    await connectDB();

    if (!didLegacyCleanup) {
      await ProductModel.deleteMany({ slug: { $in: legacyProductSlugs } });
      await CategoryModel.deleteMany({ slug: { $in: legacyCategorySlugs } });
      didLegacyCleanup = true;
    }

    await CategoryModel.bulkWrite(
      seedCategories.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: {
            $setOnInsert: {
              name: category.name,
              description: category.description,
              heroImage: category.heroImage,
              accentColor: category.accentColor,
              position: category.position
            }
          },
          upsert: true
        }
      }))
    );

    const categories = await CategoryModel.find().lean();
    const categoryMap = new Map(categories.map((item) => [item.slug, item._id]));

    const productOperations = seedProducts
      .map((product) => {
        const categoryId = categoryMap.get(product.categorySlug);

        if (!categoryId) {
          return null;
        }

        return {
          updateOne: {
            filter: { slug: product.slug },
            update: {
              $setOnInsert: {
                title: product.title,
                slug: product.slug,
                shortDescription: product.shortDescription,
                description: product.description,
                price: product.price,
                images: product.images,
                tags: product.tags,
                inStock: product.inStock,
                stockCount: product.stockCount,
                featured: product.featured,
                category: categoryId
              }
            },
            upsert: true
          }
        };
      })
      .filter(Boolean);

    if (productOperations.length) {
      await ProductModel.bulkWrite(productOperations as any[]);
    }

    const adminPhones = getAdminPhoneAllowlist();

    if (adminPhones.length) {
      await UserModel.bulkWrite(
        adminPhones.map((phone) => ({
          updateOne: {
            filter: { phone },
            update: {
              $setOnInsert: {
                phone,
                name: "Marketplace Admin"
              },
              $set: {
                role: "admin"
              }
            },
            upsert: true
          }
        }))
      );
    }
  })().finally(() => {
    seedPromise = null;
  });

  return seedPromise;
}
