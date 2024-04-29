import request from "supertest";
import app from "../../src/app";
import connect, { MongoHelper } from "../db-helper";
import jwt from "jsonwebtoken";

describe("Order Controller Tests", () => {
  let mongoHelper: MongoHelper;
  let orderId: string;
  let token: string;

  beforeAll(async () => {
    mongoHelper = await connect();
  });

  afterAll(async () => {
    await mongoHelper.closeDatabase();
  });

  afterEach(async () => {
    await mongoHelper.clearDatabase();
  });

  describe("Create Stripe Payment Session", () => {
    beforeAll(async () => {
      const userData = {
        _id: "user-id-here",
      };

      token = jwt.sign(userData, process.env.JWT_SECRET!);
    });

    test("should create new order and return stripe payment session URL", async () => {
      const orderData = {
        receipt_email: "test@example.com",
        order: [
          {
            _id: "product-id-here",
            title: "Product Title",
            price: 10.99,
            quantity: 2,
            images: ["image-url-here"],
          },
        ],
      };

      const response = await request(app)
        .post("/api/v1/orders/payment")
        .set("Authorization", `Bearer ${token}`)
        .send(orderData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("url");
      expect(response.body.url).toContain("checkout.stripe.com");
      orderId = response.body.orderId;
    });
  });

  describe("Handle Payment Success", () => {
    test('should update order payment status to "SUCCESSED" on payment success', async () => {
      const response = await request(app).get(
        `/api/v1/orders/success/${orderId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.order).toHaveProperty("paymentStatus", "SUCCESSED");
    });
  });

  describe("Handle Payment Cancellation", () => {
    test('should update order payment status to "FAILED" on payment cancel', async () => {
      const response = await request(app).get(
        `/api/v1/orders/cancel/${orderId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.order).toHaveProperty("paymentStatus", "FAILED");
    });
  });
});
