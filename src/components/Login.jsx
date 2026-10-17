import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================
     SUBMIT LOGIN
  ========================= */

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {
      setError(
        "Please enter your username."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setSubmitting(true);

    /*
      Small timeout so the button
      gives a proper login feel.
    */

    setTimeout(() => {
      const result = login(
        cleanUsername,
        password
      );

      if (!result.success) {
        setError(
          result.message ||
            "Login failed."
        );
      }

      setSubmitting(false);
    }, 300);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* =========================
            LOGIN CARD
        ========================= */}

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">

          {/* LOGO / ICON */}

          <div className="mb-6 flex justify-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">

              <LockKeyhole size={30} />

            </div>

          </div>

          {/* TITLE */}

          <div className="mb-7 text-center">

            <h1 className="text-2xl font-bold text-slate-900">
              Store Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login to continue to your dashboard
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* USERNAME */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <div className="relative">

                <User
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (old) => !old
                    )
                  }
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={19} />

                  Sign In
                </>
              )}

            </button>

          </form>

          {/* DEFAULT LOGIN INFO */}

          <div className="mt-6 rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-semibold text-slate-500">
              Default Login
            </p>

            <div className="mt-2 space-y-1 text-sm">

              <p>
                <span className="font-medium">
                  Username:
                </span>{" "}
                admin
              </p>

              <p>
                <span className="font-medium">
                  Password:
                </span>{" "}
                admin123
              </p>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <p className="mt-5 text-center text-xs text-slate-400">
          Store Management System
        </p>

      </div>

    </div>
  );
}