import {
  Bell,
  Menu,
  RefreshCw,
  Search,
  UserCircle,
  LogOut,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

export default function Header({ onMenu, onSearch }) {
  const {
    settings,
    refreshData,
    loading,
  } = useStore();

  const { logout } = useAuth();

  const [searchFocused, setSearchFocused] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const handleRefresh = async () => {
    if (loading) return;

    try {
      await refreshData();
    } catch (error) {
      console.error(
        "Refresh failed:",
        error
      );
    }
  };

  const today =
    new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

  return (
    <header
      className="
        sticky top-0 z-30
        h-[72px]
        border-b border-slate-200/80
        bg-white/90
        backdrop-blur-xl
        app-header
      "
    >
      <div
        className="
          flex h-full items-center
          gap-3
          px-3
          sm:px-4
          lg:px-6
        "
      >
        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <button
          type="button"
          onClick={onMenu}
          className="
            flex h-10 w-10
            shrink-0
            items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-600
            shadow-sm
            transition-all
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            active:scale-95
            lg:hidden
          "
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className={`
            relative
            hidden
            max-w-xl
            flex-1
            md:block
            transition-all
            duration-200
            ${
              searchFocused
                ? "md:max-w-2xl"
                : ""
            }
          `}
        >
          <Search
            size={19}
            className={`
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              transition-colors
              ${
                searchFocused
                  ? "text-blue-500"
                  : "text-slate-400"
              }
            `}
          />

          <input
            type="text"
            onFocus={() =>
              setSearchFocused(true)
            }
            onBlur={() =>
              setSearchFocused(false)
            }
            onChange={(e) => {
              onSearch?.(
                e.target.value
              );
            }}
            placeholder="Search products, SKU..."
            className={`
              h-11
              w-full
              rounded-2xl
              border
              bg-slate-50/80
              pl-11
              pr-4
              text-sm
              text-slate-700
              outline-none
              placeholder:text-slate-400
              transition-all
              duration-200
              ${
                searchFocused
                  ? `
                    border-blue-300
                    bg-white
                    shadow-[0_0_0_4px_rgba(59,130,246,0.08)]
                  `
                  : `
                    border-slate-200
                    hover:border-slate-300
                  `
              }
            `}
          />
        </div>

        {/* =================================================
            MOBILE SEARCH BUTTON
        ================================================= */}

        <button
          type="button"
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:bg-slate-50
            md:hidden
          "
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

          {/* =================================================
              DATE
          ================================================= */}

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2
              text-slate-600
              lg:flex
            "
          >
            <CalendarDays
              size={16}
              className="text-slate-400"
            />

            <span className="text-xs font-medium">
              {today}
            </span>
          </div>

          {/* =================================================
              REFRESH
          ================================================= */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            title={
              loading
                ? "Refreshing data..."
                : "Refresh data"
            }
            className={`
              flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-3
              text-sm
              font-medium
              transition-all
              active:scale-95
              ${
                loading
                  ? `
                    cursor-not-allowed
                    border-blue-100
                    bg-blue-50
                    text-blue-600
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-500
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-600
                  `
              }
            `}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading && (
              <span className="hidden sm:inline">
                Refreshing...
              </span>
            )}
          </button>

          {/* =================================================
              NOTIFICATION
          ================================================= */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (v) => !v
                )
              }
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-500
                transition-all
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
                active:scale-95
              "
              title="Notifications"
            >
              <Bell size={18} />

              {/* Notification dot */}
              <span
                className="
                  absolute
                  right-2
                  top-2
                  h-2
                  w-2
                  rounded-full
                  bg-red-500
                  ring-2
                  ring-white
                "
              />
            </button>

            {notificationOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-[300px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                "
              >
                <div
                  className="
                    border-b
                    border-slate-100
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Stay updated with your store
                      </p>
                    </div>

                    <span
                      className="
                        rounded-full
                        bg-blue-50
                        px-2
                        py-1
                        text-[10px]
                        font-semibold
                        text-blue-600
                      "
                    >
                      New
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div
                    className="
                      rounded-xl
                      bg-slate-50
                      p-3
                    "
                  >
                    <p className="text-sm font-medium text-slate-700">
                      You're all caught up
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No new notifications right now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (v) => !v
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-2
                py-1.5
                transition-all
                hover:border-slate-300
                hover:bg-slate-50
                active:scale-[0.98]
              "
            >
              {/* Avatar */}
              <div
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-600
                  text-white
                  shadow-sm
                "
              >
                <UserCircle
                  size={19}
                />
              </div>

              <div className="hidden text-left xl:block">
                <p
                  className="
                    max-w-[130px]
                    truncate
                    text-xs
                    font-semibold
                    text-slate-700
                  "
                >
                  {settings?.storeName ||
                    "My Store"}
                </p>

                <p className="text-[10px] text-slate-400">
                  Store Admin
                </p>
              </div>

              <ChevronDown
                size={15}
                className="
                  hidden
                  text-slate-400
                  xl:block
                "
              />
            </button>

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-60
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                "
              >
                {/* Profile Header */}

                <div
                  className="
                    bg-gradient-to-br
                    from-blue-600
                    to-indigo-600
                    p-4
                    text-white
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-xl
                        bg-white/20
                        backdrop-blur
                      "
                    >
                      <UserCircle
                        size={25}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {settings?.storeName ||
                          "My Store"}
                      </p>

                      <p className="text-xs text-blue-100">
                        Store Administrator
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Info */}

                <div className="p-2">
                  <div
                    className="
                      rounded-xl
                      px-3
                      py-2.5
                      text-xs
                      text-slate-500
                    "
                  >
                    <span className="font-medium text-slate-700">
                      Store
                    </span>

                    <p className="mt-0.5 truncate">
                      {settings?.storeName ||
                        "My Store"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}