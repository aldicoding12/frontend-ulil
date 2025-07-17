import React from "react";
import { REPORT_RANGES } from "../constants/reportConstants";
import { formatCurrency } from "../utils/formatters";

const ChartSection = ({
  chartRef,
  chartData,
  totalIncome,
  totalExpense,
  selectedRange,
  isRealTime = false, // 🆕 Real-time indicator
  lastUpdate = null, // 🆕 Last update timestamp
}) => {
  // 🔍 Debug chart data
  // console.log("📊 ChartSection received:");
  // console.log("- chartData:", chartData);
  // console.log("- chartData length:", chartData?.length);
  // console.log("- totalIncome:", totalIncome);
  // console.log("- totalExpense:", totalExpense);
  // console.log("- isRealTime:", isRealTime);

  const hasValidChartData =
    chartData && Array.isArray(chartData) && chartData.length > 0;

  // 🔧 Fix: Safe way to check development mode
  const isDevelopment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("dev"));

  return (
    <div className="w-full bg-white p-6 rounded shadow">
      {/* 🚀 ENHANCED HEADER dengan Real-time Status */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Grafik Keuangan</h2>

        {/* 🆕 Real-time Status Indicator */}
        {isRealTime && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">
              Real-time
            </span>
          </div>
        )}
      </div>

      {/* 🆕 Last Update Info */}
      {lastUpdate && (
        <div className="mb-3 text-xs text-gray-500 text-center">
          Terakhir diperbarui: {new Date(lastUpdate).toLocaleString("id-ID")}
        </div>
      )}

      {/* 📊 CHART CONTAINER */}
      <div className="h-64 relative">
        {hasValidChartData ? (
          <div className="w-full h-full">
            <canvas ref={chartRef} className="w-full h-full"></canvas>

            {/* 🆕 Real-time Data Overlay */}
            {isRealTime && hasValidChartData && (
              <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                🔄 Live Data
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg
              className="w-12 h-12 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium">Data Grafik Tidak Tersedia</p>
            <p className="text-xs mt-1 text-center px-4">
              {!chartData
                ? "Belum ada data untuk ditampilkan"
                : chartData.length === 0
                ? "Tidak ada transaksi dalam periode ini"
                : "Format data tidak valid untuk grafik"}
            </p>
          </div>
        )}
      </div>

      {/* 🚀 ENHANCED STATS SECTION dengan Real-time Updates */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">
            Statistik {REPORT_RANGES[selectedRange]}
          </div>
          {/* 🆕 Data Freshness Indicator */}
          {isRealTime && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              📊 Data Terkini
            </div>
          )}
        </div>

        {/* 💰 FINANCIAL METRICS */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Total Pemasukan</div>
              {isRealTime && (
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="font-bold text-blue-600 text-sm mt-1">
              {formatCurrency(totalIncome || 0)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Total Pengeluaran</div>
              {isRealTime && (
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="font-bold text-red-600 text-sm mt-1">
              {formatCurrency(totalExpense || 0)}
            </div>
          </div>
        </div>

        {/* 📈 NET CHANGE dengan Enhanced Visual */}
        <div className="mt-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Perubahan Bersih</div>
            {isRealTime && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
          <div
            className={`font-bold text-sm mt-1 flex items-center gap-2 ${
              (totalIncome || 0) - (totalExpense || 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}>
            <span>
              {formatCurrency((totalIncome || 0) - (totalExpense || 0))}
            </span>
            {/* 🆕 Trend Indicator */}
            {(totalIncome || 0) - (totalExpense || 0) >= 0 ? (
              <span className="text-xs">📈</span>
            ) : (
              <span className="text-xs">📉</span>
            )}
          </div>

          {/* 🆕 Percentage of Income */}
          {totalIncome > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {(
                (((totalIncome || 0) - (totalExpense || 0)) / totalIncome) *
                100
              ).toFixed(1)}
              % dari pemasukan
            </div>
          )}
        </div>

        {/* 📊 CHART DATA STATUS */}
        {hasValidChartData && (
          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-700">
                ✅ Grafik menampilkan {chartData.length} titik data
              </div>
              {isRealTime && (
                <div className="text-xs text-green-600 font-medium">
                  🔄 Auto-update
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔧 Debug button untuk development */}
        {isDevelopment && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  console.log("🔍 Chart Debug Info:");
                  console.log("chartData:", chartData);
                  console.log("selectedRange:", selectedRange);
                  console.log("hasValidChartData:", hasValidChartData);
                  console.log("isRealTime:", isRealTime);
                  console.log("lastUpdate:", lastUpdate);
                }}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                🔍 Debug Chart Data
              </button>

              {isRealTime && (
                <button
                  onClick={() => {
                    console.log("🚀 Real-time Status:");
                    console.log("- Data Points:", chartData?.length || 0);
                    console.log("- Last Update:", lastUpdate);
                    console.log("- Total Income:", totalIncome);
                    console.log("- Total Expense:", totalExpense);
                  }}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors">
                  🚀 Real-time Status
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSection;
