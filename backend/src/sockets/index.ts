import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Message, type MessageType } from "../models/message";
import { User, UserType } from "../models/user";
import mongoose from "mongoose";
import { RoomsUser } from "../models/rooms_user";
import { Log } from "../utils/log";
import { Room, RoomType } from "../models/room";
import moment from "moment";
import { Reaction, ReactionType } from "../models/reaction";

enum Commands {
  NICK = "nick",
  LIST_ROOMS = "list",
  CREATE_ROOM = "create",
  DELETE_ROOM = "delete",
  JOIN_ROOM = "join",
  QUIT_ROOM = "quit",
  LIST_ROOMS_USERS = "users",
  SEND_PRIVATE_MESSAGE = "msg",
}

enum SocketEvents {
  UPDATE_ONLINE_USERS = "update-online-users",
  CONNECTION = "connection",
  CREATE_ROOM = "create-room",
  DELETE_ROOM = "delete-room",
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  SEND_MESSAGE = "send-message",
  DISCONNECT = "disconnect",
  ADD_REACTION = "add-reaction",
  REMOVE_REACTION = "remove-reaction",
}

interface RoomEventProps {
  room_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
}

export class Socket {
  private static _io: Server;

  private static roomUsers: {
    [key: string]: {
      user: UserType;
      socket: string[];
    }[];
  } = {};

  static initialize(server: HttpServer): void {
    this._io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.setup();
    console.log(`  > Sockets initialized`);
  }

