import mongoose from "mongoose";
import { Database } from "../../src/database";
import { config } from "dotenv";
import { User, UserType } from "../../src/models/user";
import { Message, MessageType } from "../../src/models/message";
import { Room, RoomType } from "../../src/models/room";

config();

console.log = () => {};

let user: UserType | null;
let room: RoomType | null;

describe("Messages", () => {
  beforeAll(async () => {
    await Database.connect();
    await mongoose.connection.dropDatabase();

    user = await User.create({
      nickname: "test",
    });

    if (!user || !user._id) throw new Error("User not found");

    room = await Room.create({
      name: "Room 2",
      is_public: true,
      user: user?._id,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("should interact with message model", async () => {
    let users: MessageType[] = await Message.all();
    expect(users).toHaveLength(0);
    expect(users).toEqual([]);
  });

  test("should create message", async () => {
    if (!user || !user._id || !room || !room._id)
      throw new Error("User or room not found");

    let message: MessageType | null = await Message.create({
      content: "Hello world",
      user: user._id,
      room: room._id,
    });

    expect(message).toHaveProperty("_id");
    expect(message).toHaveProperty("content");
  });

  test("should find message", async () => {
    if (!user || !user._id || !room || !room._id)
      throw new Error("User or room not found");

    let message: MessageType | null = await Message.model.findOne({
      content: "Hello world",
      user: user._id,
      room: room._id,
    });

    expect(message).toHaveProperty("_id");
    expect(message).toHaveProperty("content");
  });
});
