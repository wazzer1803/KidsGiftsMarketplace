import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const OtpCodeSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      index: true
    },
    codeHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    consumed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpCodeSchema.index({ phone: 1, email: 1, createdAt: -1 });

export type OtpCode = InferSchemaType<typeof OtpCodeSchema> & {
  _id: mongoose.Types.ObjectId;
};

const OtpCodeModel =
  (models.OtpCode as Model<OtpCode>) || mongoose.model<OtpCode>("OtpCode", OtpCodeSchema);

export default OtpCodeModel;
