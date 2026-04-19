import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const WhatsAppOrderConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "order"
    },
    numbers: {
      type: [String],
      default: []
    },
    activeNumber: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export type WhatsAppOrderConfig = InferSchemaType<typeof WhatsAppOrderConfigSchema> & {
  _id: mongoose.Types.ObjectId;
};

const WhatsAppOrderConfigModel =
  (models.WhatsAppOrderConfig as Model<WhatsAppOrderConfig>) ||
  mongoose.model<WhatsAppOrderConfig>("WhatsAppOrderConfig", WhatsAppOrderConfigSchema);

export default WhatsAppOrderConfigModel;

