import axios from "axios";

export const sendConnectionRequest = async (userId) => {
  const res = await axios.post(`/users/connect/${userId}`, {}, {
    withCredentials: true
  });

  return res.data;
};