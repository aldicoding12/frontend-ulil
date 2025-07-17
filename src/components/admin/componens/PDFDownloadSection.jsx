import React from "react";
import { REPORT_RANGES } from "../../../constants/reportConstants";

const PDFDownloadSection = ({ downloadPDF, downloading, animationPhase }) => {
  return (
    <section className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.01]">
      <h3 className="text-md font-semibold mb-3 text-blue-700">
        📊 Download Laporan PDF
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(REPORT_RANGES).map(([key, label], index) => (
          <button
            key={key}
            className={`px-3 py-2 text-sm rounded-lg text-white transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              downloading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"
            }`}
            onClick={() => downloadPDF(key)} // 🔄 Call downloadPDF with range
            disabled={downloading}
            style={{
              animationDelay: `${index * 100}ms`,
              animation:
                animationPhase >= 3
                  ? "slideInUp 0.5s ease-out forwards"
                  : undefined,
            }}>
            📊 Laporan {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Klik tombol di atas untuk mengunduh laporan dalam format PDF sesuai
        periode yang dipilih
      </p>
    </section>
  );
};

export default PDFDownloadSection;
