import React from "react";
import { NavLink } from "react-router-dom";

export default function DesktopNav({ navItems = [] }) {
  return (
    <nav
      className="hidden lg:flex items-center gap-1 xl:gap-2 h-full"
      aria-label="Main Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact ?? (item.path === "/" || item.path === "/hr" || item.path === "/super-admin")}
            className={({ isActive }) =>
              `relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "text-indigo-600 font-semibold bg-indigo-50/70 after:absolute after:bottom-[-10px] after:left-3 after:right-3 after:h-[2.5px] after:bg-indigo-600 after:rounded-full shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`
            }
          >
            {Icon && (
              <Icon
                className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200"
                aria-hidden="true"
              />
            )}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
