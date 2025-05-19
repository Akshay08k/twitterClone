import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000", // or your deployed URL
  withCredentials: true, // 🔒 send cookies with every request
});

export default instance;
