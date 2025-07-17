import React from "react";

const LaporanHeader = ({ isVisible }) => {
  return (
    <header
      className={`text-center mb-6 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
      }`}>
      <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2 hover:text-green-800 transition-colors duration-300">
        Laporan Donasi Masjid
      </h1>
      <p className="text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors duration-300">
        Transparansi untuk Kepercayaan Jamaah
      </p>
    </header>
  );
};

export default LaporanHeader;
