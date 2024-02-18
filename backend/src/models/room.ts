import mongoose, { Model } from "mongoose";
import { collections } from "../utils/database";
import { Message } from "./message";
import { RoomsUser } from "./rooms_user";
import { User, UserType } from "./user";

export type RoomType = {
  _id?: mongoose.Types.ObjectId;
  name: string;
  user: mongoose.Types.ObjectId;
  is_public: boolean;
  is_joinable?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

const schema = new mongoose.Schema<RoomType>(
  {
    name: {
      type: String,
      required: true,
    },
    user: mongoose.Schema.Types.ObjectId,
    is_public: Boolean,
    is_joinable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export class Room {
  public static model: Model<RoomType> = mongoose.model(
    collections.rooms,
    schema
  );

  public static async create(data: RoomType): Promise<RoomType> {
    const room = new this.model(data);
    return await room.save();
  }

  public static async bulkCreate(data: RoomType[]): Promise<RoomType[]> {
    const rooms = data.map((room) => {
      return new this.model(room);
    });
    return await this.model.insertMany(rooms);
  }

  public static async update(room: RoomType): Promise<RoomType | null> {
    return await this.model.findByIdAndUpdate(room._id, room).exec();
  }

  public static async delete(id: mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  public static async all(): Promise<RoomType[]> {
    return await this.model.find().exec();
  }

  public static async users(room: RoomType): Promise<UserType[]> {
    if (!room?._id) return [];

    let roomsUsers = await RoomsUser.model
      .find({
        room: room._id,
      })
      .exec();

    let users = await User.model
      .find({
        _id: {
          $in: roomsUsers.map((r) => {
            return r.user;
          }),
        },
      })
      .exec();

    return users;
  }

  public static async find(
    id: mongoose.Types.ObjectId
  ): Promise<RoomType | null> {
    return await this.model.findById(id).exec();
  }

  public static async findOne(by: object): Promise<RoomType | null> {
    return await this.model.findOne(by).exec();
  }
}
