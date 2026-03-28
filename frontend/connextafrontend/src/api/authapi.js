const baseurl = "http://localhost:8000/users"; 


export const registeruser = async (formdata) => {
  const res = await fetch(`${baseurl}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(formdata)
  });

  return res.json();
};

export const loginuser = async (formdata) => {
  const res = await fetch(`${baseurl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(formdata)
  });

  return res.json();
};