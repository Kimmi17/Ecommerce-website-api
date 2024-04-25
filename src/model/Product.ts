import mongoose, { Document, Schema } from "mongoose";

import { Product } from "../misc/type";

export type ProductDocument = Document & Product;

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    default: 10,
  },
  description: {
    type: String,
    default: "This is a product",
  },

  skinType: {
    type: String,
    default: "Normal",
    enum: ["Combination", "Dry", "Oily", "Normal"],
  },

  image: {
    type: [{ type: String }],
    default: "https://picsum.photos/seed/picsum/600/400",
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
});

export default mongoose.model<ProductDocument>("Product", ProductSchema);
