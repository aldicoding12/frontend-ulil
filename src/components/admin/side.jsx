import React from "react";
import { sideList } from "./sideList";
import { NavLink } from "react-router-dom";
import { X, ChevronLeft } from "lucide-react";

const Side = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-all duration-300 border-r border-gray-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
        ${isCollapsed ? "md:w-16" : "md:w-64"} 
        w-64`}>
        {/* Header Section */}
        <div
          className={`p-4 border-b border-gray-200 ${
            isCollapsed ? "md:p-2" : ""
          }`}>
          <div className="flex justify-between items-center">
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "md:justify-center" : ""
              }`}>
              <div className="bg-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg">
                🕌
              </div>
              <div className={`${isCollapsed ? "md:hidden" : ""}`}>
                <h1 className="text-lg font-bold text-gray-800">
                  Masjid Admin
                </h1>
                <p className="text-sm text-gray-500">Dashboard Panel</p>
              </div>
            </div>

            {/* Toggle dan Close buttons */}
            <div className="flex items-center gap-1">
              <button
                className="hidden md:flex p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={onToggleCollapse}>
                <ChevronLeft
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isCollapsed ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                className="md:hidden p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {sideList.map((item, idx) => (
            <NavLink
              to={item.path}
              key={idx}
              end={item.path === "/pengurus"}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative
                ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                }
                ${isCollapsed ? "md:justify-center md:px-2" : ""}`
              }
              onClick={onClose}>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">{item.icon}</div>
                <span
                  className={`font-medium ${isCollapsed ? "md:hidden" : ""}`}>
                  {item.name}
                </span>

                {/* Badge */}
                {item.badge && !isCollapsed && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Tooltip untuk collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={`bg-gray-50 rounded-lg p-3 border ${
              isCollapsed ? "md:p-2" : ""
            }`}>
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "md:justify-center" : ""
              }`}>
              <div className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div
                className={`flex-1 min-w-0 ${isCollapsed ? "md:hidden" : ""}`}>
                <p className="font-semibold text-gray-800 text-sm">
                  Admin Masjid
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@masjid.com
                </p>
              </div>
              <div
                className={`w-2 h-2 bg-emerald-500 rounded-full ${
                  isCollapsed ? "md:hidden" : ""
                }`}></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Side;