  private static setup(): void {
    this._io.on(SocketEvents.CONNECTION, async (s) => {
      try {
        Log.info(`New socket connection #${s.id}`);

        let user_id = s.handshake.query["user_id"];
        let user = await User.model.findById(user_id);

        if (!user || !user._id) {
          Log.error(`Failed to find user #${user_id} on mount event`);
          return;
        }

        const joinedRooms = await RoomsUser.model
          .find({
            user: user_id,
          })
          .select("room")
          .exec();

        joinedRooms
          .map((joinedRoom) => joinedRoom.room.toString())
          .forEach((room) => {
            if (user && !this.roomUsers[room]) {
              this.roomUsers = {
                ...this.roomUsers,
                [room]: [...(this.roomUsers[room] || [])],
              };
            }

            if (
              user &&
              this.roomUsers[room].filter(
                (roomUser) =>
                  user && roomUser.user._id?.toString() === user._id?.toString()
              ).length === 0
            ) {
              this.roomUsers[room]?.push({
                user,
                socket: [s.id],
              });
            } else {
              const existingUserIndex = this.roomUsers[room].findIndex(
                (roomUser) =>
                  user && roomUser.user._id?.toString() === user._id?.toString()
              );

              if (existingUserIndex !== -1) {
                const existingSocketIndex = this.roomUsers[room][
                  existingUserIndex
                ].socket.indexOf(s.id);

                if (existingSocketIndex === -1) {
                  this.roomUsers[room][existingUserIndex].socket?.push(s.id);
                }
              }
            }
          });

        Log.info(
          `Emitting connection event for user #${user._id} (${user.nickname}, ${s.id})`
        );

        s.nsp.emit(SocketEvents.UPDATE_ONLINE_USERS, this.roomUsers);
      } catch (error) {
        Log.error(`Failed to mount socket #${s.id}: ${error}`);
      }

      s.on(
        SocketEvents.JOIN_ROOM,
        async ({ room_id, user_id }: RoomEventProps) => {
          try {
            Log.debug(`User #${user_id} is trying to join room #${room_id}`);

            let room = await Room.find(room_id),
              user = await User.find(user_id);

            if (!user || !user._id) {
              Log.error(`Failed to find user #${user_id} on join room event`);
              return;
            }

            if (!room || !room._id) {
              Log.error(`Failed to find room #${room_id} on join room event`);
              return;
            }

            let roomUser = await RoomsUser.findOne({
              user: user._id,
              room: room_id,
            });

            if (!room.is_joinable && !roomUser) {
              Log.error(
                `User #${user._id} is trying to join a non-joinable room #${room_id}`
              );
              return;
            }

            if (!s.rooms.has(room._id.toString())) {
              s.join(room._id.toString());
            }

            if (!roomUser) {
              Log.debug(`User #${user._id} has now access to room #${room_id}`);
              await RoomsUser.create({
                user: user._id,
                room: room._id,
              });

              s.emit(SocketEvents.JOIN_ROOM, room);

              s.nsp.to(room._id.toString()).emit(
                SocketEvents.SEND_MESSAGE,
                await Message.create({
                  room: room._id,
                  content: `${user?.nickname} has joined the room !`,
                  from_server: true,
                })
              );

              Log.debug(
                `Sending message to room #${room._id} to notify user join`
              );
            }

            if (
              !this.roomUsers[room._id.toString()]?.find(
                (roomUser) =>
                  roomUser.user?._id?.toString() === user?._id?.toString()
              )
            ) {
              this.roomUsers = {
                ...this.roomUsers,
                [room._id.toString()]: [
                  ...(this.roomUsers[room._id.toString()] || []),
                  {
                    user,
                    socket: [s.id],
                  },
                ],
              };

              s.nsp.emit(SocketEvents.UPDATE_ONLINE_USERS, this.roomUsers);

              Log.debug(
                `Emitting connection event for user #${user._id} (${user.nickname}, ${s.id})`
              );
            } else {
              Log.debug(`User #${user._id} is already in room #${room._id}`);
            }

            Log.info(
              `User #${user._id} (${user?.nickname}) joined room #${room._id} (${room.name})`
            );
          } catch (error) {
            Log.error(`Failed to join room #${room_id}: ${error}`);
          }
        }
      );

      s.on(
        SocketEvents.LEAVE_ROOM,
        async ({ room_id, user_id }: RoomEventProps) => {
          try {
            Log.info(`User #${user_id} is trying to leave room #${room_id}`);

            let room = await Room.find(room_id),
              user = await User.find(user_id);

            if (!user || !user._id) {
              Log.error(`Failed to find user #${user_id} on leave room event`);
              return;
            }

            if (!room || !room._id) {
              Log.error(`Failed to find room #${room_id} on leave room event`);
              return;
            }

            let roomUser = await RoomsUser.findOne({
              user: user._id,
              room: room_id,
            });

            if (!roomUser || !roomUser._id) {
              Log.error(
                `User #${user._id} is trying to leave a non-joined room #${room_id}`
              );
              return;
            }

            Log.debug(`User #${user._id} has now left room #${room._id}`);
            await RoomsUser.delete(roomUser._id);
            s.leave(room._id.toString());

            s.nsp.to(room._id.toString()).emit(
              SocketEvents.SEND_MESSAGE,
              await Message.create({
                room: room._id,
                content: `${user?.nickname} has left the room !`,
                from_server: true,
              })
            );

            Log.debug(
              `Sending message to room #${room._id} to notify user leave`
            );

            for (const room of Object.keys(this.roomUsers)) {
              this.roomUsers[room]?.filter(
                (roomUser) =>
                  user && roomUser.user._id?.toString() !== user._id?.toString()
              );
            }

            s.nsp.emit(SocketEvents.UPDATE_ONLINE_USERS, this.roomUsers);

            Log.debug(
              `Emitting disconnect event for user #${user._id} (${user.nickname}, ${s.id})`
            );
          } catch (error) {
            Log.error(`Failed to leave room #${room_id}: ${error}`);
          }
        }
      );

      s.on(SocketEvents.CREATE_ROOM, async (data: RoomType) => {
        try {
          let user = await User.model.findById(data.user);

          if (!user || !user._id) {
            Log.error(`Failed to find user #${data.user} on create room event`);
            return;
          }

          Log.debug(
            `User #${user._id} is trying to create a ${
              data.is_public ? "public" : "private"
            } room named ${data.name}`
          );

          let room = await Room.create(data);

          Log.app(
            `Room #${room._id} (${room.name}) has been created by user #${user._id}`
          );

          if (!room.is_public) {
            s.emit(SocketEvents.CREATE_ROOM, room);
            return;
          }

          s.nsp.emit(SocketEvents.CREATE_ROOM, room);
        } catch (error) {
          Log.error(`Failed to create room: ${error}`);
        }
      });

      s.on(
        SocketEvents.DELETE_ROOM,
        async ({
          room_id,
          user,
        }: {
          room_id: mongoose.Types.ObjectId;
          user: UserType;
        }) => {
          try {
            let room = await Room.find(room_id);

            if (!room || !room!._id) {
              Log.error(`Failed to find room #${room_id} on delete room event`);
              return;
            }

            if (room.user.toString() !== user._id?.toString()) {
              Log.error(
                `User #${user._id} is trying to delete room #${room_id} without permission`
              );
              return;
            }

            await RoomsUser.model.deleteMany({ room: room_id }).exec();
            await Room.delete(room_id);

            Log.app(
              `Room #${room_id} (${room.name}) has been deleted by user #${user._id}`
            );

            s.nsp.emit(SocketEvents.DELETE_ROOM, room);
          } catch (error) {
            Log.error(`Failed to delete room #${room_id}: ${error}`);
          }
        }
      );

      s.on(SocketEvents.SEND_MESSAGE, async (message: MessageType) => {
        try {
          let room = await Room.find(message.room),
            user = await User.find(message.user as mongoose.Types.ObjectId);

          if (!user || !user._id) {
            Log.error(
              `Failed to find user #${message.user} on send message event`
            );
            return;
          }

          if (!room || !room._id) {
            Log.error(
              `Failed to find room #${message.room} on send message event`
            );
            return;
          }

          let existingMessage = await Message.find(
            new mongoose.Types.ObjectId(message?._id)
          );

          if (!message.content) {
            Log.debug(
              `User #${message.user} (${user?.nickname}) sent an empty message to room #${message.room} (${room.name})`
            );
            return;
          }

          if (existingMessage) {
            Log.debug(
              `User #${message.user} (${user?.nickname}) updated message #${message._id} in room #${message.room} (${room.name})`
            );

            let updatedMessage = await Message.update({
              ...existingMessage,
              content: message.content,
              is_edited: true,
            });

            s.nsp.emit(SocketEvents.SEND_MESSAGE, updatedMessage);
            return;
          }

          let command = message.content.split("/")[1]?.split(" ")[0];

          if (Object.values(Commands).includes(command as Commands)) {
            let arg = message.content
              .split("/")[1]
              ?.split(" ")
              .slice(1)
              .join(" ");

            Log.app(
              `User #${message.user} (${
                user?.nickname
              }) sent the command ${command} to room #${message.room} (${
                room.name
              }) with argument ${arg || "none"}`
            );

            if (command === Commands.LIST_ROOMS) {
              try {
                let content: string = "";

                let accessibleRooms = await User.accessibleRooms(user._id);

                if (!accessibleRooms) {
                  Log.error(
                    `Failed to list rooms for user #${message.user} (${user?.nickname})`
                  );
                  return;
                }

                for (const room of accessibleRooms) {
                  if (!arg || room.name.includes(arg))
                    content += `${room.name} - ${room._id} <br />`;
                }

                Log.debug(
                  `User #${message.user} (${
                    user?.nickname
                  }) requested list of rooms (filtered by ${arg || "all"})`
                );

                if (!content) {
                  content = "No rooms found";
                } else {
                  content = `Rooms found: <br /> ${content}`;
                }

                s.emit(SocketEvents.SEND_MESSAGE, {
                  room: message.room,
                  user: null,
                  content: content,
                  from_server: true,
                  createdAt: moment().toDate(),
                });
              } catch (error) {
                Log.error(
                  `Failed to list rooms for user #${message.user} (${user?.nickname}): ${error}`
                );
              }
            }

            if (command === Commands.LIST_ROOMS_USERS) {
              try {
                let roomUsers = await Room.users(room);

                if (!roomUsers) {
                  Log.error(
                    `Failed to list users for room #${message.room} (${room.name})`
                  );
                  return;
                }

                let content: string = "";

                for (const roomUser of roomUsers) {
                  if (!roomUser._id) continue;
                  content += `${roomUser.uuid}${
                    roomUser._id.toString() !== user._id.toString()
                      ? ""
                      : " (you)"
                  }`;

                  if (roomUsers.indexOf(roomUser) !== roomUsers.length - 1) {
                    content += ", ";
                  }
                }

                Log.debug(
                  `User #${message.user} (${user?.uuid}) requested list of users for room #${message.room} (${room.name})`
                );

                if (!content) {
                  content = "No users found";
                } else {
                  content = `Users in this room: ${content}`;
                }

                s.emit(SocketEvents.SEND_MESSAGE, {
                  room: message.room,
                  user: null,
                  content: content,
                  from_server: true,
                  createdAt: moment().toDate(),
                });
              } catch (error) {
                Log.error(
                  `Failed to list users for room #${message.room} (${room.name}): ${error}`
                );
              }
            }

            if (!arg) {
              Log.debug(
                `User #${message.user} (${user?.nickname}) sent the command ${command} without argument`
              );
              return;
            }

            switch (command) {
              case Commands.NICK:
                try {
                  await User.update({
                    ...user,
                    nickname: arg,
                  });

                  Log.debug(
                    `User #${message.user} (${user?.nickname}) changed his nickname to ${arg}`
                  );

                  s.emit(SocketEvents.SEND_MESSAGE, {
                    room: message.room,
                    user: null,
                    content: "Your name has been changed!",
                    from_server: true,
                    createdAt: moment().toDate(),
                  });
                } catch (error) {
                  Log.error(
                    `Failed to change nickname of user #${message.user} (${user?.nickname}) to ${arg}: ${error}`
                  );
                }
                break;
              case Commands.CREATE_ROOM:
                try {
                  s.nsp.emit(
                    SocketEvents.CREATE_ROOM,
                    await Room.create({
                      name: arg,
                      user: new mongoose.Types.ObjectId(user._id),
                      is_public: true,
                    })
                  );
                  Log.debug(
                    `User #${message.user} (${user?.nickname}) created a new room named ${arg}`
                  );
                } catch (error) {
                  Log.error(
                    `Failed to create room ${arg} for user #${message.user} (${user?.nickname}): ${error}`
                  );
                }
                break;
              case Commands.DELETE_ROOM:
                try {
                  let roomToDelete = await Room.model
                    .findOne({ _id: arg })
                    .exec();

                  if (roomToDelete && roomToDelete._id && roomToDelete.user) {
                    if (roomToDelete.user.toString() === user._id?.toString()) {
                      await RoomsUser.model
                        .deleteMany({ roomToDelete: room._id })
                        .exec();
                      await Room.delete(roomToDelete._id);
                      Log.debug(
                        `User #${message.user} (${user?.nickname}) deleted room #${arg}`
                      );
                      s.nsp.emit(SocketEvents.DELETE_ROOM, roomToDelete);
                    } else {
                      Log.app(
                        `User #${message.user} (${user?.nickname}) is trying to delete room #${arg} without permission`
                      );
                      s.emit(SocketEvents.SEND_MESSAGE, {
                        room: message.room,
                        user: null,
                        content: "You can't delete this room",
                        from_server: true,
                        createdAt: moment().toDate(),
                      });
                    }
                  }
                } catch {
                  Log.error(
                    `User #${message.user} (${user?.nickname}) is trying to delete a non-existing room #${arg}`
                  );
                  s.emit(SocketEvents.SEND_MESSAGE, {
                    room: message.room,
                    user: null,
                    content: "This room doesn't exist",
                    from_server: true,
                    createdAt: moment().toDate(),
                  });
                }
                break;
              case Commands.SEND_PRIVATE_MESSAGE:
                let [to, ...content] = arg.split(" ");
                try {
                  let target = await User.findOne({ uuid: to });

                  if (!target || !target._id) {
                    Log.error(
                      `Failed to find user with UUID ${to} on send private message event`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: `The user cannot be found...`,
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  if (target._id.toString() === user._id.toString()) {
                    Log.error(
                      `User #${message.user} (${user?.nickname}) is trying to send a private message to himself`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: `You can't send a private message to yourself...`,
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  let existingPrivateRooms = await Room.model.find({
                    user: { $in: [user._id, target._id] },
                    is_public: false,
                    is_joinable: false,
                  });

                  let privateRoom: RoomType | null = null,
                    hasPrivateRoom = false;

                  if (existingPrivateRooms) {
                    Log.debug(
                      `Found ${existingPrivateRooms.length} private rooms for user #${message.user} (${user?.nickname})`
                    );

                    for (const existingPrivateRoom of existingPrivateRooms) {
                      let users = await RoomsUser.model.find({
                        room: existingPrivateRoom._id,
                      });

                      if (
                        users &&
                        users.length === 2 &&
                        (users[0].user.toString() === target._id.toString() ||
                          users[1].user.toString() === target._id.toString()) &&
                        (users[0].user.toString() === user._id.toString() ||
                          users[1].user.toString() === user._id.toString())
                      ) {
                        Log.debug(
                          `Found existing private room #${existingPrivateRoom._id} for user #${message.user} (${user?.nickname}) and user #${target._id} (${target.nickname})`
                        );

                        hasPrivateRoom = true;
                        privateRoom = existingPrivateRoom;
                        break;
                      }
                    }
                  }

                  if (!hasPrivateRoom) {
                    privateRoom = await Room.create({
                      name: `${user?.nickname} - ${target.nickname}`,
                      user: user._id,
                      is_public: false,
                      is_joinable: false,
                    });
                  }

                  if (!privateRoom || !privateRoom._id) {
                    Log.error(
                      `Failed to create private room for user #${message.user} (${user?.nickname})`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: `Failed to create private room...`,
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  if (!hasPrivateRoom) {
                    for (const privateRoomUser of [user, target]) {
                      if (!privateRoomUser?._id) continue;
                      await RoomsUser.create({
                        user: privateRoomUser._id,
                        room: privateRoom._id,
                      });
                    }
                  }

                  let targetSocket = null;

                  for (const room of Object.keys(this.roomUsers)) {
                    if (
                      this.roomUsers[room].find(
                        (roomUser) =>
                          roomUser.user._id?.toString() ===
                          target?._id?.toString()
                      )
                    ) {
                      targetSocket = this.roomUsers[room].find(
                        (roomUser) =>
                          roomUser.user._id?.toString() ===
                          target?._id?.toString()
                      )?.socket[0];
                      break;
                    }
                  }

                  let sentMessage = await Message.create({
                    room: privateRoom._id,
                    user: user._id,
                    content: content.join(" "),
                  });

                  s.to(targetSocket || "").emit(
                    SocketEvents.SEND_MESSAGE,
                    sentMessage
                  );

                  s.emit(SocketEvents.SEND_MESSAGE, sentMessage);

                  if (!hasPrivateRoom) {
                    s.to(targetSocket || "").emit(
                      SocketEvents.CREATE_ROOM,
                      privateRoom
                    );

                    s.emit(SocketEvents.CREATE_ROOM, privateRoom);

                    Log.app(
                      `User #${message.user} (${user?.nickname}) created private room #${privateRoom._id} for user #${target._id} (${target.nickname})`
                    );
                  } else {
                    Log.app(
                      `User #${message.user} (${user?.nickname}) sent private message to user #${target._id} (${target.nickname}) in room #${privateRoom._id} (${privateRoom.name})`
                    );
                  }
                } catch (error) {
                  Log.error(
                    `Failed to send private message to user #${to} from user #${message.user} (${user?.nickname}): ${error}`
                  );
                }
                break;
              case Commands.JOIN_ROOM:
                try {
                  let targetRoom = await Room.model.findOne({ _id: arg });

                  if (!targetRoom || !targetRoom._id) {
                    Log.error(
                      `User #${message.user} (${user?.nickname}) is trying to join a non-existing room #${arg}`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: "This room doesn't exist",
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  if (!targetRoom.is_joinable) {
                    Log.error(
                      `User #${message.user} (${user?.nickname}) is trying to join room #${arg} without permission`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: "You can't join this room...",
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  await RoomsUser.create({
                    user: user._id,
                    room: targetRoom._id,
                  });

                  if (!s.rooms.has(arg)) {
                    s.join(arg);
                  }

                  Log.app(
                    `User #${message.user} (${user?.nickname}) has joined room #${arg}`
                  );

                  if (!targetRoom.is_public) {
                    s.emit(SocketEvents.JOIN_ROOM, targetRoom);
                    return;
                  }

                  s.nsp.emit(
                    SocketEvents.SEND_MESSAGE,
                    await Message.create({
                      room: targetRoom._id,
                      content: `${user?.nickname} has joined the room !`,
                      from_server: true,
                    })
                  );
                } catch (error) {
                  Log.error(
                    `Failed to join room #${arg} for user #${message.user} (${user?.nickname}): ${error}`
                  );
                }
                break;
              case Commands.QUIT_ROOM:
                try {
                  let roomToLeave = await Room.model.findOne({ _id: arg });

                  if (!roomToLeave || !roomToLeave._id) {
                    Log.error(
                      `User #${message.user} (${user?.nickname}) is trying to leave a non-existing room #${arg}`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: "This room doesn't exist",
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  let roomUser = await RoomsUser.model.findOne({
                    user: user._id,
                    room: roomToLeave._id,
                  });

                  if (!roomUser) {
                    Log.error(
                      `User #${message.user} (${user?.nickname}) is trying to leave room #${arg} without being in it`
                    );

                    s.emit(SocketEvents.SEND_MESSAGE, {
                      room: message.room,
                      user: null,
                      content: "You are not in this room",
                      from_server: true,
                      createdAt: moment().toDate(),
                    });
                    return;
                  }

                  await RoomsUser.delete(roomUser._id);

                  if (s.rooms.has(arg)) {
                    s.leave(arg);
                  }

                  Log.app(
                    `User #${message.user} has (${user?.nickname}) left room #${arg}`
                  );

                  if (!roomToLeave.is_public) {
                    s.emit(SocketEvents.LEAVE_ROOM, roomToLeave);
                    return;
                  }

                  s.nsp.emit(
                    SocketEvents.SEND_MESSAGE,
                    await Message.create({
                      room: roomToLeave._id,
                      content: `${user?.nickname} has left the room !`,
                      from_server: true,
                    })
                  );
                } catch (error) {
                  Log.error(
                    `Failed to leave room #${arg} for user #${message.user} (${user?.nickname}): ${error}`
                  );
                }
                break;
              default:
                Log.error(
                  `User #${message.user} (${user?.nickname}) sent an unknown command ${command}`
                );
                break;
            }

            Log.app(
              `Command ${command} has been executed by user #${message.user} (${user?.nickname})`
            );
            return;
          }

          s.nsp.emit(SocketEvents.SEND_MESSAGE, await Message.create(message));

          let type = message.is_image
            ? "image"
            : message.is_vocal
            ? "vocal"
            : "text";

          Log.info(
            `User #${message.user} (${
              user?.nickname
            }) sent message (${type}) to room #${message.room} (${
              room.name
            }): ${message?.content.substring(0, 80)}...`
          );
        } catch (error) {
          Log.error(
            `Failed to send message to room #${message.room}: ${error}`
          );
        }
      });

      s.on(SocketEvents.ADD_REACTION, async (data: ReactionType) => {
        try {
          let user = await User.model.findById(data.user);

          if (!user || !user._id) {
            Log.error(
              `Failed to find user #${data.user} on add reaction event`
            );
            return;
          }

          let message = await Message.model.findById(data.message);

          if (!message || !message._id) {
            Log.error(
              `Failed to find message #${data.message} on add reaction event`
            );
            return;
          }

          if (!data.content) {
            Log.error(
              `User #${user._id} (${user.nickname}) sent an empty reaction to message #${message._id}`
            );
            return;
          }

          let existingReaction = await Reaction.model.findOne({
            user: user._id,
            message: message._id,
            content: data.content,
          });

          if (existingReaction && existingReaction._id) {
            Log.error(
              `User #${user._id} (${user.nickname}) is trying to add a reaction to message #${message._id} that he already added`
            );
            return;
          }

          await Reaction.create(message, {
            user: user._id,
            message: message._id,
            content: data.content,
          });

          Log.app(
            `User #${user._id} (${user.nickname}) added reaction ${data.content} to message #${message._id}`
          );

          let messageWithReactions = await Message.find(message._id);

          s.nsp.emit(SocketEvents.SEND_MESSAGE, messageWithReactions);
        } catch (error) {
          Log.error(
            `Failed to add reaction to message #${data.message}: ${error}`
          );
        }
      });

      s.on(SocketEvents.REMOVE_REACTION, async (data: ReactionType) => {
        try {
          let user = await User.model.findById(data.user);

          if (!user || !user._id) {
            Log.error(
              `Failed to find user #${data.user} on remove reaction event`
            );
            return;
          }

          let message = await Message.model.findById(data.message);

          if (!message || !message._id) {
            Log.error(
              `Failed to find message #${data.message} on remove reaction event`
            );
            return;
          }

          let reaction = await Reaction.model.findOne({
            user: user._id,
            message: message._id,
            content: data.content,
          });

          if (!reaction || !reaction._id) {
            Log.error(
              `Failed to find reaction for user #${user._id} on message #${message._id}`
            );
            return;
          }

          await Reaction.delete(reaction);

          Log.app(
            `User #${user._id} (${user.nickname}) removed reaction (${reaction.content}) from message #${message._id}`
          );

          let messageWithoutDeletedReaction = await Message.find(message._id);

          s.nsp.emit(SocketEvents.SEND_MESSAGE, messageWithoutDeletedReaction);
        } catch (error) {
          Log.error(
            `Failed to remove reaction from message #${data.message}: ${error}`
          );
        }
      });

      s.on(SocketEvents.DISCONNECT, async () => {
        try {
          Log.info(`The socket #${s.id} has been disconnected`);

          for (const room of Object.keys(this.roomUsers)) {
            this.roomUsers[room] = this.roomUsers[room]?.filter((roomUser) => {
              return !roomUser.socket.includes(s.id);
            });
          }

          Log.debug(`Emitting disconnect event for socket #${s.id}`);
          s.nsp.emit(SocketEvents.UPDATE_ONLINE_USERS, this.roomUsers);
          s.disconnect();
        } catch (error) {
          Log.error(`Failed to disconnect socket #${s.id}: ${error}`);
        }
      });
    });
  }

  static io(): Server {
    return this._io;
  }
}
