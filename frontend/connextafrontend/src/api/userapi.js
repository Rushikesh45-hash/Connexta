import {axiosInstance} from "./axiosinstance";

export const getCurrentUser = async () => {
  const res = await axiosInstance.get("http://localhost:8000/users/checkprofilecomplete");
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosInstance.get(`http://localhost:8000/users/user/${id}`);
  return res.data;
};