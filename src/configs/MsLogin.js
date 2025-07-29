import React, { useEffect, useState } from "react";
// import { getLoggedUserData } from "../../services/Auth";
import { getLoggedUserData } from "./auth";
// import SpinnerComponent from "../../@core/components/spinner/Fallback-spinner";
// import { getUserDetails } from "../../services/userDetails";
// import { getUserDetails } from "./userDetails";
// import { getUserDetails } from "./userDetails";
import { getUserDetails } from "./userDetails";
import brandLogo from "../assets/images/IX2.png";
const config = require('../assets/config.json')

function MsLogin({ afterLoggedInCallBack }) {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get("userData");

    if (userData !== undefined && userData) {
      sessionStorage.setItem("8ee22acb-94b0-481d-b11b-f87168b880e3", userData);
      const userDetails = await getUserDetails();
      setLoading(true);
      await getLoggedUserData(userDetails.userEmail).then((data) => {
        if (data.token) {
          sessionStorage.setItem(
            "8ee22acb-94b0-481d-b11b-f87168b880e3",
            data.token,
          );
        }
      });
      afterLoggedInCallBack(userDetails);
      window.location.href = `${config.REACT_APP_URL}/my-tickets`;
      setLoading(false);
    } else {
      window.location.href =
        config.REACT_APP_LOGIN_GATEWAY_URL +
        `/login` +
        `?redirectURL=${config.REACT_APP_REDIRECT_URL}`;
    }
    setLoading(false);
  }

  useEffect(() => {
    handleLogin();
  }, []); // ✅ No need to add handleLogin to dependency list

  return (
    <div>
      {!loading ? (
        <div className="signout-container">
          <div className="Signout-div">
            <div className="w-70">
              <img
                src={brandLogo}
                style={{ width: "70px", objectFit: "cover" }}
                alt="brandlogo"
              />
              <h1 className="signout-header">Redirecting...</h1>
            </div>
          </div>
        </div>
      ) : null}
      {/* {loading && <SpinnerComponent />} */}
      {loading && "LOADING..."}
    </div>
  );
}

export default MsLogin;
