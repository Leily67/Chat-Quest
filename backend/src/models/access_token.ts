import mongoose, { Model } from "mongoose";
import { collections } from "../utils/database";

export type AccessTokenType = {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  token: string;
  last_used_at?: Date;
  expires_at?: Date;
};

const schema = new mongoose.Schema<AccessTokenType>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    last_used_at: {
      type: Date,
      default: Date.now(),
    },
    expires_at: {
      type: Date,
      required: true,
      default: Date.now() + 1000 * 60 * 60 * 24 * 7,
    },
  },
  {
    timestamps: true,
  }
);

export class AccessToken {
  public static model: Model<AccessTokenType> = mongoose.model(
    collections.accessTokens,
    schema
  );

  public static async create(data: AccessTokenType): Promise<AccessTokenType> {
    const accessToken = new this.model(data);
    return await accessToken.save();
  }

  public static async update(
    accessToken: AccessTokenType
  ): Promise<AccessTokenType | null> {
    return await this.model
      .findByIdAndUpdate(accessToken._id, accessToken)
      .exec();
  }

  public static async delete(id: mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  public static async find(token: string): Promise<AccessTokenType | null> {
    return await this.model.findOne({ token }).populate("user").exec();
  }

  public static async used(id: mongoose.Types.ObjectId): Promise<void> {
    await this.model.findByIdAndUpdate(id, { last_used_at: Date.now() }).exec();
  }
}
