import axios from "axios";

let accessToken = sessionStorage.getItem("carebridge_access_token");

export function setAccessToken(token) {
  accessToken = token;
  sessionStorage.setItem("carebridge_access_token", token);
}

export function clearAccessToken() {
  accessToken = null;
  sessionStorage.removeItem("carebridge_access_token");
  sessionStorage.removeItem("carebridge_user");
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;