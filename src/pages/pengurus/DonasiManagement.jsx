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
} from "lucide-react";

import KegiatanForm from "../../components/admin/componens/donasi/Donasiform";
import ParticipantsModal from "../../components/admin/componens/kegiatan/ParticipantsModal";

// Constants for Donation Management
const DONATION_CATEGORIES = [
  "all",
  "Zakat",
  "Infaq",
  "Sedekah",
  "Wakaf",
  "Qurban",
  "Pembangunan",
  "Operasional",
  "Lainnya",
];

const DONATION_STATUSES = ["all", "active", "completed", "paused", "cancelled"];

const DONATION_STATUS_CONFIG = {
  active: { label: "Aktif", color: "bg-green-100 text-green-800" },
  completed: { label: "Selesai", color: "bg-blue-100 text-blue-800" },
  paused: { label: "Ditunda", color: "bg-yellow-100 text-yellow-800" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
};

const DONATION_CONFIRMATION_MESSAGES = {
  active: "Apakah Anda yakin ingin mengaktifkan donasi ini?",
  completed: "Apakah Anda yakin donasi ini sudah selesai?",
  paused: "Apakah Anda yakin ingin menunda donasi ini?",
  cancelled: "Apakah Anda yakin ingin membatalkan donasi ini?",
};

const DONATION_SUCCESS_MESSAGES = {
  active: "Donasi berhasil diaktifkan!",
  completed: "Donasi telah selesai!",
  paused: "Donasi berhasil ditunda!",
  cancelled: "Donasi berhasil dibatalkan!",
};

// Custom Hooks
const useDonasiData = () => {
  const [donasi, setDonasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonasi: 0,
    totalDonatur: 0,
    donasiAktif: 0,
    totalTerkumpul: 0,
  });

  const calculateStats = useCallback((donations) => {
    const totalDonasi = donations.length;
    const totalDonatur = donations.reduce(
      (sum, d) => sum + (d.donorCount || 0),
      0
    );
    const donasiAktif = donations.filter((d) => d.status === "active").length;
    const totalTerkumpul = donations.reduce(
      (sum, d) => sum + (d.currentAmount || 0),
      0
    );

    setStats({ totalDonasi, totalDonatur, donasiAktif, totalTerkumpul });
  }, []);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      // Menggunakan endpoint yang benar untuk donasi
      const response = await customAPI.get("events/donations");

      if (response.data.success) {
        const donations = response.data.data || [];
        const donationsWithStatus = donations.map((donation) => ({
          ...donation,
          status: donation.status || "active",
          // Mapping field untuk kompatibilitas dengan komponen
          title: donation.title || donation.name,
          description: donation.description || "",
          category: donation.category || "Lainnya",
          targetAmount: donation.donationTarget || 0,
          currentAmount: donation.donationCurrent || 0,
          donorCount: donation.donorCount || 0,
          endDate: donation.donationDeadline || donation.deadline,
        }));

        setDonasi(donationsWithStatus);
        calculateStats(donationsWithStatus);
      } else {
        setDonasi([]);
      }
    } catch (error) {
      alert(
        "Gagal memuat data donasi: " +
          (error.response?.data?.message || error.message)
      );
      setDonasi([]);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const updateDonationStatus = useCallback(
    (donationId, newStatus) => {
      setDonasi((prevDonasi) => {
        const updatedDonasi = prevDonasi.map((d) =>
          d._id === donationId ? { ...d, status: newStatus } : d
        );
        calculateStats(updatedDonasi);
        return updatedDonasi;
      });
    },
    [calculateStats]
  );

  return {
    donasi,
    setDonasi,
    loading,
    stats,
    fetchDonations,
    updateDonationStatus,
  };
};

const useFilters = (donasi) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredDonasi = useMemo(() => {
    let filtered = donasi;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((d) => d.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    return filtered;
  }, [donasi, searchTerm, selectedCategory, selectedStatus]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredDonasi,
  };
};

