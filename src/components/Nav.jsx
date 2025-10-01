import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import NavList from "./NavList";

function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeItem, setActiveItem] = useState("Beranda"); // Track active menu item

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        } ${
          isScrolled
            ? "bg-white/20 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-white/95 backdrop-blur-sm shadow-sm"
        } py-4 lg:px-8`}>
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-transparent to-green-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500" />

        <div className="navbar-start relative z-10">
          {/* Mobile Menu Button with Animation */}
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost lg:hidden group relative overflow-hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <div className="absolute inset-0 bg-green-100 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 relative z-10 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "rotate-90 text-green-600"
                    : "text-gray-700"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>

            {/* Enhanced Mobile Dropdown */}
            <ul
              className={`menu menu-sm dropdown-content bg-white/95 backdrop-blur-md rounded-2xl z-50 mt-3 w-64 p-4 shadow-2xl border border-green-100 transform transition-all duration-300 ${
                isMobileMenuOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2"
              }`}>
              <NavList activeItem={activeItem} setActiveItem={setActiveItem} />
            </ul>
          </div>

          {/* Logo with Hover Animation */}
          <a
            href="/"
            className="btn btn-ghost text-xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-200 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10  flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white font-bold text-lg">
                  <img
                    src="/logo ulil.png"
                    alt="Deskripsi gambar"
                    class="w-full h-auto max-w-full rounded-lg shadow"
                  />
                </span>
              </div>
              <span className="font-bold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                Ulil Albab
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-center hidden lg:flex relative z-10">
          <ul className="menu menu-horizontal px-1 text-base font-medium space-x-2">
            <NavList activeItem={activeItem} setActiveItem={setActiveItem} />
          </ul>
        </div>

        {/* Login Button with Enhanced Animation */}
        <div className="navbar-end relative z-10">
          <a
            href="login"
            className="btn relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group border-none">
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg" />

            {/* Button Content */}
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Log In
            </span>

            {/* Shine Effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />
    </>
  );
}

export default Nav;
