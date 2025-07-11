import axios from "axios";
import { getUserToken } from "./userDetails";

const baseURL = process.env.REACT_APP_BASEURL;
const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
instance.interceptors.request.use(function (config) {
  const token = getUserToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (!originalConfig?.url.includes("/login") && err.response) {
      // Access Token was expired
      if (err.response.status === 401) {
        sessionStorage.clear();
        window.location.href =
          process.env.REACT_APP_LOGIN_GATEWAY_URL +
          `/login` +
          `?redirectURL=${process.env.REACT_APP_REDIRECT_URL}`;
      }
    }
    return Promise.reject(err);
  },
);

export const apiCall = async (apiFn) => {
  let data, error, statusCode;
  try {
    const response = await apiFn();
    data = response.data;
    statusCode = response.status;
  } catch (e) {
    error = e.message;
    data = e.response?.data;
  }
  return [data, error, statusCode];
};
export default instance;
