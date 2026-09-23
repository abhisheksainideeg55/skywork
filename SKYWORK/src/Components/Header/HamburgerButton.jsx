import React from "react";
import { FiMenu } from "react-icons/fi";

export default function HamburgerButton({ onClick, isOpen }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 active:bg-slate-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-150 cursor-pointer border border-slate-200/60"
    >
      <FiMenu className="w-5 h-5 transition-transform duration-200" aria-hidden="true" />
    </button>
  );
}
