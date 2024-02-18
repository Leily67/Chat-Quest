import IReaction from "./IReaction";
import IRoom from "./IRoom";
import { IUser } from "./IUser";

export default interface IMessage {
  _id?: string;
  room: string | IRoom;
  user: IUser | null | string;
  content: string;
  is_edited?: boolean;
  is_vocal?: boolean;
  is_image?: boolean;
  from_server?: boolean;
  reactions: IReaction[];
  createdAt?: string;
  updatedAt?: string;
}
