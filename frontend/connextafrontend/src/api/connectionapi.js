import {axiosInstance} from "./axiosinstance";

export const sendConnectionRequest = async (userId) => {
  const res = await axiosInstance.post(`http://localhost:8000/users/connect/${userId}`);
  return res.data;
};

export const getPendingRequests = async () => {
  const res = await axiosInstance.get("http://localhost:8000/users/pending");
  return res.data;
};

export const reviewConnectionRequest = async (connectionId, status) => {
  const res = await axiosInstance.patch(`http://localhost:8000/users/review/${connectionId}`, { status });
  return res.data;
};

export const getMyConnections = async () => {
  const res = await axiosInstance.get("http://localhost:8000/users/myconnections");
  return res.data;
};

export const blockUser = async (blockedUserId) => {
  const res = await axiosInstance.post(`http://localhost:8000/users/block/${blockedUserId}`);
  return res.data;
};

export const unblockUser = async (blockedUserId) => {
  const res = await axiosInstance.post(`http://localhost:8000/users/unblock/${blockedUserId}`);
  return res.data;
};

export const getBlockedUsers = async () => {
  const res = await axiosInstance.get("http://localhost:8000/users/blockedusers");
  return res.data;
};

export const getAllProfiles = async () => {
  const res = await axiosInstance.get("http://localhost:8000/users/discover");
  return res.data;
};