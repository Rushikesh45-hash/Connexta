import axios from "axios";

const API = "http://localhost:8000/users";

axios.defaults.withCredentials = true;

// create or get chatroom
export const createChatRoom = async (receiverId) => {
  const res = await axios.post(`${API}/createchatroom/${receiverId}`);
  return res.data;
};

// get messages
export const getMessages = async (receiverId, cursor = null) => {
  let url = `${API}/getmessages/${receiverId}`;

  if (cursor) {
    url += `?cursor=${cursor}`;
  }

  const res = await axios.get(url);
  return res.data;
};

// send message
export const sendMessage = async (receiverId, message) => {
  const res = await axios.post(`${API}/sendmessage/${receiverId}`, { message });
  return res.data;
};

// mark as read
export const markAsRead = async (chatroomId) => {
  const res = await axios.post(`${API}/toseen/${chatroomId}`);
  return res.data;
};