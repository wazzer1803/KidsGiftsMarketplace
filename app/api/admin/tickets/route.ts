import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TicketModel from "@/lib/models/Ticket";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const authUser = await getCurrentUserFromToken(token);

  if (!authUser || authUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const tickets = await TicketModel.find()
    .populate("user", "name phone")
    .populate("product", "title slug")
    .populate("products", "title slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    tickets: tickets.map((ticket) => ({
      id: ticket._id.toString(),
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      adminNotes: ticket.adminNotes,
      contactPhone: ticket.contactPhone,
      createdAt: ticket.createdAt,
      product: ticket.product,
      products: Array.isArray((ticket as any).products)
        ? (ticket as any).products.map((item: any) => ({
            id: item?._id?.toString?.() || "",
            title: item?.title || "",
            slug: item?.slug || ""
          }))
        : [],
      user: ticket.user
    }))
  });
}
