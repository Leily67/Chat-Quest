import mongoose from "mongoose";
import { Database } from "../../src/database";
import { Token } from "../../src/utils/token";
import { config } from "dotenv";

config();

console.log = () => {};

describe("JWT", () => {
  test("should generate JWT token", async () => {
    await Database.connect();
    await mongoose.connection.dropDatabase();
    const id = "5f748650d8e5c4f5e4e3e6b0";
    const token = await Token.generate(id);
    expect(token).toBeDefined();
  });
});
