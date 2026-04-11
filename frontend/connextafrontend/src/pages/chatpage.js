import React from "react";
import "../styles/chatpage.css";

export default function ChatPage() {
  return (
    <div className="chat-container">

      {/* Top Header */}
      <div className="chat-header">
        <div className="chat-user">
          <img
            src="https://i.pravatar.cc/150?img=47"
            alt="user"
            className="chat-user-img"
          />
          <div>
            <h3 className="chat-user-name">User Name</h3>
            <p className="chat-user-status">Online</p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="chat-header-btn">⋮</button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="chat-body">

        {/* Other User Message */}
        <div className="chat-message other">
          <div className="message-bubble">
            Hello 👋
            <span className="message-time">6:40 PM</span>
          </div>
        </div>

        {/* My Message */}
        <div className="chat-message me">
          <div className="message-bubble">
            Hi, how are you?
            <span className="message-time">6:41 PM</span>
          </div>
        </div>

      </div>

      {/* Bottom Input */}
      <div className="chat-footer">
        <button className="chat-footer-btn">😊</button>
        <button className="chat-footer-btn">📎</button>

        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
        />

        <button className="chat-send-btn">➤</button>
      </div>

    </div>
  );
}