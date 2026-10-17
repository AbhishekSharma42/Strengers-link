import React from "react";
import { NavLink } from "react-router-dom";

import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";

const items = [
  ["Dashboard", "/", LayoutDashboard],
  ["Products", "/products", Boxes],
  ["Categories", "/categories", FolderTree],
  ["Inventory", "/inventory", PackagePlus],
  ["Sales", "/sales", Receipt],
  ["Reports", "/reports", BarChart3],
  ["Settings", "/settings", Settings],
];

export default function Sidebar({
  open,
  collapsed,
  setOpen,
  setCollapsed,
}) {
  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-40
        flex
        flex-col
        overflow-visible
        border-r
        border-slate-800/80
        bg-slate-950
        text-white
        shadow-2xl
        shadow-slate-950/20
        transition-all
        duration-300
        ease-in-out

        ${collapsed ? "w-20" : "w-64"}

        ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
    >
      {/* =====================================================
          LOGO HEADER
      ====================================================== */}

      <div
        className={`
          flex
          h-16
          shrink-0
          items-center
          border-b
          border-white/10
          px-4
          ${
            collapsed
              ? "justify-center"
              : "justify-between"
          }
        `}
      >
        {/* Logo */}

        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              shadow-lg
              shadow-blue-600/30
            "
          >
            <Store
              size={19}
              strokeWidth={2.2}
            />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <div className="whitespace-nowrap text-lg font-bold tracking-tight">
                Store
                <span className="text-blue-400">
                  Pro
                </span>
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Management
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close */}

        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="
            rounded-xl
            p-2
            text-slate-400
            transition
            hover:bg-white/10
            hover:text-white
            lg:hidden
          "
        >
          <X size={20} />
        </button>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </div>
        )}

        <div className="space-y-1.5">
          {items.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `
                group
                relative
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  collapsed
                    ? "justify-center"
                    : ""
                }

                ${
                  isActive
                    ? `
                      bg-blue-600
                      text-white
                      shadow-lg
                      shadow-blue-600/20
                    `
                    : `
                      text-slate-400
                      hover:bg-white/[0.07]
                      hover:text-white
                    `
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}

                  {isActive && (
                    <span
                      className="
                        absolute
                        -left-3
                        h-7
                        w-1
                        rounded-r-full
                        bg-blue-400
                      "
                    />
                  )}

                  {/* Icon */}

                  <span
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? "bg-white/15"
                          : "bg-transparent group-hover:bg-white/10"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={
                        isActive ? 2.4 : 2
                      }
                    />
                  </span>

                  {/* Label */}

                  {!collapsed && (
                    <span className="truncate">
                      {label}
                    </span>
                  )}

                  {/* Collapsed tooltip */}

                  {collapsed && (
                    <span
                      className="
                        pointer-events-none
                        absolute
                        left-full
                        z-50
                        ml-3
                        hidden
                        whitespace-nowrap
                        rounded-lg
                        bg-slate-900
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-white
                        opacity-0
                        shadow-xl
                        ring-1
                        ring-white/10
                        transition-opacity
                        group-hover:block
                        group-hover:opacity-100
                      "
                    >
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* =====================================================
          SIDEBAR FOOTER
      ====================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/10
          p-3
        ">
        
        {/* Collapse Button */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(!collapsed)
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="
            absolute
            bottom-6
            -right-3
            hidden
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            border
            border-slate-700
            bg-slate-900
            text-slate-400
            shadow-lg
            transition-all
            duration-200
            hover:scale-110
            hover:border-blue-500
            hover:bg-blue-600
            hover:text-white
            lg:flex
          "
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}
        </button>
      </div>
    </aside>
  );
}