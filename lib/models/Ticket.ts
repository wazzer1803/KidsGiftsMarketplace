import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const TicketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open"
    },
    adminNotes: {
      type: String,
      default: ""
    },
    contactPhone: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export type Ticket = InferSchemaType<typeof TicketSchema> & {
  _id: mongoose.Types.ObjectId;
};

const TicketModel =
  (models.Ticket as Model<Ticket>) || mongoose.model<Ticket>("Ticket", TicketSchema);

export default TicketModel;
