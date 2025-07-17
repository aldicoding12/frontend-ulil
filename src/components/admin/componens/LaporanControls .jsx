/* eslint-disable no-unused-vars */
import React from "react";
import RangeSelector from "../../RangeSelector";
import PDFDownloadButton from "../../PDFDownloadButton";

const LaporanControls = ({
  selectedRange,
  onRangeChange,
  onDownload, // 🔄 Now expects function that takes range parameter
  downloading,
  loading,
  onShowPDFModal,
  animationPhase,
}) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 text-center">
      {/* Range Selector */}
      <div className="transform hover:scale-105 transition-transform duration-200">
        <RangeSelector
          selectedRange={selectedRange}
          onRangeChange={onRangeChange}
        />
      </div>

      {/* Download Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        <div className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
          <PDFDownloadButton
            onDownload={() => onDownload(selectedRange)} // 🔄 Call with selectedRange
            downloading={downloading}
            selectedRange={selectedRange}
            disabled={loading}
          />
        </div>
        <button
          className="px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transform hover:scale-105 transition-all duration-200 hover:shadow-lg active:scale-95"
          onClick={onShowPDFModal}
          disabled={loading}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0..."
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Opsi Lanjutan</span>
        </button>
      </div>
    </div>
  );
};

export default LaporanControls;
