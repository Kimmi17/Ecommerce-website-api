import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { OrderProductSchema } from "../model/OrderProduct";
import { ObjectId } from "mongodb";

import User, { UserDocument } from "../model/User";
import { BadRequest, NotFoundError } from "../errors/ApiError";
import Order, { OrderDocument } from "../model/Order";
import { DecodedUser, Product } from "../misc/type";
import { Stripe } from "../app";
import ordersService from "../services/orders";
import jwt from "jsonwebtoken";

type Body = {
  receipt_email: String;
  order: (Product & {
    quantity: number;
    _id: string;
  })[];
};
export async function stripePayment(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      next(new BadRequest());
    }

    const JWT_SECRET = process.env.JWT_SECRET as string;

    const token = authHeader!.split(" ")[1];
    const { _id: userId } = (await jwt.verify(
      token,
      JWT_SECRET
    )) as DecodedUser;

    const { receipt_email, order } = request.body as Body;
    const orderProducts = order.map((product) => ({
      productId: product._id,
      quantity: product.quantity,
    }));

    const totalPrice = order.reduce((acc, order) => {
      return (acc + order.price * order.quantity) * 100;
    }, 0);

    const newData = new Order({
      products: orderProducts,
      totalPrice,
      paymentStatus: "PENDING",
    });
    const newOrder = await ordersService.createOrder(newData);

    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder } });

    const orderId = newOrder._id.toString();
    const purchasingItems = order.map((product) => {
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.title,
            images: [product.images],
          },
          unit_amount_decimal: `${product.price * product.quantity * 100}`,
        },
        quantity: product.quantity,
      };
    });
    const session = await Stripe.checkout.sessions.create({
      line_items: purchasingItems,
      mode: "payment",
      success_url: `http://localhost:3000/order/success/${orderId}`,
      cancel_url: `http://localhost:3000/order/cancel/${orderId}`,
    });
    response.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error && error.name == "ValidationError") {
      next(new BadRequest());
    } else {
      next(error);
    }
  }
}
export async function paymentSuccess(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const updateOrder = await ordersService.updateOrderPaymentStatus(
      request.params.orderId,
      "SUCCESSED"
    );

    response.json({ order: updateOrder });
  } catch (error) {
    if (error instanceof Error && error.name == "ValidationError") {
      next(new BadRequest());
    } else {
      next(error);
    }
  }
}

export async function paymentCancel(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const updateOrder = await ordersService.updateOrderPaymentStatus(
      request.params.orderId,
      "FAILED"
    );

    response.json({ order: updateOrder });
  } catch (error) {
    if (error instanceof Error && error.name == "ValidationError") {
      next(new BadRequest());
    } else {
      next(error);
    }
  }
}
