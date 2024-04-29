import mongoose, { Document, Schema } from "mongoose";

import { Order } from "../misc/type";
import { OrderProductSchema } from "./OrderProduct";

export type OrderDocument = Document & Order;

export const OrderSchema = new mongoose.Schema({
  products: [
    {
      type: OrderProductSchema,
    },
  ],
  totalPrice: {
    type: Number,
  },
  paymentStatus: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "FAILED", "SUCCESSED"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model<OrderDocument>("Order", OrderSchema);
