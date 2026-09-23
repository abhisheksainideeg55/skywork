import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ brandHome = "/", portalBadge, isCollapsed = false }) {
  return (
    <Link
      to={brandHome}
      className={`flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg py-1 transition-all hover:opacity-95 ${isCollapsed ? "justify-center" : "gap-2.5"
        }`}
      aria-label="Skywork Home"
      title="Skywork HRMS"
    >
      {/* Responsive Logo Image - Always visible */}
      <img
        src="/logo2.png"
        alt="Skywork HRMS"
        className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03] shrink-0"
      />

      {portalBadge && !isCollapsed && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
          {portalBadge}
        </span>
      )}
    </Link>
  );
}
