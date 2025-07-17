import React, { useState, useEffect } from "react";
import { useFinanceStore } from "../store/financeStore";

const RealTimeNotification = () => {
  const { realTimeEvents } = useFinanceStore();
  const [visibleEvents, setVisibleEvents] = useState([]);

  useEffect(() => {
    // Show only new events as notifications
    const newEvents = realTimeEvents.filter((event) => {
      const eventTime = new Date(event.timestamp);
      const now = new Date();
      return now - eventTime < 5000; // Show events from last 5 seconds
    });

    setVisibleEvents(newEvents.slice(0, 3)); // Max 3 notifications

    // Auto remove after 3 seconds
    if (newEvents.length > 0) {
      const timer = setTimeout(() => {
        setVisibleEvents([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [realTimeEvents]);

  if (visibleEvents.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleEvents.map((event, index) => (
        <div
          key={`${event.timestamp}-${index}`}
          className="bg-white border border-blue-200 rounded-lg shadow-lg p-3 min-w-64 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                Real-time Update
              </div>
              <div className="text-xs text-gray-600">
                {event.type === "balance-update" &&
                  `Saldo diperbarui: ${event.data.formattedBalance}`}
                {event.type === "transaction-update" &&
                  `${
                    event.data.action.includes("INCOME")
                      ? "Pemasukan"
                      : "Pengeluaran"
                  } ${
                    event.data.action.includes("CREATE")
                      ? "ditambah"
                      : event.data.action.includes("UPDATE")
                      ? "diubah"
                      : "dihapus"
                  }`}
                {event.type === "user-joined" && `${event.data.name} bergabung`}
                {event.type === "user-left" && `${event.data.name} keluar`}
                {event.type === "refresh-requested" &&
                  "Data direfresh oleh user lain"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
