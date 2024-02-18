import mongoose, { Model } from "mongoose";
import { collections } from "../utils/database";
import { Message, MessageType } from "./message";
import { AccessToken, AccessTokenType } from "./access_token";
import { RoomsUser } from "./rooms_user";
import { Room, RoomType } from "./room";

export type UserType = {
  _id?: mongoose.Types.ObjectId;
  nickname: string;
  uuid?: string;
  email?: string;
  password?: string;
  is_temporary?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

const schema = new mongoose.Schema<UserType>(
  {
    nickname: {
      type: String,
      required: true,
      maxlength: 32,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      default: null,
      match: /.+@.+\..+/,
    },
    password: {
      type: String,
      required: false,
      default: null,
      select: false,
    },
    is_temporary: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export class User {
  public static model: Model<UserType> = mongoose.model(
    collections.users,
    schema
  );

  private static async uuid(nickname: string): Promise<string> {
    let uuid = nickname.toLowerCase().replace(/\s/g, "-");
    while (await this.model.findOne({ uuid }).exec()) {
      uuid += `#${Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 10)
      ).join("")}`;
    }
    return uuid;
  }

  public static async create(data: UserType): Promise<UserType> {
    const user = await Promise.resolve(
      new this.model({
        ...data,
        uuid: await this.uuid(data.nickname),
      })
    );
    return await user.save();
  }

  public static async bulkCreate(data: UserType[]): Promise<UserType[]> {
    const users = await Promise.all(
      data.map(async (user) => {
        return new this.model({
          ...user,
          uuid: await this.uuid(user.nickname),
        });
      })
    );

    return await this.model.insertMany(users);
  }

  public static async update(user: UserType): Promise<UserType | null> {
    return await this.model.findByIdAndUpdate(user._id, user).exec();
  }

  public static async delete(id: mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  public static async all(): Promise<UserType[]> {
    return await this.model
      .find({}, null, {
        lean: true,
      })
      .exec();
  }

  public static async find(
    id: mongoose.Types.ObjectId
  ): Promise<UserType | null> {
    return await this.model
      .findById(id, null, {
        lean: true,
      })
      .exec();
  }

  public static async findByEmailWithPassword(
    email: string
  ): Promise<UserType | null> {
    return await this.model
      .findOne({ email }, null, {
        lean: true,
      })
      .select("+password")
      .exec();
  }

  public static async findOne(by: object): Promise<UserType | null> {
    return await this.model
      .findOne(by, null, {
        lean: true,
      })
      .exec();
  }

  public static async messages(
    id: mongoose.Types.ObjectId
  ): Promise<MessageType[] | null> {
    return await Message.model.find({ user: id }).exec();
  }

  public static async token(
    id: mongoose.Types.ObjectId
  ): Promise<AccessTokenType | null> {
    return await AccessToken.model.findOne({ user: id }).exec();
  }

  public static async accessibleRooms(
    id: mongoose.Types.ObjectId,
    roomsOnly: boolean = false
  ): Promise<RoomType[] | null> {
    let joinedRooms = await RoomsUser.model
      .find({ user: id })
      .select("room")
      .exec();

    let rooms = await Room.model
      .find({
        $or: [
          { is_public: true },
          { _id: { $in: joinedRooms.map((jr) => jr.room) } },
        ],
      })
      .populate("user")
      .exec();

    if (roomsOnly) return rooms;

    return await Promise.all(
      rooms.map(async (room) => {
        let messages = await Message.model
          .find({ room: room._id })
          .populate("reactions")
          .populate("user")
          .exec();

        let roomUsers = await RoomsUser.model
          .find({ room: room._id })
          .populate("user")
          .exec();

        return {
          ...room.toObject(),
          messages,
          users: roomUsers.map((ru) => ru.user),
        };
      })
    );
  }
}
