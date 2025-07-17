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
          <div className="mb-6 p-4 bg-green-50 rounded-2xl border-2 border-green-200">
            <h3 className="font-bold text-gray-900 mb-1">{donation.title}</h3>
            <p className="text-sm text-green-700">
              Target: {formatRupiah(donation.donationTarget || donation.target)}
            </p>
          </div>

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
                  errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
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
                  errors.amount ? "border-red-300 bg-red-50" : "border-gray-200"
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
        </div>
      </div>
    </div>
  );
};

// Donation Detail Modal Component
const DonationDetailModal = ({ donation, isOpen, onClose, onDonate }) => {
  if (!isOpen || !donation) return null;

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
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">
                    👥 {donation.participants} donatur
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

              <button
                onClick={() => onDonate(donation)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Donasi Sekarang
              </button>
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

  const handleDonate = (donation) => {
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
            {donations.map((donation) => (
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
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetail(donation)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                    <button
                      onClick={() => handleDonate(donation)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                      <HandCoins className="w-4 h-4" />
                      Donasi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDonate={handleDonate}
      />

      <DonationForm
        donation={donationTarget}
        isOpen={isDonationFormOpen}
        onClose={() => setIsDonationFormOpen(false)}
        onSubmit={handleSubmitDonation}
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
