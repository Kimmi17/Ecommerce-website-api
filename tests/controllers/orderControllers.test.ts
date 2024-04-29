import request from "supertest";
import app from "../../src/app";
import { createUser, getToken } from "../test-utils";
import connect, { MongoHelper } from "../db-helper";
import Order from "../../src/model/Order";

describe("Order Controller Tests", () => {
  let mongoHelper: MongoHelper;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    mongoHelper = await connect();
  });

  afterAll(async () => {
    await mongoHelper.closeDatabase();
  });

  afterEach(async () => {
    await mongoHelper.clearDatabase();
  });

  beforeEach(async () => {
    const response = await createUser(
      "User",
      "1",
      "user1@gmail.com",
      "123",
      "user"
    );
    const userData = await getToken(response.body.email, "123");
    userToken = userData.body.token;
    userId = response.body._id;
  });

  test("should create new order", async () => {
    const newOrderData = {
      products: ["product1", "product2"],
      totalPrice: 100,
    };

    const response = await request(app)
      .post(`/api/v1/orders/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(newOrderData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("newOrder");
    const createdOrder = await Order.findById(response.body.newOrder._id);
    expect(createdOrder).toBeTruthy();
  });

  test("should get orders for a user", async () => {
    const response = await request(app)
      .get(`/api/v1/orders/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("should update an order", async () => {
    const newOrderData = {
      products: ["product1", "product2"],
      totalPrice: 100,
    };

    const response = await request(app)
      .post(`/api/v1/orders/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(newOrderData);

    const orderId = response.body.newOrder._id;

    const updatedOrderData = {
      totalPrice: 150,
    };

    const updateResponse = await request(app)
      .put(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedOrderData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.totalPrice).toBe(updatedOrderData.totalPrice);
  });

  test("should delete an order", async () => {
    const newOrderData = {
      products: ["product1", "product2"],
      totalPrice: 100,
    };

    const response = await request(app)
      .post(`/api/v1/orders/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(newOrderData);

    const orderId = response.body.newOrder._id;

    const deleteResponse = await request(app)
      .delete(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(deleteResponse.status).toBe(204);
    const deletedOrder = await Order.findById(orderId);
    expect(deletedOrder).toBeNull();
  });
});
