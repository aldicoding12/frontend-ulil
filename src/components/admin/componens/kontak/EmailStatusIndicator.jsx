// src/components/admin/EmailStatusIndicator.jsx
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  RefreshCw,
} from "lucide-react";
import customAPI from "../../../../api";

function EmailStatusIndicator() {
  const [emailStatus, setEmailStatus] = useState({
    isConnected: null,
    lastChecked: null,
    error: null,
    checking: false,
  });

  const checkEmailStatus = async () => {
    try {
      setEmailStatus((prev) => ({ ...prev, checking: true }));

      const response = await customAPI.get("/contact/test-email");

      setEmailStatus({
        isConnected: response.data.success,
        lastChecked: new Date(),
        error: null,
        checking: false,
      });
    } catch (error) {
      setEmailStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error.response?.data?.message || "Koneksi email gagal",
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const getStatusColor = () => {
    if (emailStatus.checking) return "border-yellow-300 bg-yellow-50";
    if (emailStatus.isConnected === null) return "border-gray-300 bg-gray-50";
    if (emailStatus.isConnected) return "border-green-300 bg-green-50";
    return "border-red-300 bg-red-50";
  };

  const getStatusIcon = () => {
    if (emailStatus.checking) {
      return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
    }
    if (emailStatus.isConnected === null) {
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
    if (emailStatus.isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (emailStatus.checking) return "Memeriksa koneksi...";
    if (emailStatus.isConnected === null) return "Status tidak diketahui";
    if (emailStatus.isConnected) return "Email service aktif";
    return "Email service bermasalah";
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Status Email
          </span>
        </div>
        <button
          onClick={checkEmailStatus}
          disabled={emailStatus.checking}
          className="p-1 text-gray-600 hover:bg-white rounded transition-colors disabled:opacity-50"
          title="Refresh status">
          <RefreshCw
            className={`w-4 h-4 ${emailStatus.checking ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {getStatusIcon()}
        <span className="text-sm text-gray-700">{getStatusText()}</span>
      </div>

      {emailStatus.error && (
        <div className="mt-2 text-xs text-red-600">{emailStatus.error}</div>
      )}

      {emailStatus.lastChecked && (
        <div className="mt-1 text-xs text-gray-500">
          Terakhir diperiksa:{" "}
          {emailStatus.lastChecked.toLocaleTimeString("id-ID")}
        </div>
      )}
    </div>
  );
}

// Komponen untuk menampilkan dalam header atau sidebar
function EmailStatusBadge() {
  const [emailStatus, setEmailStatus] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await customAPI.get("/contact/test-email");
        setEmailStatus(response.data.success);
      } catch (error) {
        setEmailStatus(false);
      }
    };

    checkStatus();
    // Check every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (emailStatus === null) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          emailStatus
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
        <Mail className="w-3 h-3" />
        {emailStatus ? "Email OK" : "Email Error"}
      </div>

      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
          {emailStatus
            ? "Service email berfungsi normal"
            : "Service email bermasalah - cek konfigurasi"}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export { EmailStatusIndicator, EmailStatusBadge };
