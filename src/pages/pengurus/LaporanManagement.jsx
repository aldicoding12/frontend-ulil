/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import PDFDownloadModal from "../../components/PDFDownloadModal";
import AddTransactionModal from "../../components/admin/componens/AddTransactionModal ";

// Zustand Store - Real-time state management
import { useFinanceStore } from "../../store/financeStore";

// Custom Hooks - Updated untuk PDF download saja
import { usePDFDownload } from "../../hooks/usePDFDownload";
import { useChart } from "../../hooks/useChart";

// Components
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import FinancialSummary from "../../components/FinancialSummary";
import ChartSection from "../../components/ChartSection";
import BalanceDisplay from "../../components/BalanceDisplay";
import MonthYearSelector from "../../components/MonthYearSelector";

// Local Components
import LaporanHeader from "../../components/admin/componens/LaporanHeader ";
import LaporanControls from "../../components/admin/componens/LaporanControls ";
import TransactionTables from "../../components/admin/componens/TransactionTables";
import SummarySection from "../../components/admin/componens/SummarySection";
import PDFDownloadSection from "../../components/admin/componens/PDFDownloadSection";

// Utils & Constants
import { formatDate, formatCurrency } from "../../utils/formatters";
import { REPORT_RANGES } from "../../constants/reportConstants";

