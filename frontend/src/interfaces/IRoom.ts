import IMessage from "./IMessage";
import { IUser } from "./IUser";

export default interface IRoom {
  _id: string;
  name: string;
  user: string;
  messages: IMessage[];
  users?: IUser[];
  is_public: boolean;
  is_joinable: boolean;
  createdAt: string;
  updatedAt: string;
}
