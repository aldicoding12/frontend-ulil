import React from "react";
import { Grid3X3, List } from "lucide-react";

const HeroSection = ({ viewMode, setViewMode, isVisible }) => {
  return (
    <div className="hero bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-spin"
          style={{ animationDuration: "15s", animationDirection: "reverse" }}
        />
      </div>

      <div className="hero-content text-center relative z-10">
        <div className="max-w-4xl">
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}>
            📅 KALENDER
            <span className="block text-green-200 mt-2 relative">
              KEGIATAN
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full mt-2"></div>
            </span>
          </h1>

          <p
            className={`text-xl text-green-100 mb-8 transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}>
            Lihat jadwal kegiatan Masjid Ulil Albab dalam tampilan kalender
          </p>

          {/* Tab Navigation */}
          <div
            className={`flex justify-center gap-4 transform transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}>
            <button
              onClick={() => setViewMode("calendar")}
              className={`btn gap-2 ${
                viewMode === "calendar"
                  ? "btn-neutral text-green-600"
                  : "btn-ghost text-white hover:bg-white/30"
              }`}>
              <Grid3X3 className="w-5 h-5" />
              📅 Kalender
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`btn gap-2 ${
                viewMode === "list"
                  ? "btn-neutral text-green-600"
                  : "btn-ghost text-white hover:bg-white/30"
              }`}>
              <List className="w-5 h-5" />
              📋 Daftar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
