import mongoose from "mongoose";
import { Database } from "../../src/database";
import { config } from "dotenv";
import { Room, RoomType } from "../../src/models/room";
import { User, UserType } from "../../src/models/user";

config();

console.log = () => {};

let user: UserType | null;

describe("Rooms", () => {
  beforeAll(async () => {
    await Database.connect();
    await mongoose.connection.dropDatabase();

    user = await User.create({
      nickname: "test",
    });

    if (!user || !user._id) throw new Error("User not found");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should interact with room model", async () => {
    let users: RoomType[] = await Room.all();
    expect(users).toHaveLength(0);
    expect(users).toEqual([]);
  });

  test("should create room", async () => {
    if (!user || !user._id) throw new Error("User not found");

    let room: RoomType | null = await Room.create({
      name: "Room 2",
      is_public: true,
      user: user?._id,
    });

    expect(room).toHaveProperty("_id");
    expect(room).toHaveProperty("name");
    expect(room).toHaveProperty("is_public");
  });

  test("should find room", async () => {
    let room: RoomType | null = await Room.model.findOne({
      name: "Room 2",
      user: user?._id,
    });

    expect(room).toHaveProperty("_id");
    expect(room).toHaveProperty("name");
    expect(room).toHaveProperty("is_public");
  });

  test("should update room", async () => {
    let room: RoomType | null = await Room.model.findOne({
      name: "Room 2",
      user: user?._id,
    });

    if (!room) throw new Error("Room not found");

    expect(room).toHaveProperty("_id");

    await Room.update({
      ...room,
      name: "Room 3",
    });

    expect(room).toHaveProperty("_id");
    expect(room).toHaveProperty("name");
    expect(room).toHaveProperty("is_public");
  });
});
