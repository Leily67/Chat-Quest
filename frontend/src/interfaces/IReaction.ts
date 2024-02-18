import IMessage from "./IMessage";
import { IUser } from "./IUser";

export default interface IReaction {
  _id?: string;
  message: string | IMessage;
  user: IUser | null | string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
