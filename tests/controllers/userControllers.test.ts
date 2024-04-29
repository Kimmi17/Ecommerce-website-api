import request from "supertest";
import app from "../../src/app";
import connect, { MongoHelper } from "../db-helper";
import User from "../../src/model/User";

describe("User Controller Tests", () => {
  let mongoHelper: MongoHelper;
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

  test("should create new user", async () => {
    const newUser = {
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      password: "password",
      avatar: "avatar-url",
    };

    const response = await request(app).post("/api/v1/users").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    userId = response.body._id;
  });

  test("should get user data", async () => {
    const response = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set("Authorization", "Bearer token-here");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("firstname", "John");
    expect(response.body).toHaveProperty("lastname", "Doe");
    expect(response.body).toHaveProperty("email", "john.doe@example.com");
  });

  test("should update user", async () => {
    const updatedUserData = {
      firstname: "Updated John",
      lastname: "Updated Doe",
      email: "updated.john.doe@example.com",
      password: "new-password",
      avatar: "new-avatar-url",
    };

    const response = await request(app)
      .put(`/api/v1/users/${userId}`)
      .send(updatedUserData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("firstname", "Updated John");
    expect(response.body).toHaveProperty("lastname", "Updated Doe");
    expect(response.body).toHaveProperty(
      "email",
      "updated.john.doe@example.com"
    );
  });

  test("should delete user", async () => {
    const response = await request(app).delete(`/api/v1/users/${userId}`);

    expect(response.status).toBe(204);
    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });

  test("should ban user", async () => {
    const response = await request(app).put(`/api/v1/users/${userId}/ban`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "User banned successfully!"
    );
    expect(response.body.user).toHaveProperty("_id", userId);
    expect(response.body.user).toHaveProperty("banStatus", true);
  });

  test("should unban user", async () => {
    const response = await request(app).put(`/api/v1/users/${userId}/unban`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "User unbanned successfully!"
    );
    expect(response.body.user).toHaveProperty("_id", userId);
    expect(response.body.user).toHaveProperty("banStatus", false);
  });
});
