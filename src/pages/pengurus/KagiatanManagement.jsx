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
} from "lucide-react";

import KegiatanForm from "../../components/admin/componens/kegiatan/KegiatanForm";
import ParticipantsModal from "../../components/admin/componens/kegiatan/ParticipantsModal";

// Constants
const CATEGORIES = [
  "all",
  "Kajian",
  "Pendidikan",
  "Sosial",
  "Ibadah",
  "Lainnya",
];
const STATUSES = ["all", "draft", "published", "cancelled", "completed"];

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "Dipublikasi", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
  completed: { label: "Selesai", color: "bg-blue-100 text-blue-800" },
};

const CONFIRMATION_MESSAGES = {
  published: "Apakah Anda yakin ingin mempublikasi kegiatan ini?",
  cancelled: "Apakah Anda yakin ingin membatalkan kegiatan ini?",
  completed: "Apakah Anda yakin kegiatan ini sudah selesai?",
  draft: "Apakah Anda yakin ingin mengubah status menjadi draft?",
};

const SUCCESS_MESSAGES = {
  published: "Kegiatan berhasil dipublikasi!",
  cancelled: "Kegiatan berhasil dibatalkan!",
  completed: "Kegiatan telah ditandai selesai!",
  draft: "Kegiatan disimpan sebagai draft!",
};

