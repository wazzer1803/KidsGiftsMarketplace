import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import ProductModel from "@/lib/models/Product";
import TicketModel from "@/lib/models/Ticket";
import { getWhatsAppOrderSettings } from "@/lib/whatsapp-order-settings";
import { normalizePhoneForWhatsapp } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const authUser = await getCurrentUserFromToken(token);

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const tickets = await TicketModel.find({ user: authUser.id })
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
        : []
    }))
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const productId = String(body.productId || "").trim();
    const productIdsInput = Array.isArray(body.productIds) ? body.productIds : [];

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }

    const payload: {
      user: string;
      subject: string;
      message: string;
      contactPhone: string;
      product?: mongoose.Types.ObjectId;
      products?: mongoose.Types.ObjectId[];
    } = {
      user: authUser.id,
      subject,
      message,
      contactPhone: authUser.phone
    };

    const linkedProductIds: string[] = [];

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      linkedProductIds.push(productId);
    }

    for (const rawId of productIdsInput) {
      const value = String(rawId || "").trim();
      if (value && mongoose.Types.ObjectId.isValid(value)) {
        linkedProductIds.push(value);
      }
    }

    const uniqueLinkedProductIds = Array.from(new Set(linkedProductIds));
    if (uniqueLinkedProductIds.length) {
      payload.products = uniqueLinkedProductIds.map((id) => new mongoose.Types.ObjectId(id));
      payload.product = payload.products[0];
    }

    await connectDB();
    const ticket = await TicketModel.create(payload);

    const settings = await getWhatsAppOrderSettings();
    const whatsappNumber = normalizePhoneForWhatsapp(settings.activeWhatsappNumber || "");
    const linkedProducts = payload.products?.length
      ? await ProductModel.find({ _id: { $in: payload.products } }).select("title").lean()
      : [];
    const productTitleLine = linkedProducts.length
      ? `Products: ${linkedProducts.map((item) => item.title).join(", ")}`
      : "";

    const whatsappMessage = [
      "New ticket from Home And Kids Corner",
      `Ticket ID: ${ticket._id.toString()}`,
      `Phone: ${authUser.phone}`,
      productTitleLine,
      `Subject: ${subject}`,
      `Message: ${message}`
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappLink = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
      : null;

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id.toString(),
        subject: ticket.subject,
        status: ticket.status
      },
      whatsappLink
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
