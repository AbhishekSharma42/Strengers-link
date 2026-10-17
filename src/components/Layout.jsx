import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Toast from "./Toast";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-30
            bg-slate-950/50
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <Sidebar
        open={open}
        collapsed={collapsed}
        setOpen={setOpen}
        setCollapsed={setCollapsed}
      />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div
        className={`
          min-h-screen
          transition-[padding]
          duration-300
          ease-in-out
          ${
            collapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }
        `}
      >

        {/* HEADER */}

        <Header
          onMenu={() =>
            setOpen(true)
          }
          onSearch={(query) => {
            if (query?.trim()) {
              navigate(
                `/products?search=${encodeURIComponent(
                  query.trim()
                )}`
              );
            }
          }}
        />

        {/* =========================================
            PAGE CONTENT
        ========================================= */}

        <main
          className="
            min-h-[calc(100vh-72px)]
            px-3
            py-4
            sm:px-4
            lg:px-6
            lg:py-6
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1800px]
            "
          >
            <Outlet />
          </div>
        </main>

      </div>

      {/* =========================================
          GLOBAL TOAST
      ========================================= */}

      <Toast />

    </div>
  );
}