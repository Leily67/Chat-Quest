"use client";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import moment from "moment";
import IMessage from "@/interfaces/IMessage";
import { useSocket } from "@/contexts/SocketContext";
import { DotLoader } from "react-spinners";
import { IUser } from "@/interfaces/IUser";
import { useUser } from "@/contexts/UserContext";
import Picker from "emoji-picker-react";

const Message = ({ message }: { message: IMessage }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { user } = useUser();
  const { events, socket } = useSocket();

  const intoArray = (content: string) => content.split("<br />");

  const toggleReaction = (reaction: any) => {
    setShowEmojiPicker(false);
    socket?.emit(
      currentUserHasReacted(reaction.emoji)
        ? events.REMOVE_REACTION
        : events.ADD_REACTION,
      {
        message: message._id,
        content: reaction.emoji,
        user: user?._id,
      }
    );
  };

  const currentUserHasReacted = (emoji: string) => {
    return message.reactions?.find(
      (r) => r.user === user?._id && r.content === emoji
    );
  };

  return message.from_server ? (
    <div className="flex justify-center items-center px-3 py-1 text-white rounded-md bg-primary text-center">
      <div>
        {message.content.includes("<br />") ? (
          <div>
            {intoArray(message.content).map((part, index) => (
              <p key={index}>{part.trim()}</p>
            ))}
          </div>
        ) : (
          <p className="font-sans">{message.content}</p>
        )}
      </div>
    </div>
  ) : (
    <div>
      {message.is_image && (
        <img src={`data:image/png;base64,${message.content}`}></img>
      )}

      {message.is_vocal && (
        <audio
          controls={true}
          src={`data:audio/webm;base64,${message.content}`}
        ></audio>
      )}

      {!message.is_image && !message.is_vocal && (
        <div
          onClick={() => {
            if (user?._id === (message.user as IUser)._id) setIsEditing(true);
          }}
          className={`px-3 py-2 bg-gray-200 min-h-[40px] rounded-md message relative`}
          style={{
            borderRadius: "10px",
            maxHeight: "auto",
            wordWrap: "break-word",
            wordBreak: "break-all",
          }}
        >
          {isEditing ? (
            <input
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  socket?.emit(events.SEND_MESSAGE, {
                    _id: message._id,
                    user: user?._id,
                    content: e.currentTarget.value,
                    room: message.room,
                    message: message._id,
                  });
                  setIsEditing(false);
                }
              }}
              className="w-full h-full bg-gray-200"
              defaultValue={message.content}
              onBlur={(e) => {
                setIsEditing(false);
              }}
            />
          ) : (
            <p className="font-sans">{message.content}</p>
          )}
        </div>
      )}

      <div className="reactions">
        {message.reactions
          ?.filter(
            (reaction, index, self) =>
              index === self.findIndex((r) => r.content === reaction.content)
          )
          .map((reaction, index) => (
            <div
              key={`reaction-${index}-${reaction.message}`}
              className={`bubble ${
                currentUserHasReacted(reaction.content) && "active"
              }`}
              onClick={() =>
                toggleReaction({
                  emoji: reaction.content,
                })
              }
            >
              <p>{reaction.content}</p>
              <p className="font-thin">
                {
                  message.reactions?.filter(
                    (r) => r.content === reaction.content
                  ).length
                }
              </p>
            </div>
          ))}
        <div
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
          }}
          className="add-reaction bubble"
        >
          <p>+</p>
        </div>
        {showEmojiPicker && (
          <div className={`reaction-picker`}>
            <Picker
              reactionsDefaultOpen={true}
              onReactionClick={toggleReaction}
              onEmojiClick={toggleReaction}
              previewConfig={{ showPreview: true }}
              height={350}
              width={300}
            />
          </div>
        )}
      </div>
    </div>
  );
};

function ChatBody({ roomId }: { roomId: string }) {
  const [messagesLoaded, setMessagesLoaded] = useState<boolean>(false);
  const [roomMessages, setRoomMessages] = useState<IMessage[]>([]);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { rooms, messages } = useSocket();

  useEffect(() => {
    if (rooms.find((room) => room._id === roomId)) {
      let duplicateMessages: string[] = [];

      setRoomMessages([
        ...(rooms
          .find((room) => room._id === roomId)
          ?.messages?.map((roomMessage) => {
            if (
              messages[roomId]?.find(
                (message) => message._id === roomMessage._id
              )
            ) {
              duplicateMessages.push(roomMessage._id as string);
              return messages[roomId]?.find(
                (message) =>
                  !message.from_server && message._id === roomMessage._id
              ) as IMessage;
            } else {
              return roomMessage;
            }
          }) || []),
        ...(messages[roomId]?.filter(
          (message) => !duplicateMessages.includes(message._id as string)
        ) || []),
      ]);
      setMessagesLoaded(true);
    }
  }, [roomId, rooms, messages]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView();
  }, [roomMessages]);

  return (
    <div className="basis-[85%] overflow-y-scroll p-5 w-full flex flex-col gap-2">
      {messagesLoaded ? (
        <>
          {roomMessages?.length > 0 ? (
            <div className="flex justify-center items-center px-3 py-1 font-bold">
              <p className="font-sans">
                {roomMessages?.length > 0 &&
                  moment(roomMessages[0]?.createdAt).format("DD/MM/YYYY")}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-center font-thin">
                This is the beginning of the chat 🦄
              </p>
            </div>
          )}
          {roomMessages?.length > 0 &&
            roomMessages.map((message: IMessage, index: number) => {
              return message.user === null ? (
                <Message
                  key={`without-user-${message.createdAt}`}
                  message={message}
                />
              ) : (
                <div key={`with-user-${message._id || message.createdAt}`}>
                  <div className={"flex flex-col items-start"} key={index}>
                    <div className="flex gap-2 self-start" key={index}>
                      <div className="mt-1">
                        <Avatar
                          name={(message.user as IUser)?.uuid}
                          round={true}
                          size="40"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <p className="pl-2 text-sm align-bottom">
                            {(message.user as IUser)?.nickname?.concat(
                              " ",
                              (message.user as IUser)?.uuid.includes("#")
                                ? (message.user as IUser)?.uuid
                                : ""
                            )}
                          </p>
                          {message.is_edited && (
                            <div className="font-thin">&nbsp;modified</div>
                          )}
                        </div>
                        <Message message={message} />
                        <p className="flex py-2 pl-2 text-xs font-light text-black message-date">
                          {moment(message.createdAt).format(
                            "DD/MM/YYYY, HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  {roomMessages[index + 1]?.createdAt &&
                    moment(message.createdAt).format("DD/MM/YYYY") !=
                      moment(roomMessages[index + 1]?.createdAt).format(
                        "DD/MM/YYYY"
                      ) && (
                      <div className="flex justify-center items-center px-3 py-1 font-bold">
                        <p className="font-sans">
                          {moment(message.createdAt).format("DD/MM/YYYY")}
                        </p>
                      </div>
                    )}
                </div>
              );
            })}
        </>
      ) : (
        <div className="flex justify-center items-center w-full h-full">
          <DotLoader color="#A78295" className="mx-auto" size={150} />
        </div>
      )}
      <div ref={lastMessageRef} className="mt-auto text-slate-500"></div>
    </div>
  );
}

export default ChatBody;
