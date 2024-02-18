import mongoose from "mongoose";
import { Database } from "../../src/database";
import { config } from "dotenv";
import { User, UserType } from "../../src/models/user";

config();

console.log = () => {};

const defaultUser = {
  nickname: "test",
  email: "test@user.com",
};

describe("Users", () => {
  beforeAll(async () => {
    await Database.connect();
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should interact with user model", async () => {
    let users: UserType[] = await User.all();
    expect(users).toHaveLength(0);
    expect(users).toEqual([]);
  });

  test("should create temporary user", async () => {
    let user: UserType | null = await User.create({
      nickname: "test",
      is_temporary: true,
    });

    expect(user).toHaveProperty("_id");
  });

  test("should create user with correct password", async () => {
    let user: UserType | null = await User.create({
      password: "Password*123",
      ...defaultUser,
    });

    expect(user).toHaveProperty("_id");
  });

  test("should not create user with incorrect password", async () => {
    try {
      await User.create({
        password: "password",
        ...defaultUser,
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toHaveProperty("message");
    }
  });

  test("should find user", async () => {
    let user: UserType | null = await User.findByEmailWithPassword(
      defaultUser.email
    );

    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("nickname", defaultUser.nickname);
  });

  test("should update user", async () => {
    let user: UserType | null = await User.findByEmailWithPassword(
      defaultUser.email
    );

    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("nickname", "test");

    await User.update({
      ...user,
      nickname: "test24",
    });

    user = await User.findByEmailWithPassword(defaultUser.email);

    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("nickname", "test24");
  });

  test("should return user accessible rooms", async () => {
    let user: UserType | null = await User.findByEmailWithPassword(
      defaultUser.email
    );

    if (!user || !user._id) {
      expect(true).toBe(false);
      return;
    }

    expect(user).toHaveProperty("_id");

    let rooms = await User.accessibleRooms(user._id);

    expect(rooms).toHaveLength(0);
    expect(rooms).toEqual([]);
  });
});
