/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import customAPI from "../../api"; // Import custom API
import {
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Phone,
  Building,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  History,
  X,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";

function InventarisView() {
  const [activeTab, setActiveTab] = useState("browse");
  const [items, setItems] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("081234567890"); // Ini bisa dari user context
  const [isVisible, setIsVisible] = useState(false);

  // Pagination
  const itemsPerPage = 8;

  const [borrowForm, setBorrowForm] = useState({
    borrowerName: "",
    phoneNumber: "081234567890",
    institution: "",
    borrowDate: "",
    returnDate: "",
    documentUrl: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === "browse") {
      fetchAvailableItems();
    } else if (activeTab === "history") {
      fetchBorrowingHistory();
    }
  }, [activeTab, currentPage, searchTerm]);

  useEffect(() => {
    // Animation trigger
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Fetch all items from API
  const fetchAvailableItems = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.itemName = searchTerm;
      }

      const response = await customAPI.get("/inventory", { params });

      if (response.data.message === "Berhasil menampilkan inventaris") {
        // Add calculated available quantity for each item
        const itemsWithAvailability = response.data.data.map((item) => ({
          ...item,
          // Calculate currentlyAvailable if not present
          currentlyAvailable:
            item.currentlyAvailable !== undefined
              ? item.currentlyAvailable
              : calculateAvailableQuantity(item),
        }));

        setItems(itemsWithAvailability || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
      } else {
        console.error("Unexpected API response:", response.data);
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);

      // Handle different error cases
      if (error.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (
        error.response?.status === 404 &&
        error.response?.data?.message === "Halaman tidak tersedia"
      ) {
        // If page doesn't exist, go back to page 1
        if (currentPage > 1) {
          setCurrentPage(1);
          return;
        }
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Gagal memuat data inventaris";
        alert(`Error: ${errorMessage}`);
      }

      setItems([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate available quantity based on borrowings
  const calculateAvailableQuantity = (item) => {
    if (!item.borrowings || !Array.isArray(item.borrowings)) {
      return item.quantity || 0;
    }

    // Count approved borrowings (items currently being borrowed)
    const borrowedCount = item.borrowings.filter(
      (borrowing) => borrowing.status === "approved"
    ).length;

    return Math.max(0, (item.quantity || 0) - borrowedCount);
  };

  // Fetch borrowing history from API
  const fetchBorrowingHistory = async () => {
    setLoading(true);
    try {
      const response = await customAPI.get(
        `/inventory/users/${phoneNumber}/history`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        }
      );

      if (response.data.message === "Berhasil menampilkan riwayat peminjaman") {
        setBorrowingHistory(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
      } else {
        console.error("Unexpected API response:", response.data);
        setBorrowingHistory([]);
      }
    } catch (error) {
      console.error("Error fetching borrowing history:", error);

      if (error.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Gagal memuat riwayat peminjaman";
        alert(`Error: ${errorMessage}`);
      }

      setBorrowingHistory([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!borrowForm.borrowerName.trim()) {
      newErrors.borrowerName = "Nama peminjam wajib diisi";
    }

    if (!borrowForm.phoneNumber.trim()) {
      newErrors.phoneNumber = "Nomor HP wajib diisi";
    } else if (!/^[0-9+\-\s]+$/.test(borrowForm.phoneNumber)) {
      newErrors.phoneNumber = "Format nomor HP tidak valid";
    }

    if (!borrowForm.borrowDate) {
      newErrors.borrowDate = "Tanggal pinjam wajib diisi";
    }

    if (!borrowForm.returnDate) {
      newErrors.returnDate = "Tanggal kembali wajib diisi";
    } else if (
      new Date(borrowForm.returnDate) <= new Date(borrowForm.borrowDate)
    ) {
      newErrors.returnDate = "Tanggal kembali harus setelah tanggal pinjam";
    }

    if (!borrowForm.documentUrl.trim()) {
      newErrors.documentUrl = "URL dokumen wajib diisi";
    } else if (!/^https?:\/\/.+/.test(borrowForm.documentUrl)) {
      newErrors.documentUrl = "URL tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit borrowing request to API
  const handleBorrowSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const borrowingData = {
        borrowerName: borrowForm.borrowerName.trim(),
        phoneNumber: borrowForm.phoneNumber.trim(),
        institution: borrowForm.institution.trim() || undefined,
        borrowDate: borrowForm.borrowDate,
        returnDate: borrowForm.returnDate,
        documentUrl: borrowForm.documentUrl.trim(),
        notes: borrowForm.notes.trim() || undefined,
      };

      const response = await customAPI.post(
        `/inventory/items/${selectedItem._id}/borrow`,
        borrowingData
      );

      if (response.data.message === "Permintaan peminjaman berhasil diajukan") {
        alert(
          "Permintaan peminjaman berhasil diajukan! Silakan tunggu konfirmasi dari admin."
        );

        // Reset form
        setBorrowForm({
          borrowerName: "",
          phoneNumber: phoneNumber,
          institution: "",
          borrowDate: "",
          returnDate: "",
          documentUrl: "",
          notes: "",
        });
        setErrors({});
        setShowBorrowModal(false);

        // Refresh data
        await fetchAvailableItems();
      } else {
        throw new Error(response.data.message || "Gagal mengajukan permintaan");
      }
    } catch (error) {
      console.error("Error submitting borrow request:", error);

      let errorMessage = "Gagal mengajukan permintaan peminjaman";

      if (error.response?.status === 400) {
        errorMessage =
          error.response.data.message || "Data yang dimasukkan tidak valid";
      } else if (error.response?.status === 404) {
        errorMessage = "Barang tidak ditemukan";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get item details from API
  const fetchItemDetails = async (itemId) => {
    try {
      const response = await customAPI.get(`/inventory/items/${itemId}`);

      if (response.data.message === "Berhasil menampilkan barang") {
        return response.data.data;
      } else {
        throw new Error("Gagal mengambil detail barang");
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      alert("Gagal memuat detail barang");
      return null;
    }
  };

  const openBorrowModal = (item) => {
    // Check if item can be borrowed
    if (!item.isLendable) {
      alert("Maaf, barang ini tidak dapat dipinjam.");
      return;
    }

    if (item.currentlyAvailable <= 0) {
      alert(
        "Maaf, barang ini sedang tidak tersedia (semua unit sedang dipinjam)."
      );
      return;
    }

    setSelectedItem(item);
    setBorrowForm({
      ...borrowForm,
      borrowerName: "",
      institution: "",
      borrowDate: "",
      returnDate: "",
      documentUrl: "",
      notes: "",
    });
    setErrors({});
    setShowBorrowModal(true);
  };

  const openDetailModal = async (item) => {
    // Fetch full details if needed
    const detailItem = await fetchItemDetails(item._id);
    if (detailItem) {
      setSelectedItem(detailItem);
      setShowDetailModal(true);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        text: "⏳ Menunggu Persetujuan",
        description: "Permintaan sedang diproses admin",
      },
      approved: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        text: "✅ Disetujui - Sedang Dipinjam",
        description: "Barang sedang Anda pinjam",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        text: "❌ Permintaan Ditolak",
        description: "Permintaan tidak dapat disetujui",
      },
      returned: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        text: "🔄 Sudah Dikembalikan",
        description: "Peminjaman selesai",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className="flex flex-col items-end">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${config.color}`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.text}
        </span>
        <span className="text-xs text-gray-500 mt-1 text-right">
          {config.description}
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get current items for pagination (for display only)
  const getCurrentItems = () => {
    return items; // API already handles pagination
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (activeTab === "browse") {
        setCurrentPage(1); // Reset to first page on search
        fetchAvailableItems();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="w-full h-48 bg-gray-300"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-md hover:shadow-lg"
          }`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              currentPage === page
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-md hover:shadow-lg"
            }`}>
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-md hover:shadow-lg"
          }`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  const currentItems = getCurrentItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-spin"
            style={{ animationDuration: "20s" }}
          />
          <div
            className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-spin"
            style={{ animationDuration: "15s", animationDirection: "reverse" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1
            className={`text-5xl md:text-6xl font-bold text-white mb-6 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}>
            📦 INVENTARIS
            <span className="block text-green-200 mt-2 relative">
              MASJID
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full mt-2"></div>
            </span>
          </h1>

          <p
            className={`text-xl text-green-100 mb-8 transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}>
            Kelola peminjaman barang inventaris Masjid Ulil Albab dengan mudah
          </p>

          {/* Tab Navigation */}
          <div
            className={`flex justify-center space-x-4 mb-8 transform transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}>
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "browse"
                  ? "bg-white text-green-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}>
              <Package className="w-5 h-5 inline mr-2" />
              Lihat Barang
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-white text-green-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}>
              <History className="w-5 h-5 inline mr-2" />
              Riwayat Peminjaman
            </button>
          </div>

          {/* Search Bar - Only show in browse tab */}
          {activeTab === "browse" && (
            <div
              className={`max-w-md mx-auto transform transition-all duration-1000 delay-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari barang inventaris..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-6 h-6 text-white/70" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Browse Items Tab */}
        {activeTab === "browse" && (
          <div>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Results Info */}
                <div className="mb-8 text-center">
                  {searchTerm ? (
                    <p className="text-gray-600">
                      Menampilkan {totalItems} hasil untuk "
                      <span className="font-semibold text-green-600">
                        {searchTerm}
                      </span>
                      "
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        Menampilkan {currentItems.length} dari {totalItems}{" "}
                        barang inventaris
                      </p>
                      <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                        <span>
                          Halaman {currentPage} dari {totalPages}
                        </span>
                        {totalPages > 1 && (
                          <>
                            <span>•</span>
                            <span>{itemsPerPage} barang per halaman</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {currentItems.map((item, index) => (
                    <div
                      key={item._id}
                      className={`group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 ${
                        isVisible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-10 opacity-0"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}>
                      {/* Image Container */}
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={
                            item.imageUrl ||
                            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
                          }
                          alt={item.itemName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400";
                          }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Condition Badge */}
                        <div
                          className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
                            item.condition === "good"
                              ? "bg-green-500 text-white"
                              : item.condition === "needs_repair"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-500 text-white"
                          }`}>
                          {item.condition === "good"
                            ? "✓ Baik"
                            : item.condition === "needs_repair"
                            ? "⚠ Perlu Perbaikan"
                            : "✗ Rusak"}
                        </div>

                        {/* Available Badge */}
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                          📊 {item.currentlyAvailable}/{item.quantity}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                          {item.itemName}
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {item.description || "Tidak ada deskripsi"}
                        </p>

                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Status: </span>
                          <span
                            className={
                              !item.isLendable
                                ? "text-red-600"
                                : item.currentlyAvailable > 0
                                ? "text-green-600"
                                : "text-orange-600"
                            }>
                            {!item.isLendable
                              ? "Tidak dapat dipinjam"
                              : item.currentlyAvailable > 0
                              ? `${item.currentlyAvailable} unit tersedia`
                              : "Sedang dipinjam semua"}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => openDetailModal(item)}
                            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300">
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </button>
                          <button
                            onClick={() => openBorrowModal(item)}
                            disabled={
                              item.currentlyAvailable <= 0 || !item.isLendable
                            }
                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              item.currentlyAvailable > 0 && item.isLendable
                                ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}>
                            <Plus className="w-4 h-4 mr-1" />
                            {!item.isLendable
                              ? "Tidak Dipinjamkan"
                              : item.currentlyAvailable <= 0
                              ? "Tidak Tersedia"
                              : "Pinjam"}
                          </button>
                        </div>
                      </div>

                      {/* Bottom Highlight */}
                      <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination />

                {/* Empty State */}
                {items.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-2">
                      {searchTerm
                        ? "Barang tidak ditemukan"
                        : "Belum ada inventaris"}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Coba kata kunci lain untuk mencari barang"
                        : "Inventaris akan segera ditambahkan oleh admin"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                📋 Riwayat Peminjaman
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Nomor HP: {phoneNumber}
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
                  <p className="text-gray-500">Memuat riwayat peminjaman...</p>
                </div>
              ) : borrowingHistory.length > 0 ? (
                borrowingHistory.map((history, index) => (
                  <div
                    key={history._id}
                    className={`p-6 hover:bg-gray-50 transition-all duration-300 ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}>
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={
                            history.itemImage ||
                            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
                          }
                          alt={history.itemName}
                          className="w-20 h-20 rounded-xl object-cover shadow-md"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400";
                          }}
                        />
                        <div className="absolute -top-2 -right-2">
                          {getStatusBadge(history.status)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {history.itemName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              📅 Dipinjam: {formatDate(history.borrowDate)} -{" "}
                              {formatDate(history.returnDate)}
                            </p>
                            {history.actualReturnDate && (
                              <p className="text-sm text-green-600 mt-1">
                                ✅ Dikembalikan:{" "}
                                {formatDate(history.actualReturnDate)}
                              </p>
                            )}
                            {history.rejectionReason && (
                              <p className="text-sm text-red-600 mt-1">
                                ❌ Alasan ditolak: {history.rejectionReason}
                              </p>
                            )}
                            {history.institution && (
                              <p className="text-sm text-gray-500 mt-1">
                                🏢 Instansi: {history.institution}
                              </p>
                            )}
                            {history.notes && (
                              <p className="text-sm text-gray-500 mt-1">
                                📝 Catatan: {history.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    Belum ada riwayat peminjaman
                  </h3>
                  <p className="text-gray-500">
                    Riwayat peminjaman akan muncul di sini setelah Anda meminjam
                    barang
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for history */}
            {activeTab === "history" && totalPages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <Pagination />
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {/* Borrow Modal */}
        {showBorrowModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    📝 Ajukan Peminjaman
                  </h2>
                  <button
                    onClick={() => setShowBorrowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        selectedItem.imageUrl ||
                        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
                      }
                      alt={selectedItem.itemName}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400";
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedItem.itemName}
                      </h3>
                      <p className="text-sm text-green-600">
                        📊 Tersedia: {selectedItem.currentlyAvailable} unit
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Nama Peminjam *
                    </label>
                    <input
                      type="text"
                      required
                      value={borrowForm.borrowerName}
                      onChange={(e) => {
                        setBorrowForm({
                          ...borrowForm,
                          borrowerName: e.target.value,
                        });
                        if (errors.borrowerName) {
                          setErrors({ ...errors, borrowerName: null });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.borrowerName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.borrowerName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.borrowerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Nomor HP *
                    </label>
                    <input
                      type="tel"
                      required
                      value={borrowForm.phoneNumber}
                      onChange={(e) => {
                        setBorrowForm({
                          ...borrowForm,
                          phoneNumber: e.target.value,
                        });
                        if (errors.phoneNumber) {
                          setErrors({ ...errors, phoneNumber: null });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.phoneNumber
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="w-4 h-4 inline mr-1" />
                      Instansi/Organisasi
                    </label>
                    <input
                      type="text"
                      value={borrowForm.institution}
                      onChange={(e) =>
                        setBorrowForm({
                          ...borrowForm,
                          institution: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Nama instansi (opsional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Tanggal Pinjam *
                      </label>
                      <input
                        type="date"
                        required
                        value={borrowForm.borrowDate}
                        min={new Date().toISOString().split("T")[0]} // Minimum today
                        onChange={(e) => {
                          setBorrowForm({
                            ...borrowForm,
                            borrowDate: e.target.value,
                          });
                          if (errors.borrowDate) {
                            setErrors({ ...errors, borrowDate: null });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.borrowDate
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.borrowDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.borrowDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Tanggal Kembali *
                      </label>
                      <input
                        type="date"
                        required
                        value={borrowForm.returnDate}
                        min={
                          borrowForm.borrowDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) => {
                          setBorrowForm({
                            ...borrowForm,
                            returnDate: e.target.value,
                          });
                          if (errors.returnDate) {
                            setErrors({ ...errors, returnDate: null });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.returnDate
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.returnDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.returnDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-4 h-4 inline mr-1" />
                      URL Dokumen/Surat *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={borrowForm.documentUrl}
                      onChange={(e) => {
                        setBorrowForm({
                          ...borrowForm,
                          documentUrl: e.target.value,
                        });
                        if (errors.documentUrl) {
                          setErrors({ ...errors, documentUrl: null });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.documentUrl
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.documentUrl && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.documentUrl}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      📎 Upload surat peminjaman ke Google Drive dan paste
                      linknya
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      💬 Catatan
                    </label>
                    <textarea
                      rows={3}
                      value={borrowForm.notes}
                      onChange={(e) =>
                        setBorrowForm({ ...borrowForm, notes: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-amber-800 font-medium mb-1">
                          ⚠️ Perhatian:
                        </p>
                        <ul className="text-amber-700 space-y-1">
                          <li>• Pastikan semua data yang dimasukkan benar</li>
                          <li>• Permintaan akan diproses oleh admin</li>
                          <li>
                            • Anda akan dihubungi melalui nomor HP yang
                            didaftarkan
                          </li>
                          <li>
                            • Kembalikan barang sesuai tanggal yang dijanjikan
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBorrowModal(false)}
                      disabled={loading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50">
                      ❌ Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleBorrowSubmit}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg">
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "📤 Ajukan Peminjaman"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    🔍 Detail Barang
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden mb-6">
                  <img
                    src={
                      selectedItem.imageUrl ||
                      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
                    }
                    alt={selectedItem.itemName}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400";
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                        selectedItem.condition === "good"
                          ? "bg-green-500 text-white"
                          : selectedItem.condition === "needs_repair"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }`}>
                      {selectedItem.condition === "good"
                        ? "✓ Kondisi Baik"
                        : selectedItem.condition === "needs_repair"
                        ? "⚠ Perlu Perbaikan"
                        : "✗ Rusak"}
                    </span>
                  </div>

                  {/* Lendable Status */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                        selectedItem.isLendable
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}>
                      {selectedItem.isLendable
                        ? "📤 Dapat Dipinjam"
                        : "🚫 Tidak Dapat Dipinjam"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedItem.itemName}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedItem.quantity || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Unit</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          (selectedItem.currentlyAvailable || 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                        {selectedItem.currentlyAvailable || 0}
                      </div>
                      <div className="text-sm text-gray-500">Tersedia</div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">
                      📊 Status Barang:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kondisi:</span>
                        <span
                          className={`font-medium ${
                            selectedItem.condition === "good"
                              ? "text-green-600"
                              : selectedItem.condition === "needs_repair"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}>
                          {selectedItem.condition === "good"
                            ? "✓ Baik"
                            : selectedItem.condition === "needs_repair"
                            ? "⚠ Perlu Perbaikan"
                            : "✗ Rusak"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Status Peminjaman:
                        </span>
                        <span
                          className={`font-medium ${
                            selectedItem.isLendable
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                          {selectedItem.isLendable
                            ? "📤 Dapat Dipinjam"
                            : "🚫 Tidak Dapat Dipinjam"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ketersediaan:</span>
                        <span
                          className={`font-medium ${
                            (selectedItem.currentlyAvailable || 0) > 0
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}>
                          {(selectedItem.currentlyAvailable || 0) > 0
                            ? `${selectedItem.currentlyAvailable} unit tersedia`
                            : "Sedang dipinjam semua"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.description && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">
                        📝 Deskripsi:
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">
                      ℹ️ Informasi Tambahan:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>
                        • Status peminjaman:{" "}
                        {selectedItem.isLendable
                          ? "Tersedia"
                          : "Tidak tersedia"}
                      </p>
                      <p>
                        • Kondisi:{" "}
                        {selectedItem.condition === "good"
                          ? "Baik"
                          : selectedItem.condition === "needs_repair"
                          ? "Perlu perbaikan"
                          : "Rusak"}
                      </p>
                      {selectedItem.createdAt && (
                        <p>
                          • Ditambahkan: {formatDate(selectedItem.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300">
                    🔙 Tutup
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openBorrowModal(selectedItem);
                    }}
                    disabled={
                      (selectedItem.currentlyAvailable || 0) <= 0 ||
                      !selectedItem.isLendable
                    }
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
                      (selectedItem.currentlyAvailable || 0) > 0 &&
                      selectedItem.isLendable
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}>
                    {(selectedItem.currentlyAvailable || 0) > 0 &&
                    selectedItem.isLendable
                      ? "📤 Pinjam Barang"
                      : "❌ Tidak Tersedia"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 z-50">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      {/* Custom CSS */}
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

export default InventarisView;
