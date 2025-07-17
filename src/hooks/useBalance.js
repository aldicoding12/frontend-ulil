import { useState, useCallback, useEffect } from "react";
import costumAPI from "../api";

export const useBalance = () => {
  const [balance, setBalance] = useState(0);
  const [formattedBalance, setFormattedBalance] = useState("Rp 0");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current balance
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await costumAPI.get("/finance/balance");

      setBalance(data.balance);
      setFormattedBalance(data.formatted);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setError("Gagal memuat saldo");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync balance manually
  const syncBalance = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      const { data } = await costumAPI.post("/finance/balance/sync");

      setBalance(data.balance);
      setFormattedBalance(data.formatted);

      return { success: true, message: data.message };
    } catch (err) {
      console.error("Failed to sync balance:", err);
      setError("Gagal melakukan sinkronisasi saldo");
      return { success: false, message: "Gagal melakukan sinkronisasi saldo" };
    } finally {
      setSyncing(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    formattedBalance,
    loading,
    syncing,
    error,
    fetchBalance,
    syncBalance,
  };
};
