export type UserRole = "user" | "admin";

export type TicketStatus = "open" | "in_progress" | "resolved";

export type ProductView = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  inStock: boolean;
  stockCount: number;
  featured: boolean;
};
