import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    description: {
      type: String,
      default: ""
    },
    heroImage: {
      type: String,
      default: ""
    },
    accentColor: {
      type: String,
      default: "#f56a4a"
    },
    position: {
      type: Number,
      default: 999,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export type Category = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

const CategoryModel =
  (models.Category as Model<Category>) || mongoose.model<Category>("Category", CategorySchema);

export default CategoryModel;
