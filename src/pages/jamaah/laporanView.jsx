/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PDFDownloadModal from "../../components/PDFDownloadModal";

// Zustand Store
import { useFinanceStore } from "../../store/financeStore";

// Custom Hooks
import { usePDFDownload } from "../../hooks/usePDFDownload";
import { useChart } from "../../hooks/useChart";

// Components
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import FinancialSummary from "../../components/FinancialSummary";
import ChartSection from "../../components/ChartSection";
import RangeSelector from "../../components/RangeSelector";
import PDFDownloadButton from "../../components/PDFDownloadButton";
// Utils & Constants
import { formatCurrency } from "../../utils/formatters";
import { REPORT_RANGES } from "../../constants/reportConstants";

// Helper function untuk mendapatkan tanggal hari ini dengan timezone lokal
const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function LaporanView() {
  // Store states
  const {
    currentBalance,
    formattedBalance,
    balanceLoading,
    balanceError,
    reportData,
    reportLoading,
    reportError,
    currentRange,
    currentDate,
    syncStatus,
    lastSyncTime,
    fetchBalance,
    syncBalance,
    fetchReport,
    clearErrors,
    setFilter,
  } = useFinanceStore();

  // Local states
  const [selectedRange, setSelectedRange] = useState("weekly");
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // PDF download hook
  const { downloading, error: pdfError, downloadPDF } = usePDFDownload();

  // Chart hook
  const chartRef = useChart(reportData.chartData, currentRange);

  // Destructure report data
  const {
    incomes,
    expenses,
    totalIncome,
    totalExpense,
    saldoAwal,
    saldoAkhir,
    chartData,
  } = reportData;

  // Combined error
  const error = reportError || pdfError || balanceError;

  // Initial load - weekly default dengan tanggal hari ini
  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        const today = getTodayLocalDate();

        setSelectedRange("weekly");
        await fetchBalance();
        setFilter("weekly", today);
        setTimeout(async () => {
          await fetchReport("weekly", today);
        }, 500);
        clearErrors();
      } catch (error) {
        console.error(error);
      }
    };
    loadWeeklyData();
  }, []);

  // Animation effects
  useEffect(() => {
    setIsVisible(true);
    const timer1 = setTimeout(() => setAnimationPhase(1), 200);
    const timer2 = setTimeout(() => setAnimationPhase(2), 400);
    const timer3 = setTimeout(() => setAnimationPhase(3), 600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Range change handler dengan tanggal hari ini
  const handleRangeChange = (newRange) => {
    setSelectedRange(newRange);
    const today = getTodayLocalDate();
    setFilter(newRange, today);
  };

  // Sync balance
  const handleSyncBalance = async () => {
    try {
      const result = await syncBalance();
      if (result.success) {
        setSuccessMessage(
          "🔄 Data berhasil disinkronisasi! Laporan telah terupdate."
        );
      } else {
        alert("Gagal melakukan sinkronisasi: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat sinkronisasi data");
    }
  };

  // Force weekly refresh dengan tanggal hari ini
  const handleForceWeekly = async () => {
    try {
      const today = getTodayLocalDate();

      setSelectedRange("weekly");
      setFilter("weekly", today);
      await fetchReport("weekly", today);
      setSuccessMessage("✅ Laporan mingguan berhasil dimuat!");
    } catch (error) {
      console.error(error);
    }
  };

  // PDF download handlers dengan tanggal hari ini
  const handlePDFDownload = (range = null, date = null) => {
    const downloadRange = range || currentRange || selectedRange;
    const downloadDate = date || currentDate || getTodayLocalDate();
    downloadPDF(downloadRange, downloadDate);
  };

  const handleShowPDFModal = () => {
    setShowPDFModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header
        className={`text-center mb-6 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
        }`}>
        <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
          Laporan Donasi Masjid
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Transparansi untuk Kepercayaan Jamaah
        </p>

        {/* Balance Display */}
        <div className="mt-4 flex justify-center">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 rounded-lg border border-green-200 shadow-md">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-sm text-gray-600">Saldo Masjid:</span>
              {balanceLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
              ) : (
                <span className="text-xl font-bold text-green-700">
                  {formattedBalance}
                </span>
              )}
            </div>

            {/* Sync Status */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {syncStatus === "syncing" && (
                <span className="text-blue-600">🔄 Memperbarui data...</span>
              )}
              {syncStatus === "success" && (
                <span className="text-green-600">✅ Data terkini</span>
              )}
              {syncStatus === "error" && (
                <span className="text-red-600">❌ Gagal memperbarui</span>
              )}
              {lastSyncTime && (
                <span className="text-gray-500">
                  Update: {new Date(lastSyncTime).toLocaleTimeString("id-ID")}
                </span>
              )}
            </div>

            {/* Sync Button */}
            <div className="mt-2 flex justify-center">
              <button
                onClick={handleSyncBalance}
                disabled={syncStatus === "syncing" || balanceLoading}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  syncStatus === "syncing" || balanceLoading
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}>
                {syncStatus === "syncing" ? "Syncing..." : "🔧 Sync Database"}
              </button>
            </div>

            {/* Status Info */}
            <div className="mt-3 text-xs text-center space-y-1">
              <div className="text-gray-600">
                📊 Laporan: <strong className="text-blue-600">MINGGUAN</strong>{" "}
                (Default) | Range: <strong>{currentRange || "weekly"}</strong>
              </div>
              <div className="text-gray-600">
                📅 Tanggal:{" "}
                <strong>{currentDate || getTodayLocalDate()}</strong>
                <span className="text-green-600 ml-2">
                  (Hari ini: {getTodayLocalDate()})
                </span>
              </div>
              <div className="text-gray-600">
                📈 Data: {incomes?.length || 0} pemasukan,{" "}
                {expenses?.length || 0} pengeluaran
              </div>

              <div className="mt-1 text-xs bg-green-50 p-1 rounded">
                <strong>✅ Mode: Laporan Mingguan (Weekly Report)</strong>
              </div>

              {(expenses?.length === 0 || !expenses) && (
                <div className="mt-1 text-red-600 text-xs bg-red-50 p-1 rounded">
                  ⚠️ Belum ada pengeluaran minggu ini
                  <br />
                  <button
                    onClick={handleForceWeekly}
                    className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                    🔄 Refresh Laporan Mingguan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div
        className={`flex flex-col gap-4 mb-6 transition-all duration-700 ease-out delay-200 ${
          animationPhase >= 1
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}>
        {/* Range Selector dan PDF Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
          {/* Range Selector */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-600 text-center mb-2">
              📊 Periode Laporan
            </div>
            <RangeSelector
              selectedRange={selectedRange}
              onRangeChange={handleRangeChange}
            />
            <div className="text-xs text-gray-500 text-center mt-1">
              Default: Mingguan
            </div>
          </div>

          {/* PDF Download Buttons */}
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 text-center mb-2">
              📄 Download Laporan
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <PDFDownloadButton
                onDownload={() => handlePDFDownload()}
                downloading={downloading}
                selectedRange={selectedRange}
                disabled={reportLoading}
              />

              <button
                onClick={handleShowPDFModal}
                disabled={reportLoading || downloading}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
                  reportLoading || downloading
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md"
                }`}>
                <span>⚙️</span>
                <span>Opsi Lanjutan</span>
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              Format: PDF
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            {reportLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                <span>Memuat laporan...</span>
              </div>
            )}

            {downloading && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-600"></div>
                <span>Menyiapkan PDF...</span>
              </div>
            )}

            <div className="text-gray-600 text-center">
              📊 Menampilkan:{" "}
              <strong className="text-blue-600">
                {REPORT_RANGES[currentRange || selectedRange] || "Mingguan"}
              </strong>
              {currentDate && (
                <span>
                  {" "}
                  | 📅 {new Date(currentDate).toLocaleDateString("id-ID")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} />
          <button
            onClick={clearErrors}
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
            Tutup Error
          </button>
        </div>
      )}

      {/* Main Content */}
      {reportLoading && !reportData.incomes?.length ? (
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
          <p className="ml-3 text-gray-600">Memuat laporan...</p>
        </div>
      ) : (
        <div
          className={`flex flex-col md:flex-row gap-6 transition-all duration-700 ease-out delay-400 ${
            animationPhase >= 2
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}>
          <main className="flex-1 bg-white p-6 rounded-lg shadow-lg">
            <div className="space-y-6">
              {/* Financial Summary */}
              <FinancialSummary
                saldoAwal={saldoAwal}
                saldoAkhir={saldoAkhir}
                selectedRange={currentRange || selectedRange}
              />

              {/* Transaction Tables - Simple View for Jamaah */}
              <div className="space-y-6">
                {/* Income Table */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <span>💰</span>
                    <span>Pemasukan</span>
                    <span className="text-sm font-normal text-gray-600">
                      ({incomes?.length || 0} transaksi)
                    </span>
                  </h3>

                  {incomes && incomes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-300">
                            <th className="text-left py-2 px-3 font-medium text-green-800 w-1/4">
                              Tanggal
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-green-800 w-1/2">
                              Nama
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-green-800 w-1/4">
                              Jumlah
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomes.map((income, index) => (
                            <tr
                              key={income._id || index}
                              className="border-b border-green-200 hover:bg-green-100">
                              <td className="py-2 px-3 text-gray-700">
                                {new Date(income.date).toLocaleDateString(
                                  "id-ID"
                                )}
                              </td>
                              <td className="py-2 px-3 text-gray-800 font-medium">
                                {income.name}
                              </td>
                              <td className="py-2 px-3 text-green-600 font-semibold">
                                {formatCurrency(income.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">📭</span>
                      <p>Belum ada data pemasukan untuk periode ini</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">
                        Total Pemasukan:
                      </span>
                      <span className="text-green-600 font-bold text-lg">
                        {formatCurrency(totalIncome || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expense Table */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <span>💸</span>
                    <span>Pengeluaran</span>
                    <span className="text-sm font-normal text-gray-600">
                      ({expenses?.length || 0} transaksi)
                    </span>
                  </h3>

                  {expenses && expenses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-red-300">
                            <th className="text-left py-2 px-3 font-medium text-red-800 w-1/4">
                              Tanggal
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-red-800 w-1/2">
                              Nama
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-red-800 w-1/4">
                              Jumlah
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense, index) => (
                            <tr
                              key={expense._id || index}
                              className="border-b border-red-200 hover:bg-red-100">
                              <td className="py-2 px-3 text-gray-700">
                                {new Date(expense.date).toLocaleDateString(
                                  "id-ID"
                                )}
                              </td>
                              <td className="py-2 px-3 text-gray-800 font-medium">
                                {expense.name}
                              </td>
                              <td className="py-2 px-3 text-red-600 font-semibold">
                                {formatCurrency(expense.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">📭</span>
                      <p>Belum ada data pengeluaran untuk periode ini</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-red-300">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 font-medium">
                        Total Pengeluaran:
                      </span>
                      <span className="text-red-600 font-bold text-lg">
                        {formatCurrency(totalExpense || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <section className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">Ringkasan:</div>
                  <div className="text-right">
                    <div className="text-sm">
                      Pemasukan:{" "}
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                    <div className="text-sm">
                      Pengeluaran:{" "}
                      <span className="text-red-600 font-semibold">
                        {formatCurrency(totalExpense)}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      Saldo Akhir: {formatCurrency(saldoAkhir)}
                    </div>
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h4 className="text-md font-semibold mb-3 text-indigo-700">
                  📈 Statistik Laporan
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Total Transaksi</div>
                    <div className="font-bold text-lg">
                      {(incomes?.length || 0) + (expenses?.length || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Pemasukan</div>
                    <div className="font-bold text-lg text-green-600">
                      {incomes?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Pengeluaran</div>
                    <div className="font-bold text-lg text-red-600">
                      {expenses?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">
                      Perubahan Bersih
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        (totalIncome || 0) - (totalExpense || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {formatCurrency((totalIncome || 0) - (totalExpense || 0))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Chart Sidebar */}
          <aside
            className={`w-full md:w-auto transition-all duration-700 ease-out delay-600 ${
              animationPhase >= 3
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}>
            <ChartSection
              chartRef={chartRef}
              chartData={chartData}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              selectedRange={currentRange || selectedRange}
              isRealTime={true}
              lastUpdate={lastSyncTime}
            />
          </aside>
        </div>
      )}

      {/* PDF Modal */}
      <PDFDownloadModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        selectedRange={currentRange || selectedRange}
        defaultDate={currentDate || getTodayLocalDate()}
        onDownload={handlePDFDownload}
        downloading={downloading}
      />
    </div>
  );
}

export default LaporanView;
