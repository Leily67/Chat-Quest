import mongoose from "mongoose";
import { Database } from "../../src/database";
import { config } from "dotenv";
import { User, UserType } from "../../src/models/user";
import { Room, RoomType } from "../../src/models/room";
import { Reaction, ReactionType } from "../../src/models/reaction";
import { Message } from "../../src/models/message";

config();

console.log = () => {};

let user: UserType | null;
let room: RoomType | null;

describe("Reactions", () => {
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

  test("should interact with reaction model", async () => {
    let reactions: ReactionType[] = await Reaction.all();
    expect(reactions).toHaveLength(0);
    expect(reactions).toEqual([]);
  });

  test("should create reaction", async () => {
    if (!user || !user._id || !room || !room._id)
      throw new Error("User or room not found");

    let message = await Message.create({
      content: "Hello world",
      user: user._id,
      room: room._id,
    });

    if (!message || !message._id) throw new Error("Message not found");

    let reaction: ReactionType | null = await Reaction.create(message, {
      message: message._id,
      content: "🚀",
      user: user._id,
    });

    if (!reaction || !reaction._id) throw new Error("Reaction not found");

    expect(reaction).toHaveProperty("_id");
    expect(reaction).toHaveProperty("content");
  });

  test("should find reaction", async () => {
    if (!user || !user._id || !room || !room._id)
      throw new Error("User or room not found");

    let reaction: ReactionType | null = await Reaction.model.findOne({
      content: "🚀",
      user: user._id,
    });

    if (!reaction || !reaction._id) throw new Error("Reaction not found");

    expect(reaction).toHaveProperty("_id");
  });
});
