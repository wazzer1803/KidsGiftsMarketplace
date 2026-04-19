import mongoose, { InferSchemaType, Model, models, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    passwordHash: {
      type: String,
      default: ""
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

export type User = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

const UserModel = (models.User as Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;
