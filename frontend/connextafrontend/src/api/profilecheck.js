export const getme = async () => {
  const res = await fetch("http://localhost:8000/users/checkprofilecomplete", {
    method: "GET",
    credentials: "include"
  });

  return res.json();
};
