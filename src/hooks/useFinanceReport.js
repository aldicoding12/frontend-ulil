// hooks/useFinanceReport.js - Enhanced untuk Real-time Updates
import { useState, useCallback, useRef } from "react";
import costumAPI from "../api";

export const useFinanceReport = () => {
  const [reportData, setReportData] = useState({
    incomes: [],
    expenses: [],
    totalIncome: 0,
    totalExpense: 0,
    saldoAwal: 0,
    saldoAkhir: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchParams, setLastFetchParams] = useState(null);
  const abortControllerRef = useRef(null);

  // 🆕 Enhanced fetchReport dengan real-time support
  const fetchReport = useCallback(
    async (range, date = null, forceRefresh = false) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      setError(null);

      try {
        console.log(
          `📊 Fetching ${range} report for date: ${date}, forceRefresh: ${forceRefresh}`
        );

        // Build URL dengan query parameter
        let url = `/finance/report/${range}-auto`;
        const params = new URLSearchParams();

        if (date) {
          params.append("date", date);
        }

        if (forceRefresh) {
          params.append("forceRefresh", "true");
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log(`🌐 API URL: ${url}`);

        const { data } = await costumAPI.get(url, { signal });

        console.log("🔍 API Response:", data);

        if (!data?.data) {
          throw new Error("Invalid data format from API");
        }

        const apiData = data.data;
        console.log("📊 API Data Keys:", Object.keys(apiData));

        // Extract transactions - support multiple formats
        let incomes = [];
        let expenses = [];

        if (apiData.transactions) {
          // New format: { transactions: { incomes: [], expenses: [] } }
          incomes = Array.isArray(apiData.transactions.incomes)
            ? apiData.transactions.incomes
            : [];
          expenses = Array.isArray(apiData.transactions.expenses)
            ? apiData.transactions.expenses
            : [];
        } else {
          // Old format: { incomes: [], expenses: [] }
          incomes = Array.isArray(apiData.incomes) ? apiData.incomes : [];
          expenses = Array.isArray(apiData.expenses) ? apiData.expenses : [];
        }

        console.log("💰 Extracted transactions:");
        console.log("- Incomes:", incomes.length, incomes);
        console.log("- Expenses:", expenses.length, expenses);

        // 🔧 MANUAL CALCULATION - Always calculate from transactions
        const manualTotalIncome = incomes.reduce((sum, income) => {
          const amount = income.amount || 0;
          console.log(`Income: ${income.name} = ${amount}`);
          return sum + amount;
        }, 0);

        const manualTotalExpense = expenses.reduce((sum, expense) => {
          const amount = expense.amount || 0;
          console.log(`Expense: ${expense.name} = ${amount}`);
          return sum + amount;
        }, 0);

        console.log("🧮 Manual Calculations:");
        console.log("- Manual Total Income:", manualTotalIncome);
        console.log("- Manual Total Expense:", manualTotalExpense);
        console.log(
          "- API Total Income:",
          apiData.totalIncome || apiData.balance?.totalIncome
        );
        console.log(
          "- API Total Expense:",
          apiData.totalExpense || apiData.balance?.totalExpense
        );

        // Extract balance info - support multiple formats
        let saldoAwal = 0;
        let saldoAkhir = 0;

        if (apiData.balance) {
          // New format
          saldoAwal =
            apiData.balance.opening || apiData.balance.balanceStart || 0;
          saldoAkhir =
            apiData.balance.closing || apiData.balance.balanceEnd || 0;
        } else {
          // Old format
          saldoAwal = apiData.saldoAwal || 0;
          saldoAkhir = apiData.saldoAkhir || 0;
        }

        // If saldoAkhir not provided, calculate it
        if (saldoAkhir === 0 || saldoAkhir === saldoAwal) {
          saldoAkhir = saldoAwal + manualTotalIncome - manualTotalExpense;
          console.log("🧮 Calculated saldoAkhir:", saldoAkhir);
        }

        // Extract chart data - Enhanced support
        let chartData = [];

        if (apiData.chartData && Array.isArray(apiData.chartData)) {
          chartData = apiData.chartData;
        } else if (incomes.length > 0 || expenses.length > 0) {
          // Generate chart data from transactions
          console.log("🔧 Generating chart data from transactions");
          chartData = generateChartDataFromTransactions(
            incomes,
            expenses,
            saldoAwal
          );
        }

        console.log("📈 Chart data:", chartData.length, "points");

        const finalReportData = {
          incomes,
          expenses,
          totalIncome: manualTotalIncome, // 🔧 Always use manual calculation
          totalExpense: manualTotalExpense, // 🔧 Always use manual calculation
          saldoAwal,
          saldoAkhir,
          chartData,
          meta: {
            isRealTime: forceRefresh,
            isFromCache: apiData.meta?.isFromCache || false,
            generatedAt: apiData.meta?.generatedAt || new Date(),
            lastUpdated: new Date(),
          },
        };

        console.log("✅ Final Report Data:");
        console.log(finalReportData);

        setReportData(finalReportData);
        setLastFetchParams({ range, date, forceRefresh });
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("🔄 Request was cancelled");
          return; // Don't set error for cancelled requests
        }

        console.error("❌ Failed to fetch report data:", err);
        setError("Gagal memuat data laporan. Silakan coba lagi.");
        setReportData({
          incomes: [],
          expenses: [],
          totalIncome: 0,
          totalExpense: 0,
          saldoAwal: 0,
          saldoAkhir: 0,
          chartData: [],
        });
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  // 🆕 Refresh current report dengan force refresh
  const refreshReport = useCallback(async () => {
    if (lastFetchParams) {
      const { range, date } = lastFetchParams;
      await fetchReport(range, date, true); // Force refresh
    }
  }, [lastFetchParams, fetchReport]);

  // 🆕 Get real-time report endpoint
  const fetchRealTimeReport = useCallback(async (type, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ type });

      if (options.date) params.append("date", options.date);
      if (options.start) params.append("start", options.start);
      if (options.end) params.append("end", options.end);

      const url = `/finance/report/realtime?${params.toString()}`;
      console.log(`🔄 Fetching real-time report: ${url}`);

      const { data } = await costumAPI.get(url);

      // Process response sama seperti fetchReport
      // ... (similar processing logic)

      console.log("✅ Real-time report fetched");
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch real-time report:", err);
      setError("Gagal memuat laporan real-time");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reportData,
    loading,
    error,
    fetchReport,
    refreshReport,
    fetchRealTimeReport,
    lastFetchParams,
  };
};

// Helper function untuk generate chart data
const generateChartDataFromTransactions = (
  incomes,
  expenses,
  startingBalance
) => {
  console.log("📈 Generating chart data from transactions");

  if (!incomes.length && !expenses.length) {
    console.log("❌ No transactions for chart");
    return [];
  }

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
  const chartData = Object.keys(dailyData)
    .sort()
    .map((date) => {
      const dayData = dailyData[date];
      balance += dayData.income - dayData.expense;
      return {
        date,
        income: dayData.income,
        expense: dayData.expense,
        balance,
        netChange: dayData.income - dayData.expense,
      };
    });

  console.log("✅ Chart data generated:", chartData.length, "points");
  return chartData;
};
