import mongoose, { Model } from "mongoose";
import { collections } from "../utils/database";

export type MessageType = {
  _id?: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  content: string;
  is_edited?: boolean;
  is_vocal?: boolean;
  is_image?: boolean;
  from_server?: boolean;
  reactions?: mongoose.Types.ObjectId[];
  created_at?: Date;
  updated_at?: Date;
};

const schema = new mongoose.Schema<MessageType>(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.rooms,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: false,
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    is_edited: {
      type: Boolean,
      default: false,
    },
    is_vocal: {
      type: Boolean,
      default: false,
    },
    is_image: {
      type: Boolean,
      default: false,
    },
    from_server: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: collections.reactions,
        required: false,
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export class Message {
  public static model: Model<MessageType> = mongoose.model(
    collections.messages,
    schema
  );

  public static async create(data: MessageType): Promise<MessageType> {
    const message = new this.model(data);
    return (await message.save()).populate("user");
  }

  public static async bulkCreate(data: MessageType[]): Promise<MessageType[]> {
    const messages = data.map((message) => {
      return new this.model(message);
    });
    return await this.model.insertMany(messages);
  }

  public static async update(
    message: MessageType
  ): Promise<MessageType | null> {
    await this.model.findByIdAndUpdate(message._id, message).exec();
    return await this.model
      .findById(message._id)
      .populate("user")
      .populate("reactions")
      .exec();
  }

  public static async delete(id: mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  public static async all(): Promise<MessageType[]> {
    return await this.model
      .find()
      .populate("user")
      .populate("reactions")
      .exec();
  }

  public static async find(
    id: mongoose.Types.ObjectId
  ): Promise<MessageType | null> {
    return await this.model
      .findById(id, null, {
        lean: true,
      })
      .populate("user")
      .populate("reactions")
      .exec();
  }
}
