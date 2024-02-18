import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import React, { useRef, useState } from "react";
import { BsImage, BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend, IoMdCloseCircle } from "react-icons/io";
import Picker from "emoji-picker-react";
import Toast from "../shared/Toast";
import { AudioRecorder } from "react-audio-voice-recorder";
import IMessage from "@/interfaces/IMessage";
import useTheme from "@/hooks/useTheme";

const commands = [
  {
    name: "nick",
    options: "<new_nickname>",
    description: "define a new nickname",
  },
  {
    name: "list",
    options: "<needle?>",
    description: "list the available channels",
  },
  {
    name: "create",
    options: "<room_name>",
    description: "create a new room",
  },
  {
    name: "delete",
    options: "<room_id>",
    description: "delete one of your room",
  },
  {
    name: "join",
    options: "<room_id>",
    description: "join a public or private joinable room",
  },
  {
    name: "quit",
    options: "<room_id>",
    description: "leave a room",
  },
  {
    name: "users",
    options: "",
    description: "list the users in the current room",
  },
  {
    name: "msg",
    options: "<user_uuid> <message>",
    description: "create a private room with a user and send a message",
  },
];

function ChatFooter({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState<string>("");
  const { socket, events } = useSocket();
  const { user } = useUser();
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const inputRef = useRef<any | null>(null);
  const fileRef = useRef<any | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] =
    useState<{ name: string; options: string; description: string }[]>(
      commands
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setShowCommands(false);
    if (value.startsWith("/")) {
      if (value.substring(1).startsWith(" ")) return;
      const filtered = commands.filter((command) => {
        return command.name.startsWith(value.substring(1).split(" ")[0].trim());
      });
      setFilteredCommands(filtered);
      setShowCommands(filtered.length > 0);
    }
  };

  const ClickedCommand = (command: string) => {
    setMessage(`/${command} `);
    setShowCommands(false);
    inputRef.current.focus();
  };

  const CommandPopup: React.FC = () => {
    return (
      <div className="command-popup">
        {filteredCommands.length != 0 && <h3>Available Commands</h3>}
        {filteredCommands.map((command, index) => (
          <div
            className="command"
            key={index}
            onClick={() => ClickedCommand(command.name)}
          >
            <p>/{command.name}</p>
            <p className="hidden sm:block">{command.options}</p>
            <p className="hidden sm:block">{command.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const onEmojiPick = (emojiObj: any) => {
    setMessage((prevInput) => prevInput + emojiObj.emoji);
    inputRef.current.focus();
  };

  const handleSendMessage = (e: any, message: string) => {
    e.preventDefault();
    setShowEmojiPicker(false);
    setShowCommands(false);
    if (message.trim() || image) {
      socket?.emit(events.SEND_MESSAGE, {
        room: roomId,
        user: user?._id,
        content: image ? image.split(",")[1] : message.trim(),
        is_image: image ? true : false,
      } as IMessage);
    }
    setInputDisabled(false);
    setMessage("");
    setImage(null);
  };

  const handleImageErrors = (e: any) => {
    const data = e.target.files[0];
    console.log(data);
    if (data.size > 1e7 || data.type.split("/")[0] !== "image") {
      console.log(data.size, data.type.split("/")[0]);
      console.log("The image is too big");
      data.size > 1e7
        ? setToastMessage("La taille de l'image ne doit pas dépasser 10 Mo")
        : setToastMessage("Veuillez utiliser un format d'image valide");
      e.target.value = "";
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
      return true;
    }
    return false;
  };

  const handleImageUpload = (e: any) => {
    setImage(null);
    const data = e.target.files[0];
    if (handleImageErrors(e)) return;
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64 = reader.result as string;
      setImage(base64);
      e.target.value = "";
    };
    reader.readAsDataURL(data);
    setInputDisabled(true);
    setMessage("");
  };

  async function audioToBase64(audioFile: any) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e: any) => resolve(e.target.result);
      reader.readAsDataURL(audioFile);
    });
  }
  const { theme } = useTheme()

  return (
    <>
      {showToast && <Toast message={toastMessage} />}
      {image && (
        <div className="relative border border-primary rounded-lg max-w-[6rem] h-24 ml-4 mb-1">
          <IoMdCloseCircle
            size={20}
            className="absolute -right-2 -top-2 text-xs cursor-pointer"
            onClick={() => setImage(null)}
          />
          <img src={image} className="w-full h-full object-contain" />
        </div>
      )}
      <div
        className={`basis-[8%] border-t-2 p-2 flex items-center gap-4 ${theme === "light" ? "text-primary" : "text-secondary"} `}
        style={{
          height: "80px",
          maxHeight: "80px",
          minHeight: "80px",
          bottom: 0,
          width: "100%",
          backgroundColor: theme === "light" ? "#331D2C" : "#EFE1D1",
          boxShadow: "0px -2px 5px 0px rgba(0,0,0,0.1)",
        }}
      >
        {message.length === 0 && (
          <>
            <BsImage
              size={20}
              className={`cursor-pointer ${theme === "light" ? "text-primary" : "text-secondary"}`}
              onClick={() => fileRef.current.click()}
            />
            <input
              type="file"
              name="image"
              ref={fileRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </>
        )}
        <div className="relative w-full">
          <div className="absolute -right-8 sm:right-0 bottom-12 ">
            {showEmojiPicker && (
              <Picker
                onEmojiClick={onEmojiPick}
                previewConfig={{ showPreview: false }}
              />
            )}
          </div>
          <BsEmojiSmileFill
            size={20}
            className={`cursor-pointer absolute top-[6px] right-2 ${theme === "light" ? "text-primary" : "text-secondary"}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          <form onSubmit={(e) => handleSendMessage(e, message)}>
            <input
              ref={inputRef}
              type="text"
              disabled={inputDisabled}
              value={message}
              className="w-full h-8 p-2 transition-all bg-gray-100 rounded-full focus:outline-none"
              placeholder="Something to say?"
              onChange={(e) => {
                setMessage(e.target.value), setShowEmojiPicker(false);
                handleInputChange(e);
              }}
            />
          </form>
        </div>
        {message.length === 0 && !image ? (
          <div className="hidden sm:block">
            <AudioRecorder
              onRecordingComplete={async (e) =>
                socket?.emit(events.SEND_MESSAGE, {
                  room: roomId,
                  user: user?._id,
                  content: ((await audioToBase64(e)) as string).split(",")[1],
                  is_vocal: true,
                } as IMessage)
              }
              audioTrackConstraints={{
                noiseSuppression: true,
                echoCancellation: true,
              }}
              onNotAllowedOrFound={(err) => console.table(err)}
              downloadOnSavePress={false}
              downloadFileExtension="webm"
              mediaRecorderOptions={{
                audioBitsPerSecond: 128000,
              }}
              showVisualizer={true}
            />
          </div>
        ) : (
          <IoMdSend
            size={28}
            className={`cursor-pointer ${theme === "light" ? "text-primary" : "text-secondary"}`}
            onClick={(e) => handleSendMessage(e, message)}
          />
        )}
        {showCommands && <CommandPopup />}
      </div>
    </>
  );
}

export default ChatFooter;
