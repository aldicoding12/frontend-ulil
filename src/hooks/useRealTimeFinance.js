/* eslint-disable no-unused-vars */
// hooks/useRealTimeFinance.js - 🆕 New hook untuk real-time coordination
import { useCallback, useEffect, useRef } from "react";

export const useRealTimeFinance = (
  reportHook,
  transactionHook,
  balanceHook
) => {
  const refreshTimeoutRef = useRef(null);

  // Handle transaction changes dengan debouncing
  const handleTransactionChange = useCallback(
    async (changeInfo) => {
      // Clear previous timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Debounce refresh untuk avoid multiple rapid calls
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          // Refresh balance
          if (balanceHook?.fetchBalance) {
            await balanceHook.fetchBalance();
          }

          // Refresh current report
          if (reportHook?.refreshReport) {
            await reportHook.refreshReport();
          }
        } catch (error) {
          console.error("❌ Error during real-time refresh:", error);
        }
      }, 500); // 500ms debounce
    },
    [reportHook, balanceHook]
  );

  // Setup transaction change listener
  useEffect(() => {
    if (transactionHook?.setOnTransactionChange) {
      transactionHook.setOnTransactionChange(handleTransactionChange);
    }

    return () => {
      // Cleanup
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (transactionHook?.setOnTransactionChange) {
        transactionHook.setOnTransactionChange(null);
      }
    };
  }, [transactionHook, handleTransactionChange]);

  // Manual refresh all data
  const refreshAllData = useCallback(async () => {
    try {
      const promises = [];

      if (balanceHook?.fetchBalance) {
        promises.push(balanceHook.fetchBalance());
      }

      if (reportHook?.refreshReport) {
        promises.push(reportHook.refreshReport());
      }

      await Promise.all(promises);
    } catch (error) {
      console.error("❌ Error during manual refresh:", error);
      throw error;
    }
  }, [reportHook, balanceHook]);

  // Force real-time report
  const forceRealTimeReport = useCallback(
    async (type, options) => {
      if (reportHook?.fetchRealTimeReport) {
        return await reportHook.fetchRealTimeReport(type, options);
      }
      throw new Error("Real-time report not supported");
    },
    [reportHook]
  );

  return {
    refreshAllData,
    forceRealTimeReport,
    handleTransactionChange,
  };
};
