/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { CheckCircle, Gift, Heart, ArrowLeft, RefreshCw } from "lucide-react";
import customAPI from "../../api"; // Import customAPI

const DonationSuccess = () => {
  const [donationData, setDonationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil parameter dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");
  const statusCode = urlParams.get("status_code");
  const transactionStatus = urlParams.get("transaction_status");

  // Utility functions - moved outside of other functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // PERBAIKAN: Cek apakah donation berhasil berdasarkan URL params atau data
  const isDonationSuccessful = () => {
    // Cek dari URL parameters
    if (transactionStatus === "settlement" || statusCode === "200") {
      return true;
    }
    // Cek dari data API
    if (donationData && donationData.paymentStatus === "success") {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const fetchDonationStatus = async () => {
      if (!orderId) {
        setError("Order ID tidak ditemukan di URL");
        setLoading(false);
        return;
      }

      try {
        // PERBAIKAN: menggunakan customAPI
        const response = await customAPI.get(`/donations/status/${orderId}`);
        const result = response.data;

        if (result.success) {
          setDonationData(result.data);

          // PERBAIKAN: Jika status masih pending, coba update via Midtrans
          if (
            result.data.paymentStatus === "pending" &&
            (transactionStatus === "settlement" || statusCode === "200")
          ) {
            // Tunggu sebentar lalu cek lagi
            setTimeout(() => {
              fetchDonationStatus();
            }, 3000);
          }
        } else {
          setError(result.message || "Gagal memuat data donasi");
        }
      } catch (err) {
        // PERBAIKAN: Jika API gagal tapi ada parameter sukses dari Midtrans, tampilkan sebagai sukses
        if (
          (transactionStatus === "settlement" || statusCode === "200") &&
          err.response?.status === 400
        ) {
          // Set data dummy berdasarkan URL params
          setDonationData({
            orderId: orderId,
            amount: 0, // Amount tidak diketahui dari URL params
            paymentStatus: "success",
            paidAt: new Date().toISOString(),
            event: null,
          });
        } else {
          setError(
            `Terjadi kesalahan saat memuat data: ${
              err.message || err.response?.data?.message || "Unknown error"
            }`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonationStatus();
  }, [orderId, transactionStatus, statusCode]);

  const handleBackToEvents = () => {
    window.location.href = "/events";
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      // PERBAIKAN: menggunakan customAPI
      const response = await customAPI.get(`/donations/status/${orderId}`);
      const result = response.data;

      if (result.success) {
        setDonationData(result.data);
      } else {
        setError(result.message || "Gagal memuat data donasi");
      }
    } catch (err) {
      // PERBAIKAN: Jika API gagal tapi ada parameter sukses dari Midtrans, tampilkan sebagai sukses
      if (
        (transactionStatus === "settlement" || statusCode === "200") &&
        err.response?.status === 400
      ) {
        // Set data dummy berdasarkan URL params
        setDonationData({
          orderId: orderId,
          amount: 0, // Amount tidak diketahui dari URL params
          paymentStatus: "success",
          paidAt: new Date().toISOString(),
          event: null,
        });
      } else {
        setError(
          `Terjadi kesalahan saat memuat data: ${
            err.message || err.response?.data?.message || "Unknown error"
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Memuat data donasi...</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: {orderId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded">
            <p>Debug Info:</p>
            <p>Order ID: {orderId}</p>
            <p>Status Code: {statusCode}</p>
            <p>Transaction Status: {transactionStatus}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Coba Lagi
            </button>
            <button
              onClick={handleBackToEvents}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isDonationSuccessful() ? "Terima Kasih! 🎉" : "Donasi Diproses 🔄"}
          </h1>
          <p className="text-lg text-gray-600">
            {isDonationSuccessful()
              ? "Donasi Anda telah berhasil diproses"
              : "Donasi Anda sedang dalam proses"}
          </p>
        </div>

        {/* Donation Details */}
        {donationData && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Detail Donasi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                  {donationData.orderId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Jumlah Donasi</p>
                <p className="text-2xl font-bold text-green-600">
                  {donationData.amount > 0
                    ? formatCurrency(donationData.amount)
                    : "Data tidak tersedia"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    donationData.paymentStatus === "success" ||
                    isDonationSuccessful()
                      ? "bg-green-100 text-green-800"
                      : donationData.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {donationData.paymentStatus === "success" ||
                  isDonationSuccessful()
                    ? "Berhasil"
                    : donationData.paymentStatus === "pending"
                    ? "Menunggu"
                    : "Gagal"}
                </span>
              </div>

              {donationData.paidAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Waktu Pembayaran</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(donationData.paidAt)}
                  </p>
                </div>
              )}

              {donationData.event && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Event</p>
                  <p className="font-semibold text-gray-800">
                    {donationData.event.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL Parameters Info (untuk debugging - bisa dihapus di production) */}
        {(statusCode || transactionStatus) && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Info Transaksi
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              {statusCode && <p>Status Code: {statusCode}</p>}
              {transactionStatus && (
                <p>Transaction Status: {transactionStatus}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2 font-semibold">
            <Gift className="w-5 h-5" />
            Donasi Lagi
          </button>

          <button
            onClick={handleBackToEvents}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center gap-2 font-semibold">
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Events
          </button>
        </div>

        {/* Share Success (Optional) - hanya tampil jika donasi berhasil */}
        {isDonationSuccessful() && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">Bagikan kebaikan Anda</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const text = `Saya baru saja berdonasi ${
                    donationData ? formatCurrency(donationData.amount) : ""
                  } untuk kegiatan sosial. Mari bersama-sama berbagi kebaikan! 🤲`;
                  if (navigator.share) {
                    navigator.share({
                      title: "Donasi Berhasil",
                      text: text,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(text);
                    alert("Teks berhasil disalin!");
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline">
                Bagikan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationSuccess;
