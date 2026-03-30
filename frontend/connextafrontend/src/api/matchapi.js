const baseurl = "http://localhost:8000/users/matching";

export const getmatches = async (page = 1, limit = 10) => {
  const res = await fetch(`${baseurl}?page=${page}&limit=${limit}`, {
    method: "GET",
    credentials: "include"
  });

  return res.json();
};