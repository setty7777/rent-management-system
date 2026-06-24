import { toast } from "react-toastify";

export const handleAuthError = (
  navigate,
  message = "Session expired. Please login again.",
) => {
  toast.error(message);

  localStorage.removeItem("token");

  if (typeof navigate === "function") {
    navigate("/");
  }
};
