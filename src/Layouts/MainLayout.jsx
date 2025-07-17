import React, { useState, useEffect } from "react";
import { useMatches, Outlet } from "react-router-dom";
import Side from "../components/admin/side";
import { Menu, Search, Bell, Moon, Maximize2 } from "lucide-react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const matches = useMatches();
  const activeTitle =
    matches.find((m) => m.handle?.title)?.handle?.title || "Dashboard";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Side
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0
          ${sidebarOpen ? (isCollapsed ? "md:ml-16" : "md:ml-64") : "ml-0"}
        `}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between min-w-0">
            {/* Left */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden flex-shrink-0">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-1 h-6 sm:h-8 bg-emerald-600 rounded-full flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                    {activeTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {formatDate()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {/* Search - Hidden on very small screens */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari sesuatu..."
                  className="pl-9 pr-4 py-2 w-48 lg:w-64 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* Separator */}
              <div className="w-px h-6 sm:h-8 bg-gray-200 hidden sm:block"></div>

              {/* User Profile */}
              <div className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100 rounded-lg p-1 sm:p-2 transition-colors cursor-pointer">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                  A
                </div>
                <div className="hidden lg:block min-w-0">
                  <span className="text-sm font-medium text-gray-700 block truncate">
                    Admin Masjid
                  </span>
                  <p className="text-xs text-gray-500 truncate">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-7xl mx-auto min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
