import { handleAuthError } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL; // ✅ ENV BASE URL

export const apiRequest = async ({
  endpoint,
  method = "GET",
  body = null,
  navigate,
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    handleAuthError(navigate);
    return { success: false, message: "No token" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // ⏱ 10s timeout

  try {
    const isFormData = body instanceof FormData;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData
        ? body
        : body
        ? JSON.stringify(body)
        : null,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // 🔐 Unauthorized
    if (res.status === 401) {
      handleAuthError(navigate);
      return { success: false, message: "Unauthorized" };
    }

    let data = {};
    try {
      data = await res.json();
    } catch {}

    // ❗ Handle backend errors
    if (!res.ok || data.success === false) {
      return {
        success: false,
        message:
          data.message ||
          data.error ||
          "Something went wrong",
      };
    }

    return data;

  } catch (error) {
    console.error("❌ API ERROR:", error);

    if (error.name === "AbortError") {
      return { success: false, message: "Request timeout" };
    }

    return {
      success: false,
      message: "Server not reachable",
    };
  }
};