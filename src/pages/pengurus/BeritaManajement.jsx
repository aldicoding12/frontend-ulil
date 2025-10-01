import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";

import customAPI from "../../api";
import NewsModal from "../../components/admin/componens/NewsComponents/NewsModal ";
import NewsViewModal from "../../components/admin/componens/NewsComponents/NewsViewModal ";

function NewsManagement() {
  // State untuk data
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  // State untuk filtering dan pagination
  const [filters, setFilters] = useState({
    status: "all",
    author: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 10,
    totalRecords: 0,
  });

  // State untuk modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [viewingNews, setViewingNews] = useState(null);

  // State untuk actions
  const [actionLoading, setActionLoading] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Get all news
  const getNews = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.author !== "all" && { author: filters.author }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await customAPI.get(`/news?${params}`);

      if (response.data.success) {
        setNews(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          current: response.data.pagination?.current || 1,
          total: response.data.pagination?.total || 1,
          totalRecords:
            response.data.pagination?.totalRecords ||
            response.data.data?.length ||
            0,
        }));
        setStats(response.data.stats || {});
      } else {
        // Fallback untuk struktur response lama
        setNews(response.data.data || []);
        const totalNews = response.data.data?.length || 0;
        setPagination((prev) => ({
          ...prev,
          current: 1,
          total: Math.ceil(totalNews / pagination.limit),
          totalRecords: totalNews,
        }));

        // Generate stats dari data
        const newsData = response.data.data || [];
        const today = new Date().toDateString();
        const todayNews = newsData.filter(
          (item) => new Date(item.createdAt).toDateString() === today
        ).length;

        setStats({
          total: newsData.length,
          today: todayNews,
          published: newsData.filter((item) => item.status === "published")
            .length,
          draft: newsData.filter((item) => item.status === "draft").length,
        });
      }
    } catch (error) {
      alert(
        "Gagal memuat berita: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews(1);
  }, [filters]);

  useEffect(() => {
    if (pagination.current > 1) {
      getNews(pagination.current);
    }
  }, [pagination.current]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (editingNews) {
        // Update existing news
        const { data } = await customAPI.put(
          `/news/${editingNews._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setNews((prevNews) =>
          prevNews.map((item) =>
            item._id === editingNews._id ? data.data : item
          )
        );
        alert("Berita berhasil diperbarui!");
      } else {
        // Create new news
        const { data } = await customAPI.post("/news", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setNews((prevNews) => [data.data, ...prevNews]);
        alert("Berita berhasil ditambahkan!");
      }

      handleCloseModal();
      getNews(pagination.current); // Refresh data
    } catch (error) {
      alert(
        "Gagal menyimpan berita: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (newsItem = null) => {
    setEditingNews(newsItem);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNews(null);
  };

  const handleEdit = (item) => {
    handleOpenModal(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus berita ini?"))
      return;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await customAPI.delete(`/news/${id}`);
      setNews((prevNews) => prevNews.filter((item) => item._id !== id));
      alert("Berita berhasil dihapus!");

      if (selectedNews && selectedNews._id === id) {
        setSelectedNews(null);
        setShowViewModal(false);
      }
    } catch (error) {
      alert(
        "Gagal menghapus berita: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleView = (item) => {
    setViewingNews(item);
    setSelectedNews(item);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingNews(null);
    setSelectedNews(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const handleRefresh = () => {
    getNews(pagination.current);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Strip HTML tags for preview
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Get unique authors for filter
  const uniqueAuthors = [
    ...new Set(news.map((item) => item.author).filter(Boolean)),
  ];

  // Filter news based on current filters
  const filteredNews = news.filter((item) => {
    const matchSearch =
      item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.author?.toLowerCase().includes(filters.search.toLowerCase()) ||
      stripHtml(item.content)
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchAuthor =
      filters.author === "all" || item.author === filters.author;

    return matchSearch && matchAuthor;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Berita
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola semua konten berita dan artikel
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Berita
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.today || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Dipublikasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.published || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.draft || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Berita
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Cari judul, penulis, atau konten..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penulis
              </label>
              <select
                value={filters.author}
                onChange={(e) => handleFilterChange("author", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="all">Semua Penulis</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Menampilkan {filteredNews.length} dari {news.length} berita
            </div>
            <button
              onClick={() => handleOpenModal()}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium">
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Plus size={20} />
              )}
              Tambah Berita
            </button>
          </div>
        </div>

        {/* News List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Memuat data...</span>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Tidak ada berita ditemukan
              </h3>
              <p className="text-gray-500">
                {filters.search || filters.author !== "all"
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : "Mulai dengan menambahkan berita baru"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Berita
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Penulis
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
                    {filteredNews.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {item.image ? (
                                <img
                                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                  src={item.image}
                                  alt={item.title}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                                style={{
                                  display: item.image ? "none" : "flex",
                                }}>
                                <ImageIcon
                                  size={24}
                                  className="text-gray-400"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 mb-1 line-clamp-2">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {stripHtml(item.content).substring(0, 120)}
                                {stripHtml(item.content).length > 120 && "..."}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <User size={16} className="mr-2 text-gray-400" />
                            <span className="font-medium">{item.author}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(item.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(item)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Lihat Detail">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              disabled={isLoading}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                              title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={actionLoading[item._id]}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                              title="Hapus">
                              {actionLoading[item._id] ? (
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
                    {(pagination.current - 1) * pagination.limit + 1} -{" "}
                    {Math.min(
                      pagination.current * pagination.limit,
                      pagination.totalRecords
                    )}{" "}
                    dari {pagination.totalRecords} berita
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

      {/* Modals */}
      <NewsModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingNews={editingNews}
        isLoading={isLoading}
      />

      <NewsViewModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        news={viewingNews}
      />

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Refresh Data">
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Lihat Statistik">
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
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

        /* Line clamp utilities */
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

export default NewsManagement;
