// store/financeStore.js - Real-time Finance State Management
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import costumAPI from "../api";

// Helper function untuk format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function untuk generate chart data dari transactions
const generateChartData = (incomes, expenses, startingBalance = 0) => {
  if (!incomes.length && !expenses.length) return [];

  const dailyData = {};

  // Process incomes
  incomes.forEach((income) => {
    const date = new Date(income.date).toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { date, income: 0, expense: 0 };
    }
    dailyData[date].income += income.amount || 0;
  });

  // Process expenses
  expenses.forEach((expense) => {
    const date = new Date(expense.date).toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { date, income: 0, expense: 0 };
    }
    dailyData[date].expense += expense.amount || 0;
  });

  // Calculate running balance
  let balance = startingBalance;
  return Object.keys(dailyData)
    .sort()
    .map((date) => {
      const dayData = dailyData[date];
      balance += dayData.income - dayData.expense;
      return {
        date,
        income: dayData.income,
        expense: dayData.expense,
        balance,
      };
    });
};

export const useFinanceStore = create(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // State untuk current balance
        currentBalance: 0,
        formattedBalance: "Rp 0",
        balanceLoading: false,
        balanceError: null,

        // State untuk report data
        reportData: {
          incomes: [],
          expenses: [],
          totalIncome: 0,
          totalExpense: 0,
          saldoAwal: 0,
          saldoAkhir: 0,
          chartData: [],
        },
        reportLoading: false,
        reportError: null,

        // State untuk transaction operations
        transactionLoading: false,
        transactionError: null,

        // Current filter states
        currentRange: "monthly",
        currentDate: new Date().toISOString().split("T")[0],

        // Real-time sync status
        syncStatus: "idle", // 'idle', 'syncing', 'success', 'error'
        lastSyncTime: null,

        // 🚀 ACTION: Fetch current balance
        fetchBalance: async () => {
          set({ balanceLoading: true, balanceError: null });

          try {
            const { data } = await costumAPI.get("/finance/balance");

            set({
              currentBalance: data.balance,
              formattedBalance: data.formatted,
              balanceLoading: false,
              lastSyncTime: new Date(),
            });
          } catch (error) {
            console.error("❌ Failed to fetch balance:", error);
            set({
              balanceError: "Gagal memuat saldo",
              balanceLoading: false,
            });
          }
        },

        // 🚀 ACTION: Sync balance manually
        syncBalance: async () => {
          set({ syncStatus: "syncing" });

          try {
            const { data } = await costumAPI.post("/finance/balance/sync");

            set({
              currentBalance: data.balance,
              formattedBalance: data.formatted,
              syncStatus: "success",
              lastSyncTime: new Date(),
            });

            // Auto refresh report data setelah sync
            const { currentRange, currentDate } = get();
            get().fetchReport(currentRange, currentDate);

            return { success: true, message: data.message };
          } catch (error) {
            console.error("❌ Failed to sync balance:", error);
            set({ syncStatus: "error" });
            return {
              success: false,
              message: "Gagal melakukan sinkronisasi saldo",
            };
          } finally {
            // Reset sync status after 3 seconds
            setTimeout(() => set({ syncStatus: "idle" }), 3000);
          }
        },

        // 🚀 ACTION: Fetch report data
        fetchReport: async (range, date = null) => {
          set({
            reportLoading: true,
            reportError: null,
            currentRange: range,
            currentDate: date || get().currentDate,
          });

          try {
            let url = `/finance/report/${range}-auto`;
            if (date) {
              url += `?date=${date}`;
            }
            const { data } = await costumAPI.get(url);

            if (!data?.data) {
              throw new Error("Invalid data format from API");
            }

            const apiData = data.data;

            // Extract transactions
            let incomes = [];
            let expenses = [];

            if (apiData.transactions) {
              incomes = Array.isArray(apiData.transactions.incomes)
                ? apiData.transactions.incomes
                : [];
              expenses = Array.isArray(apiData.transactions.expenses)
                ? apiData.transactions.expenses
                : [];
            } else {
              incomes = Array.isArray(apiData.incomes) ? apiData.incomes : [];
              expenses = Array.isArray(apiData.expenses)
                ? apiData.expenses
                : [];
            }

            // Calculate totals manually untuk akurasi
            const totalIncome = incomes.reduce(
              (sum, income) => sum + (income.amount || 0),
              0
            );
            const totalExpense = expenses.reduce(
              (sum, expense) => sum + (expense.amount || 0),
              0
            );

            // Extract balance info
            let saldoAwal = 0;
            let saldoAkhir = 0;

            if (apiData.balance) {
              saldoAwal =
                apiData.balance.opening || apiData.balance.balanceStart || 0;
              saldoAkhir =
                apiData.balance.closing || apiData.balance.balanceEnd || 0;
            } else {
              saldoAwal = apiData.saldoAwal || 0;
              saldoAkhir = apiData.saldoAkhir || 0;
            }

            // Calculate saldoAkhir if not provided
            if (saldoAkhir === 0 || saldoAkhir === saldoAwal) {
              saldoAkhir = saldoAwal + totalIncome - totalExpense;
            }

            // Generate chart data
            let chartData = [];
            if (apiData.chartData && Array.isArray(apiData.chartData)) {
              chartData = apiData.chartData;
            } else if (incomes.length > 0 || expenses.length > 0) {
              chartData = generateChartData(incomes, expenses, saldoAwal);
            }

            const newReportData = {
              incomes,
              expenses,
              totalIncome,
              totalExpense,
              saldoAwal,
              saldoAkhir,
              chartData,
            };

            set({
              reportData: newReportData,
              reportLoading: false,
              lastSyncTime: new Date(),
            });
          } catch (error) {
            console.error("❌ Failed to fetch report:", error);
            set({
              reportError: "Gagal memuat data laporan. Silakan coba lagi.",
              reportLoading: false,
            });
          }
        },

        // 🚀 ACTION: Add income dengan real-time update
        addIncome: async (incomeData) => {
          set({ transactionLoading: true, transactionError: null });

          try {
            const { data } = await costumAPI.post(
              "/finance/incomes/create",
              incomeData
            );

            // Update balance immediately
            set({
              currentBalance: data.currentBalance,
              formattedBalance: formatCurrency(data.currentBalance),
            });

            // Refresh report data
            const { currentRange, currentDate } = get();
            await get().fetchReport(currentRange, currentDate);

            set({ transactionLoading: false });
            return {
              success: true,
              data: data.data,
              message: data.message,
              currentBalance: data.currentBalance,
            };
          } catch (error) {
            console.error("❌ Failed to add income:", error);
            const errorMessage =
              error.response?.data?.message || "Gagal menambah pemasukan";
            set({
              transactionError: errorMessage,
              transactionLoading: false,
            });
            return { success: false, message: errorMessage };
          }
        },

        // 🚀 ACTION: Add expense dengan real-time update
        addExpense: async (expenseData) => {
          set({ transactionLoading: true, transactionError: null });

          try {
            const { data } = await costumAPI.post(
              "/finance/expenses/create",
              expenseData
            );

            // Update balance immediately
            set({
              currentBalance: data.currentBalance,
              formattedBalance: formatCurrency(data.currentBalance),
            });

            // Refresh report data
            const { currentRange, currentDate } = get();
            await get().fetchReport(currentRange, currentDate);

            set({ transactionLoading: false });
            return {
              success: true,
              data: data.data,
              message: data.message,
              currentBalance: data.currentBalance,
            };
          } catch (error) {
            console.error("❌ Failed to add expense:", error);
            const errorMessage =
              error.response?.data?.message || "Gagal menambah pengeluaran";
            set({
              transactionError: errorMessage,
              transactionLoading: false,
            });
            return { success: false, message: errorMessage };
          }
        },

        // 🚀 ACTION: Update income dengan real-time update
        updateIncome: async (id, incomeData) => {
          set({ transactionLoading: true, transactionError: null });

          try {
            const { data } = await costumAPI.put(
              `/finance/incomes/${id}`,
              incomeData
            );

            // Update balance immediately
            set({
              currentBalance: data.currentBalance,
              formattedBalance: formatCurrency(data.currentBalance),
            });

            // Refresh report data
            const { currentRange, currentDate } = get();
            await get().fetchReport(currentRange, currentDate);

            set({ transactionLoading: false });
            return {
              success: true,
              data: data.data,
              message: data.message,
              currentBalance: data.currentBalance,
            };
          } catch (error) {
            console.error("❌ Failed to update income:", error);
            const errorMessage =
              error.response?.data?.message || "Gagal mengupdate pemasukan";
            set({
              transactionError: errorMessage,
              transactionLoading: false,
            });
            return { success: false, message: errorMessage };
          }
        },

        // 🚀 ACTION: Update expense dengan real-time update
        updateExpense: async (id, expenseData) => {
          set({ transactionLoading: true, transactionError: null });

          try {
            const { data } = await costumAPI.put(
              `/finance/expenses/${id}`,
              expenseData
            );

            // Update balance immediately
            set({
              currentBalance: data.currentBalance,
              formattedBalance: formatCurrency(data.currentBalance),
            });

            // Refresh report data
            const { currentRange, currentDate } = get();
            await get().fetchReport(currentRange, currentDate);

            set({ transactionLoading: false });
            return {
              success: true,
              data: data.data,
              message: data.message,
              currentBalance: data.currentBalance,
            };
          } catch (error) {
            console.error("❌ Failed to update expense:", error);
            const errorMessage =
              error.response?.data?.message || "Gagal mengupdate pengeluaran";
            set({
              transactionError: errorMessage,
              transactionLoading: false,
            });
            return { success: false, message: errorMessage };
          }
        },

        // 🚀 ACTION: Delete income dengan real-time update
        deleteIncome: async (id) => {
          set({ transactionLoading: true, transactionError: null });

          try {
            const { data } = await costumAPI.delete(`/finance/incomes/${id}`);

            // Update balance immediately
            set({
              currentBalance: data.currentBalance,
              formattedBalance: formatCurrency(data.currentBalance),
            });

            // Refresh report data
            const { currentRange, currentDate } = get();
            await get().fetchReport(currentRange, currentDate);

            set({ transactionLoading: false });
            return {
              success: true,
              message: data.message,
              currentBalance: data.currentBalance,
            };
          } catch (error) {
            console.error("❌ Failed to delete income:", error);
            const errorMessage =
              error.response?.data?.message || "Gagal menghapus pemasukan";
            set({
              transactionError: errorMessage,
              transactionLoading: false,
            });
            return { success: false, message: errorMessage };
          }
        },

        // 🚀 ACTION: Delete expense dengan real-time update
        deleteExpense: async (id) => {
          set({ transactionLoading: true, transactionError: null });

          try {
            const { data } = await costumAPI.delete(`/finance/expenses/${id}`);

            // Update balance immediately
            set({
              currentBalance: data.currentBalance,
              formattedBalance: formatCurrency(data.currentBalance),
            });

            // Refresh report data
            const { currentRange, currentDate } = get();
            await get().fetchReport(currentRange, currentDate);

            set({ transactionLoading: false });
            return {
              success: true,
              message: data.message,
              currentBalance: data.currentBalance,
            };
          } catch (error) {
            console.error("❌ Failed to delete expense:", error);
            const errorMessage =
              error.response?.data?.message || "Gagal menghapus pengeluaran";
            set({
              transactionError: errorMessage,
              transactionLoading: false,
            });
            return { success: false, message: errorMessage };
          }
        },

        // 🚀 ACTION: Reset errors
        clearErrors: () => {
          set({
            balanceError: null,
            reportError: null,
            transactionError: null,
          });
        },

        // 🚀 ACTION: Set filter range dan date
        setFilter: (range, date) => {
          set({
            currentRange: range,
            currentDate: date,
          });
          get().fetchReport(range, date);
        },
      }),
      {
        name: "finance-store", // DevTools name
      }
    )
  )
);
