import mongoose from "mongoose";
import { Database } from "../../src/database";
import { config } from "dotenv";
import { User, UserType } from "../../src/models/user";

config();

console.log = () => {};

describe("Commands", () => {
  beforeAll(async () => {
    await Database.connect();
    await mongoose.connection.dropDatabase();

    await User.create({
      nickname: "test",
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should use /nick command to change nickname", async () => {
    const user: UserType | null = await User.findOne({ nickname: "test" });

    if (!user) throw new Error("User not found");

    await User.update({ ...user, nickname: "test2" });

    const updatedUser: UserType | null = await User.findOne({
      nickname: "test2",
    });

    if (!updatedUser) throw new Error("User not found");

    expect(updatedUser.nickname).toBe("test2");
  });
});
