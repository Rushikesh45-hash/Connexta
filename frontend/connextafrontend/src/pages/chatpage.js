import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/chatpage.css";
import PrivateLayout from "../layouts/privatelayout";
import { createChatRoom, getMessages, sendMessage, markAsRead } from "../api/chatapi";
import axios from "axios";
import { connectSocket, disconnectSocket, getSocket } from "../socket/socket";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("user");

  const [chatroomId, setChatroomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [receiverUser, setReceiverUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // fetch current user id
  const fetchCurrentUser = async () => {
    const res = await axios.get("http://localhost:8000/users/checkprofilecomplete", {
      withCredentials: true,
    });

    if (res.data.success) {
      setCurrentUserId(res.data.data.user._id);
      return res.data.data.user._id;
    }

    return null;
  };

  // fetch receiver profile
  const fetchReceiverProfile = async () => {
    const res = await axios.get(`http://localhost:8000/users/user/${receiverId}`, {
      withCredentials: true,
    });

    if (res.data.success) {
      setReceiverUser(res.data.data);
    }
  };

  const initChat = async (userId) => {
    try {
      setLoading(true);

      // create/get chatroom
      const roomRes = await createChatRoom(receiverId);

      if (!roomRes.success) {
        setLoading(false);
        return;
      }

      const roomId = roomRes.data.chatroom_id;
      setChatroomId(roomId);

      // join socket room
      const socket = getSocket();
      if (socket) {
        socket.emit("join_room", roomId);
      }

      // fetch old messages
      const msgRes = await getMessages(receiverId);

      if (msgRes.success) {
        const sortedMessages = (msgRes.data.messages || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      }

      // mark as read when chat opens
      await markAsRead(roomId);

    } catch (error) {
      console.log("Chat init error:", error.response?.data || error);
    }

    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const tempMsg = {
      _id: Date.now(),
      sender_id: currentUserId,
      message: inputMessage,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputMessage("");
    scrollToBottom();

    try {
      const sendRes = await sendMessage(receiverId, tempMsg.message);

      if (sendRes.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? sendRes.data : m))
        );
      }
    } catch (error) {
      console.log("Send message error:", error.response?.data || error);
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    }
  };

  // SOCKET LISTENERS
  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectSocket(currentUserId);

    // receive message instantly
    socket.on("receive_message", async (data) => {
      setMessages((prev) => {
        const updated = [...prev, data].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        return updated;
      });

      // if chat is open, mark read instantly
      if (chatroomId) {
        await markAsRead(chatroomId);
      }

      scrollToBottom();
    });

    // update read status
    socket.on("messages_read", ({ chatroom_id }) => {
      if (chatroom_id?.toString() !== chatroomId?.toString()) return;

      // mark all my sent messages as read
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id?.toString() === currentUserId?.toString()
            ? { ...m, read: true }
            : m
        )
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("messages_read");
      disconnectSocket();
    };
  }, [currentUserId, chatroomId]);

  // MAIN INIT
  useEffect(() => {
    if (!receiverId) return;

    const start = async () => {
      const userId = await fetchCurrentUser();
      if (!userId) return;

      await fetchReceiverProfile();
      await initChat(userId);
    };

    start();
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <PrivateLayout>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-user">
            <img
              src={receiverUser?.avatar || "https://via.placeholder.com/150"}
              alt="user"
              className="chat-user-img"
            />
            <div>
              <h3 className="chat-user-name">
                {receiverUser?.full_name || "User"}
              </h3>
              <p className="chat-user-status">{loading ? "Loading..." : "Online"}</p>
            </div>
          </div>

          <div className="chat-header-actions">
            <button className="chat-header-btn">⋮</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-body">
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: "center" }}>No messages yet</p>
          ) : (
            messages.map((msg) => {
              const isMe =
                msg.sender_id?.toString() === currentUserId?.toString();

              return (
                <div key={msg._id} className={`chat-message ${isMe ? "me" : "other"}`}>
                  <div className="message-bubble">
                    {msg.message}

                    <div className="message-meta">
                      <span className="message-time">
                        {formatTime(msg.createdAt)}
                      </span>

                      {isMe && (
                        <span className="message-tick">
                          {msg.read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />

          <button className="chat-send-btn" onClick={handleSendMessage}>
            ➤
          </button>
        </div>
      </div>
    </PrivateLayout>
  );
}