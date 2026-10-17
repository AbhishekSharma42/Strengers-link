import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    sendOTP,
    verifyOTP,
    otpSent,
    otpLoading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const result =
      await sendOTP(email);

    if (result.ok) {
      setMessage(
        "OTP sent successfully. Please check your email."
      );
    } else {
      setError(
        result.message ||
          "Failed to send OTP"
      );
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const result =
      await verifyOTP(
        email,
        otp
      );

    if (result.ok) {
      navigate("/", {
        replace: true,
      });
    } else {
      setError(
        result.message ||
          "Invalid OTP"
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "#f3f4f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Store Management
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "28px",
          }}
        >
          Login with Email OTP
        </p>

        {!otpSent ? (
          <form
            onSubmit={
              handleSendOTP
            }
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding: "12px 14px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "10px",
                outline: "none",
                fontSize: "15px",
              }}
            />

            <button
              type="submit"
              disabled={otpLoading}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "12px",
                border: "none",
                borderRadius: "10px",
                background:
                  "#2563eb",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor:
                  otpLoading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {otpLoading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={
              handleVerifyOTP
            }
          >
            <p
              style={{
                color: "#374151",
                marginBottom: "16px",
              }}
            >
              OTP sent to:
              <br />
              <strong>
                {email}
              </strong>
            </p>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Enter OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6 digit OTP"
              inputMode="numeric"
              maxLength={6}
              required
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding: "12px 14px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "10px",
                outline: "none",
                fontSize: "18px",
                letterSpacing:
                  "5px",
                textAlign: "center",
              }}
            />

            <button
              type="submit"
              disabled={
                otpLoading ||
                otp.length !== 6
              }
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "12px",
                border: "none",
                borderRadius: "10px",
                background:
                  "#2563eb",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor:
                  otpLoading ||
                  otp.length !== 6
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {otpLoading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtp("");
                setMessage("");
                setError("");
                setOtpSent(false);
              }}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "11px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "10px",
                background:
                  "#ffffff",
                cursor: "pointer",
              }}
            >
              Change Email
            </button>
          </form>
        )}

        {message && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px",
              borderRadius: "10px",
              background:
                "#ecfdf5",
              color: "#047857",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px",
              borderRadius: "10px",
              background:
                "#fef2f2",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}