import { jwtDecode } from "jwt-decode";
export async function getUserDetails() {
  let storedUserData = sessionStorage.getItem(
    "8ee22acb-94b0-481d-b11b-f87168b880e3",
  );

  if (!storedUserData || storedUserData.trim() === "{}") {
    return null;
  }
  let data = await jwtDecode(storedUserData);
  sessionStorage.setItem("userData", JSON.stringify(data));
  return {
    userId: data.acr,
    userEmail: data.email,
    roleId: data.amr,
    userName: data.actort,
    roleName: data.RoleName,
    category: data.Category,
    canWrite: data.CanWrite,
  };
}
export function getUserToken() {
  return sessionStorage.getItem("8ee22acb-94b0-481d-b11b-f87168b880e3");
}
