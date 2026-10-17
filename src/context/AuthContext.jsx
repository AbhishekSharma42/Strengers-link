import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_URL } from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // --------------------------------------------------
  // Restore login after refresh
  // --------------------------------------------------

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("store_user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Auth restore error:",
        error
      );

      localStorage.removeItem(
        "store_user"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Send OTP
  // --------------------------------------------------

  const sendOTP = async (email) => {
    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      return {
        ok: false,
        message: "Email is required",
      };
    }

    setOtpLoading(true);

    try {
      const response =
        await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8",
          },

          body: JSON.stringify({
            action: "sendOTP",
            email: cleanEmail,
          }),
        });

      const data =
        await response.json();

      if (!data.ok) {
        return {
          ok: false,
          message:
            data.message ||
            "Failed to send OTP",
        };
      }

      setOtpSent(true);

      return {
        ok: true,
        message:
          data.message ||
          "OTP sent successfully",
        data: data.data,
      };
    } catch (error) {
      console.error(
        "Send OTP error:",
        error
      );

      return {
        ok: false,
        message:
          "Unable to connect to server",
      };
    } finally {
      setOtpLoading(false);
    }
  };

  // --------------------------------------------------
  // Verify OTP
  // --------------------------------------------------

  const verifyOTP = async (
    email,
    otp
  ) => {
    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const cleanOTP =
      String(otp || "").trim();

    if (!cleanEmail) {
      return {
        ok: false,
        message: "Email is required",
      };
    }

    if (!cleanOTP) {
      return {
        ok: false,
        message: "OTP is required",
      };
    }

    setOtpLoading(true);

    try {
      const response =
        await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8",
          },

          body: JSON.stringify({
            action: "verifyOTP",
            email: cleanEmail,
            otp: cleanOTP,
          }),
        });

      const data =
        await response.json();

      if (!data.ok) {
        return {
          ok: false,
          message:
            data.message ||
            "Invalid OTP",
        };
      }

      const loggedInUser = {
        email: cleanEmail,
        authenticated: true,
      };

      setUser(loggedInUser);

      localStorage.setItem(
        "store_user",
        JSON.stringify(
          loggedInUser
        )
      );

      setOtpSent(false);

      return {
        ok: true,
        message:
          data.message ||
          "Login successful",
        data: data.data,
      };
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      return {
        ok: false,
        message:
          "Unable to connect to server",
      };
    } finally {
      setOtpLoading(false);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const logout = () => {
    setUser(null);
    setOtpSent(false);

    localStorage.removeItem(
      "store_user"
    );
  };

  // --------------------------------------------------
  // Context
  // --------------------------------------------------

  const value = {
    user,
    loading,
    otpSent,
    otpLoading,

    isAuthenticated:
      Boolean(user),

    sendOTP,
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// useAuth Hook
// --------------------------------------------------

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}