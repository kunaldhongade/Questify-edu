import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete, AiOutlineSend } from "react-icons/ai";
import { BsArrowBarDown } from "react-icons/bs";
import "./Chatbot.css";
import ChatbotHeader from "./ChatbotHeader";
import ChatMessage from "./ChatMessage";
import Form from "./Form";

interface ChatbotProps {
  setIsOpen: (isOpen: boolean) => void;
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
}

interface ChatLog {
  user: string;
  message: string;
}

const Chatbot: React.FC<ChatbotProps> = ({
  setIsOpen,
  isVerified,
  setIsVerified,
}) => {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [sentEmail, setSentEmail] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<ChatLog[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const chatLogNew = [...chatLog, { user: "me", message: `${input}` }];
    setInput("");
    setChatLog(chatLogNew);
    const messages = chatLogNew.map((message) => message.message).join("\n");
    try {
      const response = await fetch(
        "https://stack-overflow-clone-server-vq27.onrender.com/chatbot/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messages,
          }),
        }
      );
      const data = await response.json();
      setChatLog([...chatLogNew, { user: "gpt", message: `${data.message}` }]);
    } catch {
      setChatLog([
        ...chatLogNew,
        { user: "gpt", message: "Some error occurred. Try another question" },
      ]);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(
      "https://stack-overflow-clone-server-vq27.onrender.com/otp/sendOTP",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          subject: "Email Verification OTP",
          message:
            "Hi, As you are trying to verify, here is the OTP that you need to enter to verify your email address. If you didn't make this request, please ignore this email.",
          duration: 1,
        }),
      }
    );
    const data = await response.json();
    if (data.otp) {
      setSentEmail(true);
      toast.success("OTP Sent Successfully. Please wait up to 1-2 mins");
    } else {
      toast.error("Try again");
    }
  };

  const handleOTPSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(
      "https://stack-overflow-clone-server-vq27.onrender.com/otp/verifyOTP",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      }
    );
    const data = await response.json();
    if (data.valid) {
      toast.success("Successfully verified");
      setIsVerified(true);
    } else {
      toast.error("Wrong OTP!. Try again");
      setIsVerified(false);
    }
    setSentEmail(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <ChatbotHeader
          setIsOpen={setIsOpen}
          isVerified={isVerified}
          setChatLog={setChatLog}
        />
        <p>AI Chatbot</p>
      </div>
      <div className="chatbot-chat-window">
        {!isVerified ? (
          <>
            {!sentEmail ? (
              <form
                onSubmit={handleEmailSubmit}
                className="chatbot-chat-window-form"
              >
                <Form type={"Email"} value={email} setter={setEmail} />
                <button type="submit">Submit</button>
              </form>
            ) : (
              <form
                onSubmit={handleOTPSubmit}
                className="chatbot-chatwindow-form"
              >
                <Form type={"OTP"} value={otp} setter={setOtp} />
                <button type="submit">Submit</button>
              </form>
            )}
          </>
        ) : (
          chatLog.length === 0 && (
            <span className="chatbot-chat-window-starter">
              Ask your queries!
            </span>
          )
        )}
        {chatLog.map((message, index) => (
          <ChatMessage message={message} key={index} />
        ))}
      </div>
      <form className="chatbot-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(() => e.target.value)}
          className="chatbot-form"
          placeholder="Enter your doubt..."
          disabled={isVerified ? false : true}
        />
        <button
          className="chatbot-button"
          onClick={handleSubmit}
          disabled={isVerified ? false : true}
        >
          <AiOutlineSend size={15} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
