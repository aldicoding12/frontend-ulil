/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import customAPI from "../../api";
import {
  Search,
  Eye,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  X,
  CheckCircle,
  Loader2,
  MessageSquare,
  TrendingUp,
  User,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Filter,
  ExternalLink,
} from "lucide-react";

// Constants
const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
  unread: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Belum Dibaca",
    icon: Mail,
    dot: "bg-red-500",
  },
  read: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Sudah Dibaca",
    icon: MailOpen,
    dot: "bg-blue-500",
  },
  archived: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: "Diarsipkan",
    icon: Archive,
    dot: "bg-gray-500",
  },
};

const PRIORITY_CONFIG = {
  urgent: { color: "bg-red-500", label: "Mendesak", ring: "ring-red-200" },
  high: { color: "bg-orange-500", label: "Tinggi", ring: "ring-orange-200" },
  normal: { color: "bg-blue-500", label: "Normal", ring: "ring-blue-200" },
  low: { color: "bg-green-500", label: "Rendah", ring: "ring-green-200" },
};

const CATEGORY_LABELS = {
  general: "Umum",
  complaint: "Keluhan",
  suggestion: "Saran",
  question: "Pertanyaan",
  volunteer: "Volunteer",
  donation: "Donasi",
  event: "Kegiatan",
  other: "Lainnya",
};

