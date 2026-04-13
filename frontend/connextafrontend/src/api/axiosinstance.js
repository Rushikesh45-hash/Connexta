import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// interceptor runs on every response error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if token expired
    if (error.response && error.response.status === 401) {
      alert("Session expired. Please login again.");

      // redirect to login
      window.location.href = "http://localhost:8000/users/login";
    }

    return Promise.reject(error);
  }
);

