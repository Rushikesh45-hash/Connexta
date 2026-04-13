

import {axiosInstance} from "./axiosinstance";

export const getmatches = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(`http://localhost:8000/users/matching?page=${page}&limit=${limit}`);
  return res.data;
};