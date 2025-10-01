import React from "react";

// navigation

function NavList({ activeItem, setActiveItem }) {
  const navItems = [
    { name: "Profile", href: "/profile" },
    { name: "Berita", href: "/berita" },
    { name: "Kegiatan", href: "/kegiatan" },
    { name: "Inventaris", href: "/inventaris" },
    { name: "Laporan", href: "/laporan" },
    { name: "Donasi", href: "/donasi" },
    { name: "Kontak", href: "/contact" },
  ];
  return (
    <>
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
            {/* Active indicator - always visible for active item */}
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
