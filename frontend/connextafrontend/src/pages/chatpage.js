import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/chatpage.css";
import PrivateLayout from "../layouts/privatelayout";
import {
  createChatRoom,
  getMessages,
  sendMessage,
  markAsRead,
} from "../api/chatapi";
import axios from "axios";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../socket/socket";

export default function ChatPage() {
  const [searchParams] = useSearchParams();

  // receiverId is the user id of that person with whom we want to chat
  const receiverId = searchParams.get("user");

  // chatroomId will store the unique room id between current user and receiver user
  const [chatroomId, setChatroomId] = useState(null);

  // messages array will store all the chat messages
  const [messages, setMessages] = useState([]);

  // receiverUser stores the receiver user profile details
  const [receiverUser, setReceiverUser] = useState(null);

  // currentUserId stores logged-in user id
  const [currentUserId, setCurrentUserId] = useState(null);

  // inputMessage stores message text which user types in input box
  const [inputMessage, setInputMessage] = useState("");

  // loading is used to show loading state until messages are fetched
  const [loading, setLoading] = useState(true);

  // isReceiverOnline will store online/offline status of receiver user
  const [isReceiverOnline, setIsReceiverOnline] = useState(false);

  // ref is used for auto scrolling chat to bottom
  const messagesEndRef = useRef(null);

  // function to scroll chat to bottom automatically
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // function to format time like whatsapp style
  const formatTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // function for sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // this is temporary message shown instantly before API response
    const tempMsg = {
      _id: Date.now(), // temporary id
      sender_id: currentUserId,
      message: inputMessage,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // add message instantly in UI (optimistic update)
    setMessages((prev) => [...prev, tempMsg]);
    setInputMessage("");
    scrollToBottom();

    try {
      // send message to backend
      const sendRes = await sendMessage(receiverId, tempMsg.message);

      // replace temp message with actual saved message from backend
      if (sendRes.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? sendRes.data : m))
        );
      }
    } catch (error) {
      console.log("Send message error:", error.response?.data || error);

      // if sending fails then remove temp message
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    }
  };

  // SOCKET LISTENERS useEffect
  useEffect(() => {
    // socket will only connect after we get currentUserId
    if (!currentUserId) return;

    // connect socket with current user id
    const socket = connectSocket(currentUserId);

    // whenever message comes from backend we receive instantly
    socket.on("receive_message", async (data) => {
      setMessages((prev) => {
        const updated = [...prev, data].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        return updated;
      });

      // if chat is open then instantly mark messages as read
      if (chatroomId) {
        await markAsRead(chatroomId);
      }

      scrollToBottom();
    });

    // whenever receiver reads messages backend sends event "messages_read"
    socket.on("messages_read", ({ chatroom_id }) => {
      if (chatroom_id?.toString() !== chatroomId?.toString()) return;

      // mark all messages sent by me as read true
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id?.toString() === currentUserId?.toString()
            ? { ...m, read: true }
            : m
        )
      );
    });

    // ONLINE/OFFLINE status listener
    socket.on("user_status", ({ userId, status }) => {
      // if backend says receiver is online/offline then update state
      if (userId?.toString() === receiverId?.toString()) {
        setIsReceiverOnline(status === "online");
      }
    });

    // cleanup socket listeners when component unmounts
    return () => {
      socket.off("receive_message");
      socket.off("messages_read");
      socket.off("user_status");
      disconnectSocket();
    };
  }, [currentUserId, chatroomId, receiverId]);

  // MAIN INIT useEffect (fetch current user + receiver profile + chatroom + messages)
  useEffect(() => {
    if (!receiverId) return;

    // start is the main function which will initialize everything
    const start = async () => {
      try {
        setLoading(true);

        // fetch current logged in user id
        const res = await axios.get(
          "http://localhost:8000/users/checkprofilecomplete",
          { withCredentials: true }
        );

        if (!res.data.success) {
          setLoading(false);
          return;
        }

        const userId = res.data.data.user._id;
        setCurrentUserId(userId);

        // fetch receiver user profile details
        const receiverRes = await axios.get(
          `http://localhost:8000/users/user/${receiverId}`,
          { withCredentials: true }
        );

        if (receiverRes.data.success) {
          setReceiverUser(receiverRes.data.data);
        }

        // create/get chatroom id between current user and receiver
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

        // fetch old messages from backend
        const msgRes = await getMessages(receiverId);

        if (msgRes.success) {
          const sortedMessages = (msgRes.data.messages || []).sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          setMessages(sortedMessages);
        }

        // mark all messages as read when chat opens
        await markAsRead(roomId);

        setLoading(false);
      } catch (error) {
        console.log("Chat init error:", error.response?.data || error);
        setLoading(false);
      }
    };

    start();
  }, [receiverId]);

  // whenever messages update scroll to bottom
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

              {/* Online / Offline Status */}
              <p className="chat-user-status">
                {loading
                  ? "Loading..."
                  : isReceiverOnline
                  ? "Online"
                  : "Offline"}
              </p>
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
              // checking if message sender is current user or receiver
              const isMe =
                msg.sender_id?.toString() === currentUserId?.toString();

              return (
                <div
                  key={msg._id}
                  className={`chat-message ${isMe ? "me" : "other"}`}
                >
                  <div className="message-bubble">
                    {msg.message}

                    <div className="message-meta">
                      <span className="message-time">
                        {formatTime(msg.createdAt)}
                      </span>

                      {/* message read ticks */}
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

          {/* dummy div used for auto scrolling */}
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