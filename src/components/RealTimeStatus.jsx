/* eslint-disable no-unused-vars */
import React from "react";
import { useFinanceStore } from "../store/financeStore";

const RealTimeStatus = ({ className = "" }) => {
  const {
    isRealTimeConnected,
    onlineUsers,
    lastRealTimeUpdate,
    realTimeEvents,
    getRealTimeStatus,
    requestGlobalRefresh,
  } = useFinanceStore();

  const status = getRealTimeStatus();

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Real-time Status
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isRealTimeConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}></div>
          <span
            className={`text-xs font-medium ${
              isRealTimeConnected ? "text-green-600" : "text-red-600"
            }`}>
            {isRealTimeConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Connection Info */}
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Online Users:</span>
          <span className="font-medium text-blue-600">{onlineUsers}</span>
        </div>

        {lastRealTimeUpdate && (
          <div className="flex justify-between">
            <span>Last Update:</span>
            <span className="font-medium">
              {new Date(lastRealTimeUpdate).toLocaleTimeString("id-ID")}
            </span>
          </div>
        )}
      </div>

      {/* Recent Events */}
      {realTimeEvents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Recent Updates:
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {realTimeEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">
                  {event.type === "balance-update" && "💰 Saldo diperbarui"}
                  {event.type === "transaction-update" &&
                    "📊 Transaksi diperbarui"}
                  {event.type === "user-joined" &&
                    `👤 ${event.data.name} bergabung`}
                  {event.type === "user-left" && `👋 ${event.data.name} keluar`}
                  {event.type === "refresh-requested" && "🔄 Refresh diminta"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={requestGlobalRefresh}
          disabled={!isRealTimeConnected}
          className={`w-full px-3 py-2 text-xs rounded-md font-medium transition-colors ${
            isRealTimeConnected
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}>
          🔄 Refresh All Users
        </button>
      </div>
    </div>
  );
};
