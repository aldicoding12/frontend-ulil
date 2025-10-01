/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import customAPI from "../../api";
import {
  Calendar,
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart3,
  Loader2,
  ChevronDown,
  Heart,
  Target,
  DollarSign,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import Donasiform from "../../components/admin/componens/donasi/Donasiform";

// Constants
const DONATION_CONFIG = {
  categories: [
    "all",
    "Zakat",
    "Infaq",
    "Sedekah",
    "Wakaf",
    "Qurban",
    "Pembangunan",
    "Operasional",
    "Lainnya",
  ],
  statuses: {
    options: ["all", "active", "completed", "paused", "cancelled"],
    config: {
      active: { label: "Aktif", color: "bg-green-100 text-green-800" },
      completed: { label: "Selesai", color: "bg-blue-100 text-blue-800" },
      paused: { label: "Ditunda", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
    },
    messages: {
      confirmation: {
        active: "Apakah Anda yakin ingin mengaktifkan donasi ini?",
        completed: "Apakah Anda yakin donasi ini sudah selesai?",
        paused: "Apakah Anda yakin ingin menunda donasi ini?",
        cancelled: "Apakah Anda yakin ingin membatalkan donasi ini?",
      },
      success: {
        active: "Donasi berhasil diaktifkan!",
        completed: "Donasi telah selesai!",
        paused: "Donasi berhasil ditunda!",
        cancelled: "Donasi berhasil dibatalkan!",
      },
    },
  },
};

// Utility Functions
const formatCurrency = (amount) =>
  `Rp ${(amount || 0).toLocaleString("id-ID")}`;

const formatDate = (date, options = {}) => {
  if (!date) return "Tanggal tidak tersedia";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
};

const calculateProgress = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const diff = new Date(endDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const transformDonationData = (donation) => ({
  ...donation,
  status: donation.status || "active",
  title: donation.title || donation.name,
  description: donation.description || "",
  category: donation.category || "Lainnya",
  targetAmount: donation.donationTarget || donation.targetAmount || 0,
  currentAmount: donation.donationCurrent || donation.currentAmount || 0,
  donorCount: donation.donorCount || 0,
  endDate: donation.donationDeadline || donation.deadline || donation.endDate,
});

const transformDonorData = (donor) => ({
  _id: donor._id,
  donorName: donor.donorName || donor.name || "Anonim",
  phone: donor.phone || donor.donorPhone,
  address: donor.address || "",
  amount: donor.amount || 0,
  message: donor.message || "",
  donatedAt: donor.donatedAt,
  isAnonymous: donor.isAnonymous || false,
});

// API Service
const donationAPI = {
  getAll: () => customAPI.get("events/donations"),
  updateStatus: (id, status) =>
    customAPI.put(`/donations/${id}/status`, { status }),
  delete: (id) => customAPI.delete(`events/donations/${id}`),
  getDonors: (id) => customAPI.get(`/events/donations/donors/${id}`),
};

// Custom Hooks
const useDonasiData = () => {
  const [donasi, setDonasi] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const totalDonasi = donasi.length;
    const totalDonatur = donasi.reduce(
      (sum, d) => sum + (d.donorCount || 0),
      0
    );
    const donasiAktif = donasi.filter((d) => d.status === "active").length;
    const totalTerkumpul = donasi.reduce(
      (sum, d) => sum + (d.currentAmount || 0),
      0
    );

    return { totalDonasi, totalDonatur, donasiAktif, totalTerkumpul };
  }, [donasi]);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getAll();
      if (response.data.success) {
        const donations = response.data.data || [];

        // Transform data dan fetch donor count untuk setiap donasi
        const donationsWithDonorCount = await Promise.all(
          donations.map(async (donation) => {
            const transformedDonation = transformDonationData(donation);

            // Fetch donor count jika tidak ada atau 0
            if (
              !transformedDonation.donorCount ||
              transformedDonation.donorCount === 0
            ) {
              try {
                const donorResponse = await donationAPI.getDonors(donation._id);
                if (donorResponse.data.success) {
                  const donorData = donorResponse.data.data || [];
                  transformedDonation.donorCount = donorData.length;

                  // Update current amount jika tidak sesuai
                  const totalFromDonors = donorData.reduce(
                    (sum, donor) => sum + (donor.amount || 0),
                    0
                  );
                  if (
                    totalFromDonors > 0 &&
                    (!transformedDonation.currentAmount ||
                      transformedDonation.currentAmount !== totalFromDonors)
                  ) {
                    transformedDonation.currentAmount = totalFromDonors;
                  }
                }
              } catch (error) {
                // Gunakan data yang ada jika fetch gagal
              }
            }

            return transformedDonation;
          })
        );

        setDonasi(donationsWithDonorCount);
      } else {
        setDonasi([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Gagal memuat data donasi: ${errorMessage}`);
      setDonasi([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDonationStatus = useCallback((donationId, newStatus) => {
    setDonasi((prevDonasi) =>
      prevDonasi.map((d) =>
        d._id === donationId ? { ...d, status: newStatus } : d
      )
    );
  }, []);

  const updateDonationData = useCallback((donationId, updates) => {
    setDonasi((prevDonasi) =>
      prevDonasi.map((d) => (d._id === donationId ? { ...d, ...updates } : d))
    );
  }, []);

  const deleteDonation = useCallback(
    async (id) => {
      if (!confirm("Apakah Anda yakin ingin menghapus donasi ini?")) return;

      try {
        await donationAPI.delete(id);
        alert("Donasi berhasil dihapus!");
        fetchDonations();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Gagal menghapus donasi: ${errorMessage}`);
      }
    },
    [fetchDonations]
  );

  return {
    donasi,
    loading,
    stats,
    fetchDonations,
    updateDonationStatus,
    updateDonationData,
    deleteDonation,
  };
};

