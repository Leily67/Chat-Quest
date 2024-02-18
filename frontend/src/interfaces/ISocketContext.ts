import { Socket } from "socket.io-client";
import IMessage from "./IMessage";
import IRoom from "./IRoom";

export default interface ISocketContext {
  socket: Socket | undefined;
  roomUsers: any;
  messages: { [key: string]: IMessage[] };
  events: {
    UPDATE_ONLINE_USERS: string;
    CONNECTION: string;
    CREATE_ROOM: string;
    DELETE_ROOM: string;
    JOIN_ROOM: string;
    QUIT_ROOM: string;
    SEND_MESSAGE: string;
    ADD_REACTION: string;
    REMOVE_REACTION: string;
  };
  rooms: IRoom[];
}
