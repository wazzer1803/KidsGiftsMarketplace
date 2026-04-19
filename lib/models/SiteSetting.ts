import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const SiteSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "display"
    },
    showPrice: {
      type: Boolean,
      default: true
    },
    showQuantity: {
      type: Boolean,
      default: true
    },
    whatsappNumbers: {
      type: [String],
      default: []
    },
    activeWhatsappNumber: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export type SiteSetting = InferSchemaType<typeof SiteSettingSchema> & {
  _id: mongoose.Types.ObjectId;
};

const SiteSettingModel =
  (models.SiteSetting as Model<SiteSetting>) ||
  mongoose.model<SiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSettingModel;