// Components
const StatusDropdown = ({ currentStatus, donationId, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = Object.entries(DONATION_STATUS_CONFIG);
  const currentStatusConfig =
    DONATION_STATUS_CONFIG[currentStatus] || DONATION_STATUS_CONFIG.active;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    if (
      !confirm(
        DONATION_CONFIRMATION_MESSAGES[newStatus] ||
          "Apakah Anda yakin ingin mengubah status?"
      )
    ) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await customAPI.put(`/donations/${donationId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        onStatusUpdate(donationId, newStatus);
        setIsOpen(false);
        alert(
          DONATION_SUCCESS_MESSAGES[newStatus] || "Status berhasil diubah!"
        );
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengubah status donasi";
      alert(errorMessage);
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

const FilterSection = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari donasi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        {DONATION_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat === "all" ? "Semua Kategori" : cat}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        {DONATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status === "all"
              ? "Semua Status"
              : DONATION_STATUS_CONFIG[status]?.label || status}
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
            {filteredDonasi.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="relative w-20 h-24 mr-4 bg-gradient-to-br from-green-600 to-green-700 rounded-lg overflow-hidden shadow-lg">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative p-2 text-white text-center h-full flex flex-col justify-center">
                        <Heart className="w-8 h-8 mx-auto mb-1" />
                        <div className="text-xs font-bold">{item.category}</div>
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
                  <div className="text-sm text-gray-900 font-medium">
                    Rp {(item.currentAmount || 0).toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-gray-500">
                    dari Rp {(item.targetAmount || 0).toLocaleString("id-ID")}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          item.targetAmount > 0
                            ? Math.min(
                                ((item.currentAmount || 0) /
                                  item.targetAmount) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.targetAmount > 0
                      ? Math.round(
                          ((item.currentAmount || 0) / item.targetAmount) * 100
                        )
                      : 0}
                    % tercapai
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {item.donorCount || 0} donatur
                  </div>
                  <div className="text-xs text-gray-500">
                    Rata-rata: Rp{" "}
                    {item.donorCount > 0
                      ? Math.round(
                          (item.currentAmount || 0) / item.donorCount
                        ).toLocaleString("id-ID")
                      : 0}
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
                      ? new Date(item.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Tidak terbatas"}
                  </div>
                  {item.endDate && (
                    <div className="text-xs text-gray-500">
                      {new Date(item.endDate) > new Date()
                        ? `${Math.ceil(
                            (new Date(item.endDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )} hari lagi`
                        : "Berakhir"}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDonors(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                      title="Lihat Donatur"></button>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
function DonasiManagement() {
  const { donasi, loading, stats, fetchDonations, updateDonationStatus } =
    useDonasiData();
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredDonasi,
  } = useFilters(donasi);

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

  const handleDeleteDonasi = useCallback(
    async (id) => {
      if (confirm("Apakah Anda yakin ingin menghapus donasi ini?")) {
        try {
          await customAPI.delete(`events/donations/${id}`);
          fetchDonations();
        } catch (error) {
          alert(
            "Gagal menghapus donasi: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    },
    [fetchDonations]
  );

  const handleViewDonors = useCallback((donasi) => {
    setSelectedDonasi(donasi);
    setIsDonorsOpen(true);
  }, []);

  const handleUpdateDonorStatus = useCallback(
    async (donorId, status) => {
      if (!selectedDonasi) return;

      try {
        await customAPI.put(`events/donations/${donorId}`, { status });

        const updatedDonasi = {
          ...selectedDonasi,
          donors:
            selectedDonasi.donors?.map((d) =>
              d._id === donorId ? { ...d, status } : d
            ) || [],
        };

        setSelectedDonasi(updatedDonasi);
      } catch (error) {
        alert(
          "Gagal mengupdate status donatur: " +
            (error.response?.data?.message || error.message)
        );
      }
    },
    [selectedDonasi]
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
              onClick={() => {
                setEditingDonasi(null);
                setIsFormOpen(true);
              }}
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
            value={
              loading
                ? "..."
                : `Rp ${stats.totalTerkumpul.toLocaleString("id-ID")}`
            }
            icon={DollarSign}
            color="border-orange-500"
            loading={loading}
          />
        </div>

        {/* Filters */}
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {/* Table */}
        <DonasiTable
          filteredDonasi={filteredDonasi}
          loading={loading}
          onEdit={handleEditDonasi}
          onDelete={handleDeleteDonasi}
          onViewDonors={handleViewDonors}
          onStatusUpdate={updateDonationStatus}
        />
      </div>

      {/* Modals */}
      <KegiatanForm
        kegiatan={editingDonasi}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDonasi(null);
        }}
        onSave={handleSaveDonasi}
      />

      <ParticipantsModal
        kegiatan={selectedDonasi}
        isOpen={isDonorsOpen}
        onClose={() => {
          setIsDonorsOpen(false);
          setSelectedDonasi(null);
        }}
        onUpdateStatus={handleUpdateDonorStatus}
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
