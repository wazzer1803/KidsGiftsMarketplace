import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    title: {
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
    shortDescription: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: false,
      default: null,
      min: 0
    },
    images: {
      type: [String],
      default: []
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockCount: {
      type: Number,
      default: 0,
      min: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export type Product = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

const ProductModel =
  (models.Product as Model<Product>) || mongoose.model<Product>("Product", ProductSchema);

export default ProductModel;
