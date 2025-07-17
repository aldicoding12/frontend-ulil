/* eslint-disable no-unused-vars */
import React from "react";
import { getCategoryColor } from "../../../../utils/constants";

const CalendarLegend = ({ viewMode }) => {
  if (viewMode !== "calendar") return null;

  return (
    <div className="card bg-base-100 shadow-lg mt-8 border border-gray-100">
      <div className="card-body p-6">
        <div className="divider"></div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <span className="font-bold">📍 Hari ini</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-200 border-2 border-green-400 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
            <span className="font-bold">👆 Tanggal terpilih</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-bold">✨ Ada kegiatan</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50/50 border-2 border-blue-200 rounded-xl flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
            </div>
            <span className="font-bold">🏖️ Hari libur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
