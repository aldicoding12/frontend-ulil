import React from "react";
import { useBalance } from "../hooks/useBalance";
import BalanceDisplay from "./BalanceDisplay";

const AdminPanel = () => {
  const { syncBalance, syncing, error } = useBalance();

  const handleForceSync = async () => {
    const result = await syncBalance();
    if (result.success) {
      alert("Saldo berhasil disinkronisasi!");
    } else {
      alert("Gagal melakukan sinkronisasi saldo");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🔧 Panel Admin
      </h3>

      {/* Display current balance */}
      <div className="mb-6">
        <BalanceDisplay showSyncButton={true} />
      </div>

      {/* Manual sync section */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-700 mb-2">
          Maintenance Tools
        </h4>
        <div className="space-y-3">
          <div>
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                syncing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              } transition-colors`}>
              {syncing ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Menyinkronisasi...
                </>
              ) : (
                "🔄 Force Sync Balance"
              )}
            </button>
            <p className="text-xs text-gray-600 mt-1">
              Gunakan jika saldo terlihat tidak akurat
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
