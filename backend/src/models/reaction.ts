import mongoose, { Model } from "mongoose";
import { collections } from "../utils/database";
import { Message, MessageType } from "./message";

export type ReactionType = {
  _id?: mongoose.Types.ObjectId;
  message: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  created_at?: Date;
  updated_at?: Date;
};

const schema = new mongoose.Schema<ReactionType>(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.messages,
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
  },
  {
    timestamps: true,
  }
);

export class Reaction {
  public static model: Model<ReactionType> = mongoose.model(
    collections.reactions,
    schema
  );

  public static async all(): Promise<ReactionType[]> {
    return await this.model
      .find({}, null, {
        lean: true,
      })
      .exec();
  }

  public static async create(
    message: MessageType,
    reaction: ReactionType
  ): Promise<ReactionType> {
    let _reaction = await this.model.create(reaction);

    await Message.model.updateOne(
      { _id: message._id },
      { $push: { reactions: _reaction._id } }
    );

    return _reaction;
  }

  public static async delete(reaction: ReactionType): Promise<void> {
    await this.model.deleteOne(reaction);
    let message = await Message.model.findById(reaction.message);

    if (!message) return;
  }
}