function KontakManagement() {
  // Main state
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
    search: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0,
  });

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // API calls
  const fetchContacts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          ...(filters.status !== "all" && { status: filters.status }),
          ...(filters.category !== "all" && { category: filters.category }),
          ...(filters.priority !== "all" && { priority: filters.priority }),
          ...(filters.search && { search: filters.search }),
        });

        const response = await customAPI.get(`/contact?${params}`);

        if (response.data.success) {
          setContacts(response.data.data);
          setPagination((prev) => ({
            ...prev,
            current: response.data.pagination.current,
            total: response.data.pagination.total,
            totalRecords: response.data.pagination.totalRecords,
          }));
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const fetchContactDetail = useCallback(async (id) => {
    try {
      const response = await customAPI.get(`/contact/${id}`);
      if (response.data.success) {
        setSelectedContact(response.data.data);
        setContacts((prev) =>
          prev.map((contact) =>
            contact._id === id
              ? { ...contact, status: response.data.data.status }
              : contact
          )
        );
      }
    } catch (error) {
      console.error("Error fetching contact detail:", error);
    }
  }, []);

  // Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  }, []);

  const handleViewDetail = useCallback(
    (contact) => {
      setSelectedContact(contact);
      fetchContactDetail(contact._id);
      setShowDetailModal(true);
    },
    [fetchContactDetail]
  );

  const handleStatusUpdate = useCallback(
    async (contactId, newStatus, adminNotes = "") => {
      try {
        setActionLoading((prev) => ({ ...prev, [contactId]: true }));

        const response = await customAPI.put(`/contact/${contactId}/status`, {
          status: newStatus,
          adminNotes,
        });

        if (response.data.success) {
          setContacts((prev) =>
            prev.map((contact) =>
              contact._id === contactId
                ? { ...contact, status: newStatus, adminNotes }
                : contact
            )
          );

          if (selectedContact?._id === contactId) {
            setSelectedContact((prev) => ({
              ...prev,
              status: newStatus,
              adminNotes,
            }));
          }

          // Show success notification
          const successMsg =
            newStatus === "archived"
              ? "Pesan berhasil diarsipkan"
              : "Status berhasil diperbarui";
          alert(`✅ ${successMsg}`);
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("❌ Gagal mengupdate status. Silakan coba lagi.");
      } finally {
        setActionLoading((prev) => ({ ...prev, [contactId]: false }));
      }
    },
    [selectedContact]
  );

  const handleDelete = useCallback(
    async (contactId) => {
      if (
        !confirm(
          "Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
        )
      )
        return;

      try {
        setActionLoading((prev) => ({ ...prev, [contactId]: true }));

        const response = await customAPI.delete(`/contact/${contactId}`);

        if (response.data.success) {
          setContacts((prev) =>
            prev.filter((contact) => contact._id !== contactId)
          );
          alert("✅ Pesan berhasil dihapus");

          if (selectedContact?._id === contactId) {
            setSelectedContact(null);
            setShowDetailModal(false);
          }
        }
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("❌ Gagal menghapus pesan. Silakan coba lagi.");
      } finally {
        setActionLoading((prev) => ({ ...prev, [contactId]: false }));
      }
    },
    [selectedContact]
  );

  // Helper functions
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getTimeAgo = useCallback(
    (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "Baru saja";
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      return formatDate(dateString);
    },
    [formatDate]
  );

  // Effects
  useEffect(() => {
    fetchContacts(1);
  }, [fetchContacts]);

  useEffect(() => {
    if (pagination.current > 1) {
      fetchContacts(pagination.current);
    }
  }, [pagination.current, fetchContacts]);

  // Render components
  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.unread;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const PriorityIndicator = ({ priority }) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs font-medium text-gray-600 capitalize">
          {config.label}
        </span>
      </div>
    );
  };

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    textColor,
    trend,
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
            {trend && (
              <span className="text-xs text-green-600 font-semibold">
                +{trend}%
              </span>
            )}
          </div>
        </div>
        <div className={`${bgColor} p-4 rounded-xl shadow-sm`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Manajemen Kontak
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Kelola pesan dan feedback dari jamaah dengan mudah
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchContacts(pagination.current)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md">
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md">
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Pesan"
            value={stats.total}
            icon={MessageSquare}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
            trend={12}
          />
          <StatsCard
            title="Hari Ini"
            value={stats.today}
            icon={TrendingUp}
            bgColor="bg-green-100"
            textColor="text-green-600"
            trend={8}
          />
          <StatsCard
            title="Belum Dibaca"
            value={stats.byStatus?.unread}
            icon={Mail}
            bgColor="bg-red-100"
            textColor="text-red-600"
          />
          <StatsCard
            title="Diarsipkan"
            value={stats.byStatus?.archived}
            icon={Archive}
            bgColor="bg-purple-100"
            textColor="text-purple-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Filter Pesan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Pesan
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Cari nama, email, atau pesan..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="all">Semua Status</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
                <option value="archived">Diarsipkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="all">Semua Kategori</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritas
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="all">Semua Prioritas</option>
                <option value="urgent">Mendesak</option>
                <option value="high">Tinggi</option>
                <option value="normal">Normal</option>
                <option value="low">Rendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  Memuat data...
                </p>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-3">
                Tidak ada pesan ditemukan
              </h3>
              <p className="text-gray-500 text-lg">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Pengirim
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Subjek
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Kategori
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Tanggal
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr
                        key={contact._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <PriorityIndicator priority={contact.priority} />
                            <div>
                              <div className="font-medium text-gray-900">
                                {contact.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {contact.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 truncate max-w-xs">
                            {contact.subject}
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {contact.message}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {CATEGORY_LABELS[contact.category] || "Umum"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={contact.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(contact.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTimeAgo(contact.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(contact)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Lihat Detail">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(contact._id, "archived")
                              }
                              disabled={actionLoading[contact._id]}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Arsipkan">
                              {actionLoading[contact._id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(contact._id)}
                              disabled={actionLoading[contact._id]}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Hapus">
                              {actionLoading[contact._id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan{" "}
                    <span className="font-semibold text-gray-900">
                      {(pagination.current - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(
                        pagination.current * ITEMS_PER_PAGE,
                        pagination.totalRecords
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-gray-900">
                      {pagination.totalRecords}
                    </span>{" "}
                    pesan
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      {pagination.current}
                    </span>
                    <span className="text-gray-600 text-sm">
                      dari {pagination.total}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.total}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Detail Pesan
                </h2>
                <p className="text-gray-600 mt-1">
                  Informasi lengkap pesan masuk
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {selectedContact.subject}
                      </h3>
                      <StatusBadge status={selectedContact.status} />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedContact.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedContact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedContact.createdAt)}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Isi Pesan:
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Informasi Detail
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="mt-1">
                          <StatusBadge status={selectedContact.status} />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Kategori:</span>
                        <span className="ml-2 text-sm font-medium">
                          {CATEGORY_LABELS[selectedContact.category] || "Umum"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Prioritas:
                        </span>
                        <div className="mt-1">
                          <PriorityIndicator
                            priority={selectedContact.priority}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Waktu Diterima:
                        </span>
                        <p className="text-sm text-gray-700 mt-1">
                          {getTimeAgo(selectedContact.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedContact._id, "archived")
                      }
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Archive className="w-4 h-4" />
                      Arsipkan Pesan
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(selectedContact._id);
                        setShowDetailModal(false);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Hapus Pesan
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`,
                          "_blank"
                        )
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Buka Email Client
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => fetchContacts(pagination.current)}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Refresh Data">
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Scroll ke Atas">
            <ChevronLeft className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth animations */
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Table hover effects */
        tbody tr:hover {
          background-color: #f8fafc;
        }

        /* Status indicator animations */
        .status-indicator {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Enhanced focus states */
        input:focus,
        select:focus,
        button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        /* Smooth transitions for all interactive elements */
        .transition-colors {
          transition-property: background-color, border-color, color, fill,
            stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Enhanced shadow effects */
        .shadow-enhanced {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Button hover effects */
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        /* Improved accessibility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Loading state enhancement */
        .loading-shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Modal backdrop enhancement */
        .modal-backdrop {
          backdrop-filter: blur(4px);
          background-color: rgba(0, 0, 0, 0.6);
        }

        /* Floating button animations */
        .floating-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .floating-btn:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Improved text truncation */
        .truncate-multiline {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced border radius for modern look */
        .rounded-modern {
          border-radius: 12px;
        }

        /* Gradient backgrounds for stats cards */
        .stats-gradient {
          background: linear-gradient(
            135deg,
            var(--tw-gradient-from),
            var(--tw-gradient-to)
          );
        }

        /* Improved table styling */
        .table-modern {
          border-collapse: separate;
          border-spacing: 0;
        }

        .table-modern th:first-child {
          border-top-left-radius: 8px;
        }

        .table-modern th:last-child {
          border-top-right-radius: 8px;
        }

        /* Priority indicator pulse effect */
        .priority-urgent {
          animation: urgent-pulse 1.5s ease-in-out infinite;
        }

        @keyframes urgent-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        /* Notification styles */
        .notification-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .notification-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}

export default KontakManagement;
