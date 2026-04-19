import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TicketModel from "@/lib/models/Ticket";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Params) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
    }

    const body = await request.json();

    const ticket = await TicketModel.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const allowedStatuses = new Set(["open", "in_progress", "resolved"]);

    if (body.status && allowedStatuses.has(body.status)) {
      ticket.status = body.status;
    }

    if (body.adminNotes !== undefined) {
      ticket.adminNotes = String(body.adminNotes || "").slice(0, 800);
    }

    await ticket.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
