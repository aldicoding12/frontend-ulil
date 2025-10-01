/* eslint-disable no-unused-vars */
import React from "react";
import { useBalance } from "../hooks/useBalance";

const BalanceDisplay = ({ className = "", showSyncButton = false }) => {
  const {
    balance,
    formattedBalance,
    loading,
    syncing,
    error,
    fetchBalance,
    syncBalance,
  } = useBalance();

  const handleSync = async () => {
    const result = await syncBalance();
    if (result.success) {
      // Bisa tambahkan toast notification di sini
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
        <span className="text-sm text-gray-600">Memuat saldo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {error}
        <button
          onClick={fetchBalance}
          className="ml-2 text-blue-600 hover:text-blue-800 underline">
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Saldo Saat Ini:</span>
        <span className="text-lg font-bold text-green-700">
          {formattedBalance}
        </span>
      </div>

      {showSyncButton && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            syncing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          title="Sinkronisasi saldo jika tidak akurat">
          {syncing ? (
            <>
              <div className="inline-block animate-spin rounded-full h-3 w-3 border-t border-b border-white mr-1"></div>
              Syncing...
            </>
          ) : (
            "🔄 Sync"
          )}
        </button>
      )}
    </div>
  );
};

export default BalanceDisplay;
