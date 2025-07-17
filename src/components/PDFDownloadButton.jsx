import React from "react";

const PDFDownloadButton = ({
  onDownload,
  downloading,
  selectedRange,
  disabled,
}) => (
  <button
    className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
      downloading || disabled
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
    onClick={() => onDownload(selectedRange)}
    disabled={downloading || disabled}>
    {downloading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
        Mengunduh...
      </>
    ) : (
      <>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download PDF
      </>
    )}
  </button>
);

export default PDFDownloadButton;
