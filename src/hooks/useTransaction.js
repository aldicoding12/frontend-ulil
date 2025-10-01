// hooks/useTransaction.js - Enhanced untuk Real-time Updates
import { useState, useCallback } from "react";
import costumAPI from "../api";

export const useTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🆕 Enhanced with real-time callbacks
  const [onTransactionChange, setOnTransactionChange] = useState(null);

  // Helper untuk notify changes
  const notifyChange = useCallback(
    (type, operation, data, balance) => {
      if (onTransactionChange) {
        onTransactionChange({
          type,
          operation,
          data,
          currentBalance: balance,
          timestamp: new Date(),
        });
      }
    },
    [onTransactionChange]
  );

  // Add income with enhanced response handling
  const addIncome = useCallback(
    async (incomeData) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await costumAPI.post(
          "/finance/incomes/create",
          incomeData
        );

        // Notify real-time change
        notifyChange("income", "create", data.data, data.currentBalance);

        return {
          success: true,
          data: data.data,
          message: data.message,
          currentBalance: data.currentBalance,
          syncInfo: data.syncInfo,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal menambah pemasukan";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [notifyChange]
  );

  // Add expense with enhanced response handling
  const addExpense = useCallback(
    async (expenseData) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await costumAPI.post(
          "/finance/expenses/create",
          expenseData
        );

        // Notify real-time change
        notifyChange("expense", "create", data.data, data.currentBalance);

        return {
          success: true,
          data: data.data,
          message: data.message,
          currentBalance: data.currentBalance,
          syncInfo: data.syncInfo,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal menambah pengeluaran";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [notifyChange]
  );

  // Update income with enhanced response handling
  const updateIncome = useCallback(
    async (id, incomeData) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await costumAPI.put(
          `/finance/incomes/${id}`,
          incomeData
        );

        // Notify real-time change
        notifyChange("income", "update", data.data, data.currentBalance);

        return {
          success: true,
          data: data.data,
          message: data.message,
          currentBalance: data.currentBalance,
          syncInfo: data.syncInfo,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal mengupdate pemasukan";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [notifyChange]
  );

  // Update expense with enhanced response handling
  const updateExpense = useCallback(
    async (id, expenseData) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await costumAPI.put(
          `/finance/expenses/${id}`,
          expenseData
        );

        // Notify real-time change
        notifyChange("expense", "update", data.data, data.currentBalance);

        return {
          success: true,
          data: data.data,
          message: data.message,
          currentBalance: data.currentBalance,
          syncInfo: data.syncInfo,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal mengupdate pengeluaran";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [notifyChange]
  );

  // Delete income with enhanced response handling
  const deleteIncome = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await costumAPI.delete(`/finance/incomes/${id}`);

        // Notify real-time change
        notifyChange("income", "delete", data.deletedData, data.currentBalance);

        return {
          success: true,
          message: data.message,
          currentBalance: data.currentBalance,
          syncInfo: data.syncInfo,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal menghapus pemasukan";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [notifyChange]
  );

  // Delete expense with enhanced response handling
  const deleteExpense = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await costumAPI.delete(`/finance/expenses/${id}`);

        // Notify real-time change
        notifyChange(
          "expense",
          "delete",
          data.deletedData,
          data.currentBalance
        );

        return {
          success: true,
          message: data.message,
          currentBalance: data.currentBalance,
          syncInfo: data.syncInfo,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal menghapus pengeluaran";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [notifyChange]
  );

  return {
    loading,
    error,
    addIncome,
    addExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    setOnTransactionChange,
  };
};
