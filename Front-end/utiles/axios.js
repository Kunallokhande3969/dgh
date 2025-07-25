import axios from "axios";

const instance = axios.create({
  baseURL: "https://jobs-and-internships.onrender.com/", 
  withCredentials: true,  
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Optionally redirect to login
      }
      if (error.response.status === 405) {
        console.error("Method Not Allowed - Backend route/method mismatch.");
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
