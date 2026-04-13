

import {axiosInstance} from "./axiosinstance";

export const registeruser = async (formdata) => {
  const res = await axiosInstance.post("http://localhost:8000/users/register", formdata);
  return res.data;
};

export const loginuser = async (formdata) => {
  const res = await axiosInstance.post("http://localhost:8000/users/login", formdata);
  return res.data;
};

export const logoutuser = async () => {
  const res = await axiosInstance.post("http://localhost:8000/users/logout");
  return res.data;
};