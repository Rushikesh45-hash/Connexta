import axios from "axios";

export const getCurrentUser = async () => {
  const res = await axios.get("http://localhost:8000/users/checkprofilecomplete", {
    withCredentials: true,
  });

  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`http://localhost:8000/users/user/${id}`, {
    withCredentials: true,
  });

  return res.data;
};