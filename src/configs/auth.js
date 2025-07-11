import axios, { apiCall } from "./services";

export const getLoggedUserData = async (email) => {
  const [data, error] = await apiCall(() => axios.post(`/login/${email}`));
  if (error) {
    return error;
  } else {
    return data;
  }
};