const useFilters = (donasi) => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedCategory: "all",
    selectedStatus: "all",
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredDonasi = useMemo(() => {
    let filtered = donasi;

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.selectedCategory !== "all") {
      filtered = filtered.filter(
        (d) => d.category === filters.selectedCategory
      );
    }

    if (filters.selectedStatus !== "all") {
      filtered = filtered.filter((d) => d.status === filters.selectedStatus);
    }

    return filtered;
  }, [donasi, filters]);

  return { filters, updateFilter, filteredDonasi };
};

const useDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDonors = useCallback(async (donationId) => {
    if (!donationId) return;

    try {
      setLoading(true);
      const response = await donationAPI.getDonors(donationId);
      if (response.data.success) {
        const donorData = (response.data.data || []).map(transformDonorData);
        setDonors(donorData);
      } else {
        setDonors([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Gagal memuat data donor: ${errorMessage}`);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { donors, loading, fetchDonors };
};

// Components
const DonorsModal = ({ isOpen, onClose, donasi, onDonorDataUpdate }) => {
  const { donors, loading, fetchDonors } = useDonors();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && donasi) {
      fetchDonors(donasi._id).then(() => {
        // Update parent component dengan data donor yang baru
        if (onDonorDataUpdate && donors.length > 0) {
          const totalAmount = donors.reduce(
            (sum, donor) => sum + (donor.amount || 0),
            0
          );
          onDonorDataUpdate(donasi._id, {
            donorCount: donors.length,
            currentAmount: totalAmount,
          });
        }
      });
    }
  }, [isOpen, donasi, fetchDonors]);

  // Update parent saat donors berubah
  useEffect(() => {
    if (onDonorDataUpdate && donasi && donors.length > 0) {
      const totalAmount = donors.reduce(
        (sum, donor) => sum + (donor.amount || 0),
        0
      );
      onDonorDataUpdate(donasi._id, {
        donorCount: donors.length,
        currentAmount: totalAmount,
      });
    }
  }, [donors, onDonorDataUpdate, donasi]);

  const filteredDonors = useMemo(() => {
    if (!searchTerm) return donors;
    const searchLower = searchTerm.toLowerCase();
    return donors.filter(
      (donor) =>
        (donor.donorName || "").toLowerCase().includes(searchLower) ||
        (donor.phone || "").includes(searchTerm)
    );
  }, [donors, searchTerm]);

  const donorStats = useMemo(() => {
    // Gunakan data real dari donors yang di-fetch
    const realTotalAmount = donors.reduce(
      (sum, donor) => sum + (donor.amount || 0),
      0
    );
    return {
      totalDonors: donors.length,
      totalAmount: realTotalAmount,
      averageAmount:
        donors.length > 0 ? Math.round(realTotalAmount / donors.length) : 0,
    };
  }, [donors]);

  if (!isOpen) return null;

  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-${color}-50 rounded-lg p-4`}>
      <div className="flex items-center">
        <Icon className={`w-8 h-8 text-${color}-600 mr-3`} />
        <div>
          <p className={`text-sm text-${color}-600 font-medium`}>{label}</p>
          <p className={`text-2xl font-bold text-${color}-800`}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Daftar Donor</h2>
              <p className="text-green-100 mt-1">{donasi?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari donor berdasarkan nama atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              icon={Users}
              label="Total Donor"
              value={donorStats.totalDonors}
              color="blue"
            />
            <StatsCard
              icon={DollarSign}
              label="Total Donasi"
              value={formatCurrency(donorStats.totalAmount)}
              color="green"
            />
            <StatsCard
              icon={BarChart3}
              label="Rata-rata"
              value={formatCurrency(donorStats.averageAmount)}
              color="purple"
            />
          </div>

          {/* Donors List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Memuat data donor...</span>
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm
                    ? "Tidak ada donor yang sesuai"
                    : "Belum ada donor"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Coba ubah kata kunci pencarian"
                    : "Donor akan muncul setelah ada yang berdonasi"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDonors.map((donor, index) => (
                  <div
                    key={donor._id || index}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(donor.donorName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {donor.donorName || "Anonim"}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            {donor.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {donor.phone}
                              </div>
                            )}
                          </div>
                          {donor.address && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {donor.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(donor.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(donor.donatedAt, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {donor.message && (
                          <p className="text-sm text-gray-600 mt-1 italic max-w-xs text-right">
                            "{donor.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusDropdown = ({ currentStatus, donationId, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = Object.entries(DONATION_CONFIG.statuses.config);
  const currentStatusConfig =
    DONATION_CONFIG.statuses.config[currentStatus] ||
    DONATION_CONFIG.statuses.config.active;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    const confirmMessage =
      DONATION_CONFIG.statuses.messages.confirmation[newStatus] ||
      "Apakah Anda yakin ingin mengubah status?";

    if (!confirm(confirmMessage)) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await donationAPI.updateStatus(donationId, newStatus);
      const successMessage =
        DONATION_CONFIG.statuses.messages.success[newStatus] ||
        "Status berhasil diubah!";
      alert(successMessage);
      onStatusUpdate(donationId, newStatus);
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Gagal mengubah status donasi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all hover:shadow-md ${
          currentStatusConfig.color
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            {currentStatusConfig.label}
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {isOpen && !loading && (
        <>
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
            {statusOptions.map(([value, config]) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  value === currentStatus ? "bg-gray-100" : ""
                }`}>
                <span className={`px-2 py-1 rounded-full ${config.color}`}>
                  {config.label}
                </span>
              </button>
            ))}
          </div>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        {loading ? (
          <div className="flex items-center mt-1">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        )}
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace("border-", "bg-")
          .replace("-500", "-100")}`}>
        <Icon className={`w-6 h-6 ${color.replace("border-", "text-")}`} />
      </div>
    </div>
  </div>
);

const FilterSection = ({ filters, updateFilter }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari donasi..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter("searchTerm", e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <select
        value={filters.selectedCategory}
        onChange={(e) => updateFilter("selectedCategory", e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        {DONATION_CONFIG.categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat === "all" ? "Semua Kategori" : cat}
          </option>
        ))}
      </select>

      <select
        value={filters.selectedStatus}
        onChange={(e) => updateFilter("selectedStatus", e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        {DONATION_CONFIG.statuses.options.map((status) => (
          <option key={status} value={status}>
            {status === "all"
              ? "Semua Status"
              : DONATION_CONFIG.statuses.config[status]?.label || status}
          </option>
        ))}
      </select>

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  </div>
);

const ProgressBar = ({ current, target }) => {
  const progress = calculateProgress(current, target);

  return (
    <div className="min-w-[200px]">
      <div className="flex flex-col space-y-1 mb-2">
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(current)}
        </div>
        <div className="text-xs text-gray-500">
          dari {formatCurrency(target)}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs font-medium text-gray-600">
        {Math.round(progress)}% tercapai
      </div>
    </div>
  );
};

const DonasiTable = ({
  filteredDonasi,
  loading,
  onEdit,
  onDelete,
  onViewDonors,
  onStatusUpdate,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Memuat data donasi...</span>
        </div>
      </div>
    );
  }

  if (filteredDonasi.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Tidak ada donasi ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            Coba ubah filter pencarian atau tambah donasi baru
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Donasi
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Target & Progress
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Donatur
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDonasi.map((item) => {
              const daysRemaining = calculateDaysRemaining(item.endDate);

              return (
                <tr
                  key={item._id}
                  className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative w-20 h-24 mr-4 bg-gradient-to-br from-green-600 to-green-700 rounded-lg overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative p-2 text-white text-center h-full flex flex-col justify-center">
                          <Heart className="w-8 h-8 mx-auto mb-1" />
                          <div className="text-xs font-bold">
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            oleh {item.createdBy || "Admin"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-40">
                      <ProgressBar
                        current={item.currentAmount}
                        target={item.targetAmount}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {item.donorCount || 0} donatur
                    </div>
                    <div className="text-xs text-gray-500">
                      Rata-rata:{" "}
                      {formatCurrency(
                        item.donorCount > 0
                          ? Math.round(item.currentAmount / item.donorCount)
                          : 0
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown
                      currentStatus={item.status || "active"}
                      donationId={item._id}
                      onStatusUpdate={onStatusUpdate}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {item.endDate
                        ? formatDate(item.endDate)
                        : "Tidak terbatas"}
                    </div>
                    {daysRemaining !== null && (
                      <div className="text-xs text-gray-500">
                        {daysRemaining > 0
                          ? `${daysRemaining} hari lagi`
                          : "Berakhir"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDonors(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Lihat Donatur">
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
                        title="Edit">
                        <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Hapus">
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
function DonasiManagement() {
  const {
    donasi,
    loading,
    stats,
    fetchDonations,
    updateDonationStatus,
    updateDonationData,
    deleteDonation,
  } = useDonasiData();
  const { filters, updateFilter, filteredDonasi } = useFilters(donasi);

  const [selectedDonasi, setSelectedDonasi] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDonorsOpen, setIsDonorsOpen] = useState(false);
  const [editingDonasi, setEditingDonasi] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSaveDonasi = useCallback(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleEditDonasi = useCallback((donasi) => {
    setEditingDonasi(donasi);
    setIsFormOpen(true);
  }, []);

  const handleViewDonors = useCallback((donasi) => {
    setSelectedDonasi(donasi);
    setIsDonorsOpen(true);
  }, []);

  const handleCloseDonorsModal = useCallback(() => {
    setIsDonorsOpen(false);
    setSelectedDonasi(null);
  }, []);

  const handleOpenForm = useCallback(() => {
    setEditingDonasi(null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDonasi(null);
  }, []);

  const handleDonorDataUpdate = useCallback(
    (donationId, updates) => {
      updateDonationData(donationId, updates);
    },
    [updateDonationData]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Donasi
              </h1>
              <p className="text-gray-600">Kelola donasi masjid dengan mudah</p>
            </div>
            <button
              onClick={handleOpenForm}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Tambah Donasi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Donasi"
            value={stats.totalDonasi}
            icon={Heart}
            color="border-blue-500"
            loading={loading}
          />
          <StatsCard
            title="Donasi Aktif"
            value={stats.donasiAktif}
            icon={Target}
            color="border-purple-500"
            loading={loading}
          />
          <StatsCard
            title="Total Donatur"
            value={stats.totalDonatur}
            icon={Users}
            color="border-green-500"
            loading={loading}
          />
          <StatsCard
            title="Total Terkumpul"
            value={loading ? "..." : formatCurrency(stats.totalTerkumpul)}
            icon={DollarSign}
            color="border-orange-500"
            loading={loading}
          />
        </div>

        {/* Filters */}
        <FilterSection filters={filters} updateFilter={updateFilter} />

        {/* Table */}
        <DonasiTable
          filteredDonasi={filteredDonasi}
          loading={loading}
          onEdit={handleEditDonasi}
          onDelete={deleteDonation}
          onViewDonors={handleViewDonors}
          onStatusUpdate={updateDonationStatus}
        />
      </div>

      {/* Modals */}
      <Donasiform
        kegiatan={editingDonasi}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveDonasi}
      />

      <DonorsModal
        isOpen={isDonorsOpen}
        onClose={handleCloseDonorsModal}
        donasi={selectedDonasi}
        onDonorDataUpdate={handleDonorDataUpdate}
      />

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default DonasiManagement;
