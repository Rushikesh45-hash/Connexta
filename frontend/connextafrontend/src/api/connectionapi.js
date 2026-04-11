import axios from "axios";

export const sendConnectionRequest = async (userId) => {
  const res = await axios.post(`http://localhost:8000/users/connect/${userId}`, {}, {
    withCredentials: true
  });

  return res.data;
};

export const getPendingRequests = async () => {
  const res = await axios.get("http://localhost:8000/users/pending", {
    withCredentials: true
  });
  return res.data;
};

export const reviewConnectionRequest = async (connectionId, status) => {
  const res = await axios.patch(`http://localhost:8000/users/review/${connectionId}`, { status }, {
    withCredentials: true
  });
  return res.data;
};

export const getMyConnections = async () => {
  const res = await axios.get("http://localhost:8000/users/myconnections", {
    withCredentials: true
  });
  return res.data;
};