// Helper function untuk mendapatkan tanggal hari ini dengan timezone lokal
const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function LaporanManagement() {
  // 🚀 ZUSTAND STORE - Real-time state management
  const {
    // Balance states
    currentBalance,
    formattedBalance,
    balanceLoading,
    balanceError,

    // Report states
    reportData,
    reportLoading,
    reportError,

    // Transaction states
    transactionLoading,
    transactionError,

    // Filter states
    currentRange,
    currentDate,

    // Sync states
    syncStatus,
    lastSyncTime,

    // Actions
    fetchBalance,
    syncBalance,
    fetchReport,
    addIncome,
    addExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    clearErrors,
    setFilter,
  } = useFinanceStore();

  // Local states untuk UI
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("income");
  const [editingItem, setEditingItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Hook untuk PDF download (tetap menggunakan hook lama)
  const { downloading, error: pdfError, downloadPDF } = usePDFDownload();

  // Chart hook dengan data dari store
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

  // Combined error handling
  const error = reportError || pdfError || transactionError || balanceError;

  // 🚀 INITIAL LOAD - FORCE WEEKLY sebagai default dengan tanggal hari ini
  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        const today = getTodayLocalDate();

        // Load balance
        await fetchBalance();

        // FORCE set filter to weekly + today
        setFilter("weekly", today);
        clearErrors();
      } catch (error) {
        console.error("❌ Force weekly load error:", error);
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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 🚀 REAL-TIME HANDLERS dengan Zustand - PRIORITAS WEEKLY

  // Handler untuk perubahan tanggal - Real-time update dengan tanggal hari ini
  const handleDateChange = (newDate) => {
    setFilter(currentRange, newDate);
  };

  // Handler untuk perubahan range - ALWAYS PREFER WEEKLY dengan tanggal hari ini
  const handleRangeChange = (newRange) => {
    const today = getTodayLocalDate(); // Gunakan helper function

    if (newRange === "weekly") {
      setFilter("weekly", today);
    } else {
      setFilter(newRange, today);
    }
  };

  // 🚀 CRUD HANDLERS dengan Real-time Update

  const handleEditIncome = (item) => {
    if (!item) {
      alert("Data tidak valid untuk diedit");
      return;
    }

    setEditingItem(item);
    setModalType("income");
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteIncome = async (item) => {
    if (!item) {
      alert("Data tidak valid untuk dihapus.");
      return;
    }

    const itemId = item._id || item.id;
    if (!itemId) {
      alert("ID tidak ditemukan.");
      return;
    }

    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus pemasukan "${
          item.name || "item ini"
        }"?`
      )
    ) {
      try {
        const result = await deleteIncome(itemId);

        if (result.success) {
          setSuccessMessage(
            "✅ Pemasukan berhasil dihapus dan saldo terupdate!"
          );
        } else {
          alert("Terjadi kesalahan: " + result.message);
        }
      } catch (error) {
        alert("Terjadi kesalahan saat menghapus pemasukan: " + error.message);
      }
    }
  };

  const handleEditExpense = (item) => {
    if (!item) {
      alert("Data tidak valid untuk diedit");
      return;
    }

    setEditingItem(item);
    setModalType("expense");
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteExpense = async (item) => {
    if (!item) {
      alert("Data tidak valid untuk dihapus.");
      return;
    }

    const itemId = item._id || item.id;
    if (!itemId) {
      alert("ID tidak ditemukan.");
      return;
    }

    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus pengeluaran "${
          item.name || "item ini"
        }"?`
      )
    ) {
      try {
        const result = await deleteExpense(itemId);

        if (result.success) {
          setSuccessMessage(
            "✅ Pengeluaran berhasil dihapus dan saldo terupdate!"
          );
        } else {
          alert("Terjadi kesalahan: " + result.message);
        }
      } catch (error) {
        alert("Terjadi kesalahan saat menghapus pengeluaran: " + error.message);
      }
    }
  };

  const handleAddIncome = () => {
    setEditingItem(null);
    setModalType("income");
    setIsEditMode(false);
    setShowAddModal(true);
  };

  const handleAddExpense = () => {
    setEditingItem(null);
    setModalType("expense");
    setIsEditMode(false);
    setShowAddModal(true);
  };

  // Real-time transaction submit dengan instant update
  const handleTransactionSubmit = async (transactionData) => {
    try {
      const { name, amount, date, description = "", type } = transactionData;
      const apiData = {
        name,
        amount: parseFloat(amount),
        date,
        note: description,
        method: "cash",
      };

      let result;
      if (isEditMode && editingItem) {
        const itemId = editingItem._id || editingItem.id;

        if (type === "income") {
          result = await updateIncome(itemId, apiData);
        } else {
          result = await updateExpense(itemId, apiData);
        }

        if (result.success) {
          setSuccessMessage(
            `✅ ${
              type === "income" ? "Pemasukan" : "Pengeluaran"
            } berhasil diperbarui! Saldo: ${formatCurrency(
              result.currentBalance
            )}`
          );
        }
      } else {
        if (type === "income") {
          result = await addIncome(apiData);
        } else {
          result = await addExpense(apiData);
        }

        if (result.success) {
          setSuccessMessage(
            `✅ ${
              type === "income" ? "Pemasukan" : "Pengeluaran"
            } berhasil ditambahkan! Saldo: ${formatCurrency(
              result.currentBalance
            )}`
          );
        }
      }

      if (result.success) {
        // Reset modal state
        setEditingItem(null);
        setIsEditMode(false);
        setShowAddModal(false);
      } else {
        alert("Terjadi kesalahan: " + result.message);
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Terjadi kesalahan: " + error.message);
      throw error;
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setIsEditMode(false);
  };

  // Manual sync dengan feedback visual
  const handleSyncBalance = async () => {
    try {
      const result = await syncBalance();
      if (result.success) {
        setSuccessMessage(
          "🔄 Saldo berhasil disinkronisasi! Semua data telah terupdate."
        );
      } else {
        alert("Gagal melakukan sinkronisasi: " + result.message);
      }
    } catch (error) {
      console.error("Error syncing balance:", error);
      alert("Terjadi kesalahan saat sinkronisasi saldo");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 🚀 ENHANCED HEADER dengan Real-time Balance */}
      <div
        className={`text-center mb-6 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
        }`}>
        <LaporanHeader isVisible={isVisible} />

        {/* 🚀 REAL-TIME BALANCE DISPLAY - Simplified */}
        <div className="mt-4 flex justify-center">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 rounded-lg border border-green-200 shadow-md">
            {/* Current Balance */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-sm text-gray-600">Saldo Real-time:</span>
              {balanceLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
              ) : (
                <span className="text-xl font-bold text-green-700">
                  {formattedBalance}
                </span>
              )}
            </div>

            {/* Date Display dengan Today Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs mb-2">
              <span className="text-gray-600">
                📅 Tanggal Laporan:{" "}
                <strong>{currentDate || getTodayLocalDate()}</strong>
              </span>
              <span className="text-green-600 font-medium">
                (Hari ini: {getTodayLocalDate()})
              </span>
            </div>

            {/* Sync Status Only */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {syncStatus === "syncing" && (
                <span className="text-blue-600">🔄 Sinkronisasi...</span>
              )}
              {syncStatus === "success" && (
                <span className="text-green-600">✅ Tersinkronisasi</span>
              )}
              {syncStatus === "error" && (
                <span className="text-red-600">❌ Gagal sinkronisasi</span>
              )}
              {lastSyncTime && (
                <span className="text-gray-500">
                  Update: {new Date(lastSyncTime).toLocaleTimeString("id-ID")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 ENHANCED CONTROLS dengan Real-time Filter */}
      <div
        className={`flex flex-col gap-4 mb-6 transition-all duration-700 ease-out delay-200 ${
          animationPhase >= 1
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}>
        {/* Range Selector */}
        <LaporanControls
          selectedRange={currentRange}
          onRangeChange={handleRangeChange}
          onDownload={(range) =>
            downloadPDF(range, currentDate || getTodayLocalDate())
          }
          downloading={downloading}
          loading={reportLoading}
          onShowPDFModal={() => setShowPDFModal(true)}
          animationPhase={animationPhase}
        />

        {/* 🚀 REAL-TIME DATE SELECTOR */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <MonthYearSelector
              selectedRange={currentRange}
              selectedDate={currentDate || getTodayLocalDate()}
              onDateChange={handleDateChange}
              disabled={reportLoading || transactionLoading}
              className="justify-center"
            />
          </div>
        </div>

        {/* 🚀 REAL-TIME STATUS INDICATOR - Simplified */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 text-sm">
            {/* Loading indicator */}
            {(reportLoading || transactionLoading) && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                <span>
                  {reportLoading
                    ? "Memuat laporan..."
                    : "Memproses transaksi..."}
                </span>
              </div>
            )}

            {/* Current filter info - Focus on Weekly */}
            <div className="text-gray-600">
              📊 Menampilkan:{" "}
              <strong className="text-blue-600">
                {REPORT_RANGES[currentRange] || "Mingguan"}
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

      {/* 🚀 SUCCESS MESSAGE dengan Real-time Update */}
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
        <div className="animate-shake mb-4">
          <ErrorAlert message={error} />
          <button
            onClick={clearErrors}
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
            Tutup Error
          </button>
        </div>
      )}

      {/* 🚀 MAIN CONTENT dengan Real-time Data */}
      {reportLoading && !reportData.incomes.length ? (
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
          <p className="ml-3 text-gray-600">Memuat laporan mingguan...</p>
        </div>
      ) : (
        <div
          className={`flex flex-col md:flex-row gap-6 transition-all duration-700 ease-out delay-400 ${
            animationPhase >= 2
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}>
          {/* 🚀 MAIN PANEL dengan Real-time Updates */}
          <main className="flex-1 bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="space-y-6">
              {/* Financial Summary dengan Real-time Data */}
              <div className="transform hover:scale-[1.01] transition-transform duration-200">
                <FinancialSummary
                  saldoAwal={saldoAwal}
                  saldoAkhir={saldoAkhir}
                  selectedRange={currentRange}
                />
              </div>
              {/* 🚀 REAL-TIME TRANSACTION TABLES */}
              <TransactionTables
                incomes={incomes}
                expenses={expenses}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                onEditIncome={handleEditIncome}
                onDeleteIncome={handleDeleteIncome}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onAddIncome={handleAddIncome}
                onAddExpense={handleAddExpense}
                loading={transactionLoading}
              />
              {/* Summary dengan Real-time Calculations */}
              <SummarySection
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                saldoAkhir={saldoAkhir}
                netChange={totalIncome - totalExpense}
              />
              {/* 🚀 REAL-TIME STATISTICS */}
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h4 className="text-md font-semibold mb-3 text-indigo-700">
                  📈 Statistik Mingguan
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Total Transaksi</div>
                    <div className="font-bold text-lg">
                      {incomes.length + expenses.length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Pemasukan</div>
                    <div className="font-bold text-lg text-green-600">
                      {incomes.length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Pengeluaran</div>
                    <div className="font-bold text-lg text-red-600">
                      {expenses.length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">
                      Perubahan Bersih
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        totalIncome - totalExpense >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {formatCurrency(totalIncome - totalExpense)}
                    </div>
                  </div>
                </div>
              </div>
              {/* PDF Download Section */}
              <PDFDownloadSection
                downloadPDF={(range) =>
                  downloadPDF(range, currentDate || getTodayLocalDate())
                }
                downloading={downloading}
                animationPhase={animationPhase}
              />
            </div>
          </main>

          {/* 🚀 CHART SIDEBAR dengan Real-time Data */}
          <aside
            className={`w-full md:w-auto transition-all duration-700 ease-out delay-600 ${
              animationPhase >= 3
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}>
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <ChartSection
                chartRef={chartRef}
                chartData={chartData}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                selectedRange={currentRange}
                isRealTime={true}
                lastUpdate={lastSyncTime}
              />
            </div>
          </aside>
        </div>
      )}

      {/* 🚀 MODALS dengan Real-time Integration */}
      <PDFDownloadModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        selectedRange={currentRange}
        defaultDate={currentDate || getTodayLocalDate()}
      />

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSubmit={handleTransactionSubmit}
        type={modalType}
        editData={editingItem}
        isEditMode={isEditMode}
        loading={transactionLoading}
        currentBalance={currentBalance}
      />

      {/* 🚀 ENHANCED STYLES dengan Real-time Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        @keyframes pulse-success {
          0%,
          100% {
            background-color: rgb(220, 252, 231);
            border-color: rgb(34, 197, 94);
          }
          50% {
            background-color: rgb(187, 247, 208);
            border-color: rgb(22, 163, 74);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-pulse-success {
          animation: pulse-success 2s ease-in-out infinite;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default LaporanManagement;