// Custom Hooks
const useKegiatanData = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKegiatan: 0,
    totalPeserta: 0,
    kegiatanAktif: 0,
    totalBudget: 0,
  });

  const calculateStats = useCallback((events) => {
    const totalKegiatan = events.length;
    const totalPeserta = events.reduce(
      (sum, k) => sum + (k.registeredCount || 0),
      0
    );
    const kegiatanAktif = events.filter((k) => k.status === "published").length;
    const totalBudget = events.reduce((sum, k) => sum + (k.budget || 0), 0);

    setStats({ totalKegiatan, totalPeserta, kegiatanAktif, totalBudget });
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customAPI.get("/events");

      if (response.data.success) {
        const events = response.data.data || [];
        const eventsWithStatus = events.map((event) => ({
          ...event,
          status: event.status || "draft",
        }));

        setKegiatan(eventsWithStatus);
        calculateStats(eventsWithStatus);
      } else {
        setKegiatan([]);
      }
    } catch (error) {
      alert(
        "Gagal memuat data kegiatan: " +
          (error.response?.data?.message || error.message)
      );
      setKegiatan([]);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const updateEventStatus = useCallback(
    (eventId, newStatus) => {
      setKegiatan((prevKegiatan) => {
        const updatedKegiatan = prevKegiatan.map((k) =>
          k._id === eventId ? { ...k, status: newStatus } : k
        );
        calculateStats(updatedKegiatan);
        return updatedKegiatan;
      });
    },
    [calculateStats]
  );

  return {
    kegiatan,
    setKegiatan,
    loading,
    stats,
    fetchEvents,
    updateEventStatus,
  };
};

const useFilters = (kegiatan) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredKegiatan = useMemo(() => {
    let filtered = kegiatan;

    if (searchTerm) {
      filtered = filtered.filter(
        (k) =>
          k.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((k) => k.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((k) => k.status === selectedStatus);
    }

    return filtered;
  }, [kegiatan, searchTerm, selectedCategory, selectedStatus]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredKegiatan,
  };
};

// Components
const StatusDropdown = ({ currentStatus, eventId, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = Object.entries(STATUS_CONFIG);
  const currentStatusConfig =
    STATUS_CONFIG[currentStatus] || STATUS_CONFIG.draft;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    if (
      !confirm(
        CONFIRMATION_MESSAGES[newStatus] ||
          "Apakah Anda yakin ingin mengubah status?"
      )
    ) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await customAPI.put(`/events/${eventId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        onStatusUpdate(eventId, newStatus);
        setIsOpen(false);
        alert(SUCCESS_MESSAGES[newStatus] || "Status berhasil diubah!");
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengubah status kegiatan";
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
          placeholder="Cari kegiatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat === "all" ? "Semua Kategori" : cat}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status === "all"
              ? "Semua Status"
              : STATUS_CONFIG[status]?.label || status}
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

const KegiatanTable = ({
  filteredKegiatan,
  loading,
  onEdit,
  onDelete,
  onViewParticipants,
  onStatusUpdate,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Memuat data kegiatan...</span>
        </div>
      </div>
    );
  }

  if (filteredKegiatan.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Tidak ada kegiatan ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            Coba ubah filter pencarian atau tambah kegiatan baru
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
                Kegiatan
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Tanggal & Waktu
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Peserta
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredKegiatan.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="relative w-20 h-24 mr-4 bg-gradient-to-br from-green-600 to-green-700 rounded-lg overflow-hidden shadow-lg">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative p-2 text-white text-center h-full flex flex-col justify-between">
                        <div className="text-xs font-bold leading-tight line-clamp-2">
                          {item.title}
                        </div>
                        <div>
                          <div className="text-xs opacity-80">
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                          <div className="text-xs opacity-80">
                            {new Date(item.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
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
                          oleh {item.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {item.registeredCount || 0} / {item.maxParticipants || 0}
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          item.maxParticipants > 0
                            ? Math.min(
                                ((item.registeredCount || 0) /
                                  item.maxParticipants) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.maxParticipants > 0
                      ? Math.round(
                          ((item.registeredCount || 0) / item.maxParticipants) *
                            100
                        )
                      : 0}
                    % terisi
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusDropdown
                    currentStatus={item.status || "draft"}
                    eventId={item._id}
                    onStatusUpdate={onStatusUpdate}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    Rp {(item.budget || 0).toLocaleString("id-ID")}
                  </div>
                  {item.actualCost > 0 && item.budget > 0 && (
                    <>
                      <div className="text-xs text-gray-500">
                        Terpakai: Rp {item.actualCost.toLocaleString("id-ID")}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{
                            width: `${Math.min(
                              (item.actualCost / item.budget) * 100,
                              100
                            )}%`,
                          }}></div>
                      </div>
                    </>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewParticipants(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                      title="Lihat Peserta">
                      <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
function KegiatanManagement() {
  const { kegiatan, loading, stats, fetchEvents, updateEventStatus } =
    useKegiatanData();
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredKegiatan,
  } = useFilters(kegiatan);

  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveKegiatan = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEditKegiatan = useCallback((kegiatan) => {
    setEditingKegiatan(kegiatan);
    setIsFormOpen(true);
  }, []);

  const handleDeleteKegiatan = useCallback(
    async (id) => {
      if (confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
        try {
          await customAPI.delete(`/events/${id}`);
          fetchEvents();
        } catch (error) {
          alert(
            "Gagal menghapus kegiatan: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    },
    [fetchEvents]
  );

  const handleViewParticipants = useCallback((kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setIsParticipantsOpen(true);
  }, []);

  const handleUpdateParticipantStatus = useCallback(
    async (participantId, status) => {
      if (!selectedKegiatan) return;

      try {
        await customAPI.put(
          `/events/${selectedKegiatan._id}/participants/${participantId}`,
          { status }
        );

        const updatedKegiatan = {
          ...selectedKegiatan,
          participants:
            selectedKegiatan.participants?.map((p) =>
              p._id === participantId ? { ...p, status } : p
            ) || [],
        };

        setSelectedKegiatan(updatedKegiatan);
      } catch (error) {
        alert(
          "Gagal mengupdate status peserta: " +
            (error.response?.data?.message || error.message)
        );
      }
    },
    [selectedKegiatan]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Kegiatan
              </h1>
              <p className="text-gray-600">
                Kelola kegiatan masjid dengan mudah
              </p>
            </div>
            <button
              onClick={() => {
                setEditingKegiatan(null);
                setIsFormOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Tambah Kegiatan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Kegiatan"
            value={stats.totalKegiatan}
            icon={Calendar}
            color="border-blue-500"
            loading={loading}
          />
          <StatsCard
            title="Kegiatan Aktif"
            value={stats.kegiatanAktif}
            icon={CheckCircle}
            color="border-purple-500"
            loading={loading}
          />
          <StatsCard
            title="Total Peserta"
            value={stats.totalPeserta}
            icon={Users}
            color="border-green-500"
            loading={loading}
          />
          <StatsCard
            title="Total Budget"
            value={
              loading
                ? "..."
                : `Rp ${stats.totalBudget.toLocaleString("id-ID")}`
            }
            icon={BarChart3}
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
        <KegiatanTable
          filteredKegiatan={filteredKegiatan}
          loading={loading}
          onEdit={handleEditKegiatan}
          onDelete={handleDeleteKegiatan}
          onViewParticipants={handleViewParticipants}
          onStatusUpdate={updateEventStatus}
        />
      </div>

      {/* Modals */}
      <KegiatanForm
        kegiatan={editingKegiatan}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingKegiatan(null);
        }}
        onSave={handleSaveKegiatan}
      />

      <ParticipantsModal
        kegiatan={selectedKegiatan}
        isOpen={isParticipantsOpen}
        onClose={() => {
          setIsParticipantsOpen(false);
          setSelectedKegiatan(null);
        }}
        onUpdateStatus={handleUpdateParticipantStatus}
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

export default KegiatanManagement;
