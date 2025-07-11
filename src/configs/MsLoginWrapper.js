// src/configs/MsLoginWrapper.jsx
import { useNavigate } from "react-router-dom";
import MsLogin from "./MsLogin";
import { useAuth } from "../contexts/AuthContext";

function MsLoginWrapper() {
  const navigate = useNavigate();

  const afterloggedInCallBack = () => {
    navigate("/my-tickets");
  };

  return <MsLogin afterLoggedInCallBack={afterloggedInCallBack} />;
}

export default MsLoginWrapper;
