import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectDB() {
  if (cache.conn) {
    return cache.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it in your .env.local file.");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "kids_marketplace"
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
