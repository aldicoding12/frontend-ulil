/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  MapPin,
  Users,
  Eye,
  UserPlus,
  AlertCircle,
  Loader2,
  HandCoins,
  CalendarCheck2,
  Clock,
  UserCheck,
} from "lucide-react";
import customAPI from "../../api";

// untuk mengambil scripts dari midtrans
const insertSnapScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_CLIENT_MIDTRANS
    );
    script.onload = resolve;
    document.body.appendChild(script);
  });
};

// Helper functions
const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryColor = (category) => {
  const colors = {
    Sosial: "bg-blue-600",
    Ibadah: "bg-green-600",
    Pendidikan: "bg-purple-600",
  };
  return colors[category] || "bg-gray-600";
};

const getCategoryIcon = (category) => {
  const icons = {
    Sosial: "🤝",
    Ibadah: "🕌",
    Pendidikan: "🎓",
  };
  return icons[category] || "💝";
};

// Function to check if donation deadline has passed
const isDeadlinePassed = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  return today > deadlineDate;
};

// Function to get remaining days
const getRemainingDays = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Donors List Modal Component
const DonorsListModal = ({ donation, isOpen, onClose }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && donation) {
      fetchDonors();
    }
  }, [isOpen, donation]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await customAPI.get(
        `/events/donations/donors/${donation._id}`
      );

      if (response.data.success) {
        setDonors(response.data.data || []);
      } else {
        setDonors([]);
      }
    } catch (error) {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              Daftar Donatur
            </h2>
            <p className="text-sm text-gray-600 mt-1">{donation.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat daftar donatur...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Belum ada donatur untuk program ini
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-green-700">
                    Total Donatur: {donors.length} orang
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    Total Terkumpul:{" "}
                    {formatRupiah(
                      donors.reduce(
                        (sum, donor) => sum + (donor.amount || 0),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              {donors.map((donor, index) => (
                <div
                  key={donor._id || index}
                  className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(donor.donorName || donor.name || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {donor.donorName || donor.name || "Anonim"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {donor.createdAt
                              ? new Date(donor.createdAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "Tanggal tidak tersedia"}
                          </p>
                        </div>
                      </div>

                      {donor.message && (
                        <div className="mt-2 p-3 bg-white rounded-xl border-l-4 border-green-500">
                          <p className="text-sm text-gray-700 italic">
                            "{donor.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <span className="font-bold text-green-600">
                        {formatRupiah(donor.amount || 0)}
                      </span>
                      {donor.paymentStatus && (
                        <p className="text-xs mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              donor.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : donor.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {donor.paymentStatus === "paid"
                              ? "✅ Lunas"
                              : donor.paymentStatus === "pending"
                              ? "⏳ Pending"
                              : "❌ Gagal"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Donation Form Component
const DonationForm = ({ donation, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor HP harus diisi";
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor HP tidak valid";
    }
    if (!formData.amount.trim()) {
      newErrors.amount = "Jumlah donasi harus diisi";
    } else if (parseInt(formData.amount) < 10000) {
      newErrors.amount = "Minimum donasi Rp 10.000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseInt(formData.amount),
        donationId: donation._id,
      });
      // Reset form setelah berhasil
      setFormData({ name: "", phone: "", amount: "", message: "" });
      setErrors({});
      onClose(); // Tutup modal
    } catch (error) {
      console.error("Donation error:", error);
      alert("Terjadi kesalahan saat memproses donasi");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen || !donation) return null;

  // Check if deadline has passed
  const deadlinePassed = isDeadlinePassed(donation.donationDeadline);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">💝 Form Donasi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {deadlinePassed && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Deadline Terlewat</span>
              </div>
              <p className="text-sm text-red-600">
                Maaf, periode donasi untuk program ini telah berakhir pada{" "}
                {new Date(donation.donationDeadline).toLocaleDateString(
                  "id-ID"
                )}
              </p>
            </div>
          )}

          <div className="mb-6 p-4 bg-green-50 rounded-2xl border-2 border-green-200">
            <h3 className="font-bold text-gray-900 mb-1">{donation.title}</h3>
            <p className="text-sm text-green-700">
              Target: {formatRupiah(donation.donationTarget || donation.target)}
            </p>
          </div>

          {!deadlinePassed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📱 Nomor HP *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💰 Jumlah Donasi *
                </label>
                <input
                  type="number"
                  required
                  min="10000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.amount
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Minimum Rp 10.000"
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💬 Pesan (Opsional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="3"
                  placeholder="Tulis pesan dukungan..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                  ❌ Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Memproses..." : "Donasi Sekarang"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl font-bold transition-colors">
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Donation Detail Modal Component
const DonationDetailModal = ({
  donation,
  isOpen,
  onClose,
  onDonate,
  onViewDonors,
}) => {
  if (!isOpen || !donation) return null;

  const deadlinePassed = isDeadlinePassed(donation.donationDeadline);
  const remainingDays = getRemainingDays(donation.donationDeadline);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with image */}
        <div className="relative">
          <img
            src={
              donation.image ||
              "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop"
            }
            alt={donation.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {deadlinePassed && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              ⏰ Deadline Terlewat
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70">
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white ${getCategoryColor(
                donation.category
              )}`}>
              {getCategoryIcon(donation.category)} {donation.category}
            </span>
            <h3 className="text-3xl font-bold text-white mb-2 mt-3 drop-shadow-lg">
              {donation.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Description */}
            <div>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  📋 Deskripsi
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {donation.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">📍 {donation.location}</span>
                </div>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onViewDonors(donation)}>
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600 hover:text-green-600 hover:underline">
                    👥 {donation.participants} donatur (Klik untuk lihat)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarCheck2
                    className={`w-5 h-5 ${
                      deadlinePassed ? "text-red-600" : "text-green-600"
                    }`}
                  />
                  <span
                    className={`${
                      deadlinePassed
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }`}>
                    {deadlinePassed ? "❌ Deadline terlewat: " : "Deadline : "}
                    {new Date(donation.donationDeadline).toLocaleDateString(
                      "id-ID"
                    )}
                    {!deadlinePassed && remainingDays > 0 && (
                      <span className="ml-2 text-orange-600 font-semibold">
                        ({remainingDays} hari lagi)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  💰 Progress Donasi
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terkumpul:</span>
                    <span className="font-bold text-green-600">
                      {formatRupiah(donation.donationCurrent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-bold">
                      {formatRupiah(donation.donationTarget || donation.target)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Sisa:</span>
                    <span className="font-bold text-orange-600">
                      {formatRupiah(
                        (donation.donationTarget || donation.target) -
                          donation.donationCurrent
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {deadlinePassed ? (
                  <div className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Periode Donasi Berakhir
                  </div>
                ) : (
                  <button
                    onClick={() => onDonate(donation)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Donasi Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
function DonationCards() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [isDonorsListOpen, setIsDonorsListOpen] = useState(false);
  const [donationTarget, setDonationTarget] = useState(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await customAPI.get("events/donations");

      if (response.data.success) {
        setDonations(response.data.data || []);
      } else {
        console.error("API response not successful:", response.data);
        setDonations([]);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    insertSnapScript();
  }, []);

  const handleViewDetail = (donation) => {
    setSelectedDonation(donation);
    setIsDetailOpen(true);
  };

  const handleViewDonors = (donation) => {
    setSelectedDonation(donation);
    setIsDonorsListOpen(true);
  };

  const handleDonate = (donation) => {
    // Check if deadline has passed
    if (isDeadlinePassed(donation.donationDeadline)) {
      alert("Maaf, periode donasi untuk program ini telah berakhir.");
      return;
    }

    setDonationTarget(donation);
    setIsDonationFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleSubmitDonation = async (donationData) => {
    try {
      // Kirim data donasi ke server
      const response = await customAPI.post("/donation", {
        eventId: donationData.donationId,
        donorName: donationData.name,
        donorPhone: donationData.phone,
        amount: donationData.amount,
        message: donationData.message,
      });

      const snapToken = response.data.data.snapToken;

      if (response.data.success) {
        // Jika backend mengembalikan snap token untuk Midtrans
        if (snapToken) {
          // Buka Midtrans Snap
          window.snap.pay(snapToken, {
            onSuccess: function (result) {
              console.log("Payment success:", result);
              alert("Donasi berhasil! Terima kasih atas kontribusi Anda.");

              // Refresh data donasi untuk update progress
              fetchDonations();
            },
            onPending: function (result) {
              console.log("Payment pending:", result);
              alert("Pembayaran tertunda. Silakan selesaikan pembayaran.");
            },
            onError: function (result) {
              console.log("Payment error:", result);
              alert("Terjadi kesalahan dalam pembayaran.");
            },
            onClose: function () {
              console.log("Payment popup closed");
            },
          });
        } else {
          // Jika tidak ada snap token, tampilkan pesan sukses
          alert("Donasi berhasil disubmit!");
          fetchDonations(); // Refresh data
        }
      } else {
        throw new Error(response.data.message || "Gagal memproses donasi");
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(
        error.response?.data?.message ||
          "Terjadi kesalahan saat memproses donasi"
      );
      throw error; // Re-throw untuk handling di form
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Memuat Donasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            DONASI
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Mari berdonasi untuk kebaikan bersama
          </p>
        </div>
      </div>

      {/* Cards Container */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {donations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Belum ada donasi tersedia</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {donations.map((donation) => {
              const deadlinePassed = isDeadlinePassed(
                donation.donationDeadline
              );
              const remainingDays = getRemainingDays(donation.donationDeadline);

              return (
                <div
                  key={donation._id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative">
                    <img
                      src={
                        donation.image ||
                        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop"
                      }
                      alt={donation.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getCategoryColor(
                          donation.category
                        )}`}>
                        {getCategoryIcon(donation.category)} {donation.category}
                      </span>
                    </div>
                    {deadlinePassed && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⏰ Berakhir
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {donation.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {donation.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Terkumpul:</span>
                        <span className="font-bold text-green-600">
                          {formatRupiah(donation.donationCurrent)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-bold">
                          {formatRupiah(
                            donation.donationTarget || donation.target
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span
                          className={`${
                            deadlinePassed ? "text-red-600" : "text-gray-500"
                          }`}>
                          {deadlinePassed ? "❌ Berakhir:" : "📅 Deadline:"}
                        </span>
                        <span
                          className={`font-semibold ${
                            deadlinePassed ? "text-red-600" : "text-gray-700"
                          }`}>
                          {new Date(
                            donation.donationDeadline
                          ).toLocaleDateString("id-ID")}
                          {!deadlinePassed && remainingDays > 0 && (
                            <span className="ml-1 text-orange-600">
                              ({remainingDays} hari)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewDetail(donation)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                        <button
                          onClick={() => handleViewDonors(donation)}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Donatur
                        </button>
                      </div>

                      {deadlinePassed ? (
                        <div className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          Berakhir
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDonate(donation)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                          <HandCoins className="w-4 h-4" />
                          Donasi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDonate={handleDonate}
        onViewDonors={handleViewDonors}
      />

      <DonationForm
        donation={donationTarget}
        isOpen={isDonationFormOpen}
        onClose={() => setIsDonationFormOpen(false)}
        onSubmit={handleSubmitDonation}
      />

      <DonorsListModal
        donation={selectedDonation}
        isOpen={isDonorsListOpen}
        onClose={() => setIsDonorsListOpen(false)}
      />

      {/* CSS for line-clamp */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default DonationCards;
