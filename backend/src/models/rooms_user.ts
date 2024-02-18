import mongoose, { Model } from "mongoose";
import { collections } from "../utils/database";

export type RoomsUserType = {
  _id?: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
};

const schema = new mongoose.Schema<RoomsUserType>(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.rooms,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export class RoomsUser {
  public static model: Model<RoomsUserType> = mongoose.model(
    collections.roomsUsers,
    schema
  );

  public static async create(data: RoomsUserType): Promise<RoomsUserType> {
    const roomsUser = new this.model(data);
    return await roomsUser.save();
  }

  public static async bulkCreate(
    data: RoomsUserType[]
  ): Promise<RoomsUserType[]> {
    const roomsUsers = data.map((roomsUser) => {
      return new this.model(roomsUser);
    });
    return await this.model.insertMany(roomsUsers);
  }

  public static async delete(id: mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  public static async all(): Promise<RoomsUserType[]> {
    return await this.model.find().exec();
  }

  public static async find(
    id: mongoose.Types.ObjectId
  ): Promise<RoomsUserType | null> {
    return await this.model.findById(id).exec();
  }

  public static async findOne(
    query: Partial<RoomsUserType>
  ): Promise<RoomsUserType | null> {
    return await this.model.findOne(query).exec();
  }
}
