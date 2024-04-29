import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import productsRouter from "./routers/productsRouter";
import usersRouter from "./routers/usersRouter";
import categoriesRouter from "./routers/categoriesRouter";
import ordersRouter from "./routers/ordersRouter";
import apiErrorhandler from "./middlewares/apiErrorhandler";
import paymentRouter from "./routers/paymentRouter";
import stripe from "stripe";

const app = express();
app.use(express.json());

dotenv.config({ path: ".env" });
export const Stripe = new stripe(process.env.STRIPE_KEY as string, {
  apiVersion: "2024-04-10",
});
// Enable CORS for all routes
app.use(cors());

app.get("/", (request: Request, response: Response) => {
  response.status(200).json({ message: "Hello world!" });
});

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/payment", paymentRouter);
app.use(apiErrorhandler);

export default app;
