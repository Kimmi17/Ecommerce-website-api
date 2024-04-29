import { NotFoundError } from "../errors/ApiError";
import Order, { OrderDocument } from "../model/Order";
import Product from "../model/Product";
import User, { UserDocument } from "../model/User";

const getAllOrders = async (): Promise<OrderDocument[]> => {
  try {
    return await Order.find();
  } catch (error) {
    throw new Error("Failed to fetch orders");
  }
};

const createOrder = async (order: OrderDocument): Promise<OrderDocument> => {
  try {
    return await order.save();
  } catch (error) {
    throw new Error("Failed to create orders");
  }
};

// get orders by userId
const getOrderByUserId = async (userId: string): Promise<any> => {
  const user = await User.findById(userId);
  if (user) {
    // const pros = await Promise.all(user.orders?.map(p => p.products.map(x=>x.productId)))
    const productIds = user.orders
      ?.map((p) => p.products.map((x: any) => x.productId))
      .flat();
    const prod = await Product.find({ _id: { $in: productIds } });
    const orders = user.orders?.map((o) => ({
      ...o,
      products: o.products.map((p: any) =>
        prod.find((x) => x._id === p.productId)
      ),
    }));
    return {
      ...user,
      orders,
    };
  }
  throw new NotFoundError();
};

const deleteOrderById = async (id: string) => {
  const foundOrder = await Order.findByIdAndDelete(id);
  if (foundOrder) {
    return foundOrder;
  }
  throw new NotFoundError();
};

const updateOrder = async (
  id: string,
  newInformation: Partial<OrderDocument>
) => {
  const updatedOrder = await Order.findByIdAndUpdate(id, newInformation, {
    new: true,
  });
  if (updatedOrder) {
    return updatedOrder;
  }
  throw new NotFoundError();
};

const updateOrderPaymentStatus = async (
  orderId: string,
  paymentStatus: string
) => {
  const updatedOrder = await Order.findByIdAndUpdate(orderId, {
    paymentStatus,
  });
  if (updatedOrder) {
    return updatedOrder;
  }
  throw new NotFoundError();
};

export default {
  getAllOrders,
  createOrder,
  getOrderByUserId,
  deleteOrderById,
  updateOrder,
  updateOrderPaymentStatus,
};
