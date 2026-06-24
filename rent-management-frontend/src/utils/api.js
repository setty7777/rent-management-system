import { handleAuthError } from "./auth";

const BASE_URL = process.env.REACT_APP_BASE;

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
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const isFormData = body instanceof FormData;

    // Automatically add /api prefix
    const url = `${BASE_URL}/api${endpoint}`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? body : body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 401) {
      handleAuthError(navigate);
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    let data = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok || data.success === false) {
      return {
        success: false,
        message: data.message || data.error || "Something went wrong",
      };
    }

    return data;
  } catch (error) {
    console.error("❌ API ERROR:", error);

    if (error.name === "AbortError") {
      return {
        success: false,
        message: "Request timeout",
      };
    }

    return {
      success: false,
      message: "Server not reachable",
    };
  }
};
