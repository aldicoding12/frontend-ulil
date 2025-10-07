import React, { useState } from "react";

function NavList({ activeItem, setActiveItem }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileSubItems = [
    { name: "Profile", href: "/profile" },
    { name: "Galeri", href: "/galeri" },
    { name: "Struktur Organisasi", href: "/struktur-organisasi" },
  ];

  const navItems = [
    { name: "Berita", href: "/berita" },
    { name: "Kegiatan", href: "/kegiatan" },
    { name: "Inventaris", href: "/inventaris" },
    { name: "Laporan", href: "/laporan" },
    { name: "Donasi", href: "/donasi" },
    { name: "Kontak", href: "/contact" },
  ];

  return (
    <>
      {/* Profile Dropdown */}
      <li
        className="group relative"
        onMouseEnter={() => setIsProfileOpen(true)}
        onMouseLeave={() => setIsProfileOpen(false)}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsProfileOpen(!isProfileOpen);
          }}
          className={`relative overflow-hidden transition-all duration-300 hover:text-green-600 rounded-lg px-4 py-2 flex items-center gap-1 ${
            profileSubItems.some((item) => activeItem === item.name)
              ? "text-green-600"
              : "text-gray-700 hover:bg-green-50"
          }`}>
          Profile
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {/* Active indicator */}
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-green-600 transition-all duration-300 ${
              profileSubItems.some((item) => activeItem === item.name)
                ? "w-full"
                : "w-0 group-hover:w-full"
            }`}></span>
        </a>

        {/* Dropdown Menu */}
        <ul
          className={`absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-green-100 overflow-hidden transition-all duration-300 origin-top z-50 ${
            isProfileOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}>
          {profileSubItems.map((item, index) => (
            <li key={index} className="group/sub">
              <a
                href={item.href}
                onClick={() => {
                  setActiveItem(item.name);
                  setIsProfileOpen(false);
                }}
                className={`block px-4 py-3 transition-all duration-200 ${
                  activeItem === item.name
                    ? "bg-green-50 text-green-600 font-medium"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600 hover:pl-6"
                }`}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </li>

      {/* Regular Nav Items */}
      {navItems.map((item, index) => (
        <li key={index} className="group">
          <a
            href={item.href}
            onClick={() => setActiveItem(item.name)}
            className={`relative overflow-hidden transition-all duration-300 hover:text-green-600 rounded-lg px-4 py-2 ${
              activeItem === item.name
                ? "text-green-600"
                : "text-gray-700 hover:bg-green-50"
            }`}>
            {item.name}

            {/* Active indicator */}
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-green-600 transition-all duration-300 ${
                activeItem === item.name ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
          </a>
        </li>
      ))}
    </>
  );
}

export default NavList;
