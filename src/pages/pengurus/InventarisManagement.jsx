/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  Package,
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Building,
  Settings,
} from "lucide-react";

import customAPI from "../../api";

function InventarisAdmin() {
  // State untuk data
  const [items, setItems] = useState([]);
  const [borrowingRequests, setBorrowingRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // State untuk filtering dan pagination
  const [filters, setFilters] = useState({
    condition: "all",
    isLendable: "all",
    search: "",
  });
  const [borrowingFilters, setBorrowingFilters] = useState({
    status: "pending",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 10,
    totalRecords: 0,
  });

  // State untuk tabs
  const [activeTab, setActiveTab] = useState("items");

  // State untuk modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBorrowersModal, setShowBorrowersModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [selectedItemBorrowers, setSelectedItemBorrowers] = useState(null);

  // State untuk actions
  const [actionLoading, setActionLoading] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form state for adding/editing items
  const [itemForm, setItemForm] = useState({
    itemName: "",
    quantity: "",
    condition: "good",
    isLendable: true,
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  // Get single item with borrowings
  const getItemWithBorrowers = async (itemId) => {
    try {
      setLoading(true);
      const response = await customAPI.get(`/inventory/items/${itemId}`);

      if (response.data.message === "Berhasil menampilkan barang") {
        setSelectedItemBorrowers(response.data.data);
        setShowBorrowersModal(true);
      }
    } catch (error) {
      console.error("Error fetching item borrowers:", error);
      alert(
        "Gagal memuat data peminjam: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };
  const getDashboardStats = async () => {
    try {
      const response = await customAPI.get("/inventory/admin");
      if (response.data.message === "Berhasil menampilkan statistik") {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Get inventory items
  const getItems = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.condition !== "all" && { condition: filters.condition }),
        ...(filters.isLendable !== "all" && { isLendable: filters.isLendable }),
        ...(filters.search && { itemName: filters.search }),
      });

      const response = await customAPI.get(`/inventory?${params}`);

      if (response.data.message === "Berhasil menampilkan inventaris") {
        setItems(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          current: response.data.currentPage || 1,
          total: response.data.totalPages || 1,
          totalRecords: response.data.totalItems || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      alert(
        "Gagal memuat inventaris: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Get borrowing requests
  const getBorrowingRequests = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status: borrowingFilters.status,
      });

      const response = await customAPI.get(
        `/inventory/borrowing-requests?${params}`
      );

      if (
        response.data.message === "Berhasil menampilkan permintaan peminjaman"
      ) {
        setBorrowingRequests(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          current: response.data.currentPage || 1,
          total: response.data.totalPages || 1,
          totalRecords: response.data.totalItems || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching borrowing requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardStats();
    if (activeTab === "items") {
      getItems(1);
    } else if (activeTab === "borrowings") {
      getBorrowingRequests(1);
    }
  }, [activeTab, filters, borrowingFilters]);

  useEffect(() => {
    if (pagination.current > 1) {
      if (activeTab === "items") {
        getItems(pagination.current);
      } else if (activeTab === "borrowings") {
        getBorrowingRequests(pagination.current);
      }
    }
  }, [pagination.current]);

  // Handle save item
  const handleSubmitItem = async () => {
    if (!validateItemForm()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("itemName", itemForm.itemName);
      formData.append("quantity", itemForm.quantity);
      formData.append("condition", itemForm.condition);
      formData.append("isLendable", itemForm.isLendable);
      formData.append("description", itemForm.description);

      if (itemForm.image) {
        formData.append("image", itemForm.image);
      }

      let response;
      if (editingItem) {
        response = await customAPI.put(
          `/inventory/${editingItem._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === editingItem._id ? response.data.data : item
          )
        );
        alert("Barang berhasil diperbarui!");
      } else {
        response = await customAPI.post("/inventory", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Barang berhasil ditambahkan!");
      }

      handleCloseItemModal();
      getItems(pagination.current);
      getDashboardStats();
    } catch (error) {
      console.error("Error saving item:", error);
      alert(
        "Gagal menyimpan barang: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus barang ini?"))
      return;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await customAPI.delete(`/inventory/${id}`);
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
      alert("Barang berhasil dihapus!");
      getDashboardStats();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(
        "Gagal menghapus barang: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle approve borrowing
  const handleApproveBorrowing = async (borrowing) => {
    try {
      setActionLoading((prev) => ({ ...prev, [borrowing._id]: true }));
      const response = await customAPI.patch(
        `/inventory/${borrowing.itemId}/borrowings/${borrowing._id}/approve`,
        { approvedBy: "Admin" }
      );

      if (response.data.message === "Permintaan peminjaman disetujui") {
        alert("Permintaan peminjaman berhasil disetujui!");
        getBorrowingRequests(pagination.current);
        getDashboardStats();
      }
    } catch (error) {
      console.error("Error approving borrowing:", error);
      alert(
        "Gagal menyetujui permintaan: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [borrowing._id]: false }));
    }
  };

  // Handle reject borrowing
  const handleRejectBorrowing = async (borrowing, reason) => {
    try {
      setActionLoading((prev) => ({ ...prev, [borrowing._id]: true }));
      const response = await customAPI.patch(
        `/inventory/${borrowing.itemId}/borrowings/${borrowing._id}/reject`,
        { rejectionReason: reason || "Ditolak oleh admin" }
      );

      if (response.data.message === "Permintaan peminjaman ditolak") {
        alert("Permintaan peminjaman berhasil ditolak!");
        getBorrowingRequests(pagination.current);
        getDashboardStats();
      }
    } catch (error) {
      console.error("Error rejecting borrowing:", error);
      alert(
        "Gagal menolak permintaan: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [borrowing._id]: false }));
    }
  };

  // Handle mark as returned
  const handleMarkAsReturned = async (borrowing) => {
    try {
      setActionLoading((prev) => ({ ...prev, [borrowing._id]: true }));
      const response = await customAPI.patch(
        `/inventory/${borrowing.itemId}/borrowings/${borrowing._id}/return`,
        { actualReturnDate: new Date().toISOString() }
      );

      if (response.data.message === "Barang berhasil dikembalikan") {
        alert("Barang berhasil ditandai sebagai dikembalikan!");
        getBorrowingRequests(pagination.current);
        getDashboardStats();
      }
    } catch (error) {
      console.error("Error marking as returned:", error);
      alert(
        "Gagal menandai sebagai dikembalikan: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [borrowing._id]: false }));
    }
  };

  // Validate item form
  const validateItemForm = () => {
    const newErrors = {};

    if (!itemForm.itemName.trim()) {
      newErrors.itemName = "Nama barang wajib diisi";
    }

    if (!itemForm.quantity || itemForm.quantity < 1) {
      newErrors.quantity = "Jumlah harus lebih dari 0";
    }

    if (!editingItem && !itemForm.image) {
      newErrors.image = "Gambar wajib diupload untuk barang baru";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset item form
  const resetItemForm = () => {
    setItemForm({
      itemName: "",
      quantity: "",
      condition: "good",
      isLendable: true,
      description: "",
      image: null,
    });
    setEditingItem(null);
    setErrors({});
  };

  // Modal handlers
  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        itemName: item.itemName,
        quantity: item.quantity.toString(),
        condition: item.condition,
        isLendable: item.isLendable,
        description: item.description || "",
        image: null,
      });
    } else {
      resetItemForm();
    }
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    resetItemForm();
  };

  const handleViewItem = (item) => {
    setViewingItem(item);
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setViewingItem(null);
    setSelectedItem(null);
  };

  const handleCloseBorrowersModal = () => {
    setShowBorrowersModal(false);
    setSelectedItemBorrowers(null);
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleBorrowingFilterChange = (key, value) => {
    setBorrowingFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const handleRefresh = () => {
    if (activeTab === "items") {
      getItems(pagination.current);
    } else if (activeTab === "borrowings") {
      getBorrowingRequests(pagination.current);
    }
    getDashboardStats();
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

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Menunggu",
      },
      approved: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: "Disetujui",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Ditolak",
      },
      returned: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Dikembalikan",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Get condition badge
  const getConditionBadge = (condition) => {
    const conditionConfig = {
      good: { color: "bg-green-100 text-green-800", text: "Baik" },
      needs_repair: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Perlu Perbaikan",
      },
      damaged: { color: "bg-red-100 text-red-800", text: "Rusak" },
      out_of_order: {
        color: "bg-gray-100 text-gray-800",
        text: "Tidak Berfungsi",
      },
    };

    const config = conditionConfig[condition] || conditionConfig.good;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Filter data based on current filters
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.itemName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.search.toLowerCase());

    const matchCondition =
      filters.condition === "all" || item.condition === filters.condition;
    const matchLendable =
      filters.isLendable === "all" ||
      item.isLendable.toString() === filters.isLendable;

    return matchSearch && matchCondition && matchLendable;
  });

  const filteredBorrowings = borrowingRequests.filter((borrowing) => {
    const matchSearch =
      borrowing.itemName
        ?.toLowerCase()
        .includes(borrowingFilters.search.toLowerCase()) ||
      borrowing.borrowerName
        ?.toLowerCase()
        .includes(borrowingFilters.search.toLowerCase()) ||
      borrowing.phoneNumber?.includes(borrowingFilters.search);

    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Inventaris
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola inventaris dan permintaan peminjaman
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
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Barang
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Dapat Dipinjam
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.lendableItems || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Perlu Perbaikan
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.damagedItems || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Menunggu Persetujuan
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingRequests || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Sedang Dipinjam
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approvedBorrowings || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "items"
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              <Package className="w-5 h-5 inline mr-2" />
              Kelola Barang
            </button>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Barang
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Cari nama atau deskripsi barang..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kondisi
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="all">Semua Kondisi</option>
                  <option value="good">Baik</option>
                  <option value="needs_repair">Perlu Perbaikan</option>
                  <option value="damaged">Rusak</option>
                  <option value="out_of_order">Tidak Berfungsi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Peminjaman
                </label>
                <select
                  value={filters.isLendable}
                  onChange={(e) =>
                    handleFilterChange("isLendable", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="all">Semua Status</option>
                  <option value="true">Dapat Dipinjam</option>
                  <option value="false">Tidak Dapat Dipinjam</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Menampilkan {filteredItems.length} dari {items.length} barang
              </div>
              <button
                onClick={() => handleOpenItemModal()}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium">
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
                Tambah Barang
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Memuat data...</span>
            </div>
          ) : activeTab === "items" ? (
            filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Tidak ada barang ditemukan
                </h3>
                <p className="text-gray-500">
                  {filters.search ||
                  filters.condition !== "all" ||
                  filters.isLendable !== "all"
                    ? "Coba ubah filter atau kata kunci pencarian"
                    : "Mulai dengan menambahkan barang baru"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {item.imageUrl ? (
                                  <img
                                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                    src={item.imageUrl}
                                    alt={item.itemName}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                                  style={{
                                    display: item.imageUrl ? "none" : "flex",
                                  }}>
                                  <Package
                                    size={24}
                                    className="text-gray-400"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 mb-1">
                                  {item.itemName}
                                </div>
                                <div className="text-sm text-gray-600 line-clamp-2">
                                  {item.description || "Tidak ada deskripsi"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getConditionBadge(item.condition)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">
                                {item.quantity}
                              </span>{" "}
                              unit
                            </div>
                            <div className="text-xs text-gray-500">
                              Tersedia:{" "}
                              {item.currentlyAvailable || item.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.isLendable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                              {item.isLendable
                                ? "📤 Dapat Dipinjam"
                                : "🚫 Tidak Dapat Dipinjam"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewItem(item)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Lihat Detail">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => getItemWithBorrowers(item._id)}
                                className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors relative"
                                title="Lihat Peminjam">
                                <Users className="w-4 h-4" />
                                {/* Badge untuk jumlah peminjam aktif */}
                                {item.borrowings &&
                                  item.borrowings.filter(
                                    (b) =>
                                      b.status === "pending" ||
                                      b.status === "approved"
                                  ).length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                      {
                                        item.borrowings.filter(
                                          (b) =>
                                            b.status === "pending" ||
                                            b.status === "approved"
                                        ).length
                                      }
                                    </span>
                                  )}
                              </button>
                              <button
                                onClick={() => handleOpenItemModal(item)}
                                disabled={isLoading}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                                title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
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
              </>
            )
          ) : // Borrowings Tab Content
          filteredBorrowings.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Tidak ada permintaan peminjaman
              </h3>
              <p className="text-gray-500">
                {borrowingFilters.search
                  ? "Coba ubah kata kunci pencarian"
                  : "Permintaan peminjaman akan muncul di sini"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Barang & Peminjam
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Kontak
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Tanggal
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBorrowings.map((borrowing) => (
                      <tr
                        key={borrowing._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <img
                                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                src={
                                  borrowing.itemImage ||
                                  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
                                }
                                alt={borrowing.itemName}
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 mb-1">
                                {borrowing.itemName}
                              </div>
                              <div className="text-sm text-green-600 font-medium">
                                👤 {borrowing.borrowerName}
                              </div>
                              {borrowing.institution && (
                                <div className="text-xs text-gray-500">
                                  🏢 {borrowing.institution}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            📞 {borrowing.phoneNumber}
                          </div>
                          {borrowing.documentUrl && (
                            <a
                              href={borrowing.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                              <FileText className="w-3 h-3" />
                              Lihat Dokumen
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            📅 {formatDate(borrowing.borrowDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            s/d {formatDate(borrowing.returnDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(borrowing.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {borrowing.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveBorrowing(borrowing)
                                  }
                                  disabled={actionLoading[borrowing._id]}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                                  {actionLoading[borrowing._id] ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "✅ Setujui"
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt(
                                      "Masukkan alasan penolakan:"
                                    );
                                    if (reason)
                                      handleRejectBorrowing(borrowing, reason);
                                  }}
                                  disabled={actionLoading[borrowing._id]}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                                  ❌ Tolak
                                </button>
                              </>
                            )}
                            {borrowing.status === "approved" && (
                              <button
                                onClick={() => handleMarkAsReturned(borrowing)}
                                disabled={actionLoading[borrowing._id]}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {actionLoading[borrowing._id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "🔄 Tandai Dikembalikan"
                                )}
                              </button>
                            )}
                            {borrowing.status === "rejected" &&
                              borrowing.rejectionReason && (
                                <div className="text-xs text-red-600">
                                  💬 {borrowing.rejectionReason}
                                </div>
                              )}
                            {borrowing.status === "returned" &&
                              borrowing.actualReturnDate && (
                                <div className="text-xs text-green-600">
                                  ✅ {formatDate(borrowing.actualReturnDate)}
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {(pagination.current - 1) * pagination.limit + 1}{" "}
                  -{" "}
                  {Math.min(
                    pagination.current * pagination.limit,
                    pagination.totalRecords
                  )}{" "}
                  dari {pagination.totalRecords} data
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
          )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? "✏️ Edit Barang" : "➕ Tambah Barang"}
                </h2>
                <button
                  onClick={handleCloseItemModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📦 Nama Barang *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.itemName}
                    onChange={(e) => {
                      setItemForm({ ...itemForm, itemName: e.target.value });
                      if (errors.itemName)
                        setErrors({ ...errors, itemName: null });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.itemName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Masukkan nama barang"
                  />
                  {errors.itemName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.itemName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔢 Jumlah *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) => {
                      setItemForm({ ...itemForm, quantity: e.target.value });
                      if (errors.quantity)
                        setErrors({ ...errors, quantity: null });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.quantity
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="1"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔧 Kondisi
                  </label>
                  <select
                    value={itemForm.condition}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, condition: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="good">Baik</option>
                    <option value="needs_repair">Perlu Perbaikan</option>
                    <option value="damaged">Rusak</option>
                    <option value="out_of_order">Tidak Berfungsi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📤 Status Peminjaman
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isLendable"
                        checked={itemForm.isLendable === true}
                        onChange={() =>
                          setItemForm({ ...itemForm, isLendable: true })
                        }
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Dapat Dipinjam
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isLendable"
                        checked={itemForm.isLendable === false}
                        onChange={() =>
                          setItemForm({ ...itemForm, isLendable: false })
                        }
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Tidak Dapat Dipinjam
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Deskripsi
                  </label>
                  <textarea
                    rows={3}
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Deskripsi barang (opsional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🖼️ Gambar {!editingItem && "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setItemForm({ ...itemForm, image: e.target.files[0] });
                      if (errors.image) setErrors({ ...errors, image: null });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.image
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.image}
                    </p>
                  )}
                  {editingItem && (
                    <p className="text-xs text-gray-500 mt-1">
                      Biarkan kosong jika tidak ingin mengubah gambar
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseItemModal}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50">
                    ❌ Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitItem}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingItem ? (
                      "💾 Update Barang"
                    ) : (
                      "➕ Tambah Barang"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Borrowers Modal */}
      {showBorrowersModal && selectedItemBorrowers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    👥 Daftar Peminjam
                  </h2>
                  <p className="text-gray-600">
                    {selectedItemBorrowers.itemName}
                  </p>
                </div>
                <button
                  onClick={handleCloseBorrowersModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Item Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      selectedItemBorrowers.imageUrl ||
                      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
                    }
                    alt={selectedItemBorrowers.itemName}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedItemBorrowers.itemName}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">
                        📦 Total:{" "}
                        <span className="font-medium">
                          {selectedItemBorrowers.quantity}
                        </span>{" "}
                        unit
                      </span>
                      <span className="text-sm text-gray-600">
                        ✅ Tersedia:{" "}
                        <span className="font-medium">
                          {selectedItemBorrowers.currentlyAvailable ||
                            selectedItemBorrowers.quantity}
                        </span>{" "}
                        unit
                      </span>
                      {getConditionBadge(selectedItemBorrowers.condition)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Borrowers List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📋 Riwayat & Status Peminjaman
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: {selectedItemBorrowers.borrowings?.length || 0}{" "}
                    permintaan
                  </div>
                </div>

                {selectedItemBorrowers.borrowings &&
                selectedItemBorrowers.borrowings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedItemBorrowers.borrowings
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((borrowing, index) => (
                        <div
                          key={borrowing._id || index}
                          className={`border rounded-xl p-4 transition-all ${
                            borrowing.status === "pending"
                              ? "border-yellow-200 bg-yellow-50"
                              : borrowing.status === "approved"
                              ? "border-blue-200 bg-blue-50"
                              : borrowing.status === "rejected"
                              ? "border-red-200 bg-red-50"
                              : "border-green-200 bg-green-50"
                          }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  👤 {borrowing.borrowerName}
                                </h4>
                                {getStatusBadge(borrowing.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{borrowing.phoneNumber}</span>
                                </div>
                                {borrowing.institution && (
                                  <div className="flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    <span>{borrowing.institution}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Pinjam: {formatDate(borrowing.borrowDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Kembali: {formatDate(borrowing.returnDate)}
                                  </span>
                                </div>
                              </div>

                              {borrowing.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">
                                    💬 Catatan:
                                  </span>{" "}
                                  {borrowing.notes}
                                </div>
                              )}

                              {borrowing.rejectionReason && (
                                <div className="mt-2 text-sm text-red-600">
                                  <span className="font-medium">
                                    ❌ Alasan Ditolak:
                                  </span>{" "}
                                  {borrowing.rejectionReason}
                                </div>
                              )}

                              {borrowing.actualReturnDate && (
                                <div className="mt-2 text-sm text-green-600">
                                  <span className="font-medium">
                                    ✅ Dikembalikan:
                                  </span>{" "}
                                  {formatDate(borrowing.actualReturnDate)}
                                </div>
                              )}

                              {borrowing.documentUrl && (
                                <div className="mt-2">
                                  <a
                                    href={borrowing.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Lihat Dokumen
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                              {borrowing.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleApproveBorrowing({
                                        ...borrowing,
                                        itemId: selectedItemBorrowers._id,
                                      });
                                    }}
                                    disabled={actionLoading[borrowing._id]}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                                    {actionLoading[borrowing._id] ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "✅ Setujui"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt(
                                        "Masukkan alasan penolakan:"
                                      );
                                      if (reason) {
                                        handleRejectBorrowing(
                                          {
                                            ...borrowing,
                                            itemId: selectedItemBorrowers._id,
                                          },
                                          reason
                                        );
                                      }
                                    }}
                                    disabled={actionLoading[borrowing._id]}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                                    ❌ Tolak
                                  </button>
                                </>
                              )}
                              {borrowing.status === "approved" && (
                                <button
                                  onClick={() => {
                                    handleMarkAsReturned({
                                      ...borrowing,
                                      itemId: selectedItemBorrowers._id,
                                    });
                                  }}
                                  disabled={actionLoading[borrowing._id]}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                  {actionLoading[borrowing._id] ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "🔄 Kembalikan"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Belum ada peminjam
                    </h3>
                    <p className="text-gray-500">
                      Barang ini belum pernah dipinjam oleh siapapun
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleCloseBorrowersModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  🔙 Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🔍 Detail Barang
                </h2>
                <button
                  onClick={handleCloseDetailModal}
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
                  {getConditionBadge(selectedItem.condition)}
                </div>
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
                        (selectedItem.currentlyAvailable ||
                          selectedItem.quantity ||
                          0) > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      {selectedItem.currentlyAvailable ||
                        selectedItem.quantity ||
                        0}
                    </div>
                    <div className="text-sm text-gray-500">Tersedia</div>
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

                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">
                    ℹ️ Informasi:
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      • Status:{" "}
                      {selectedItem.isLendable
                        ? "Dapat dipinjam"
                        : "Tidak dapat dipinjam"}
                    </p>
                    <p>
                      • Kondisi:{" "}
                      {selectedItem.condition === "good"
                        ? "Baik"
                        : selectedItem.condition === "needs_repair"
                        ? "Perlu perbaikan"
                        : selectedItem.condition === "damaged"
                        ? "Rusak"
                        : "Tidak berfungsi"}
                    </p>
                    {selectedItem.createdAt && (
                      <p>• Ditambahkan: {formatDate(selectedItem.createdAt)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={handleCloseDetailModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300">
                  🔙 Tutup
                </button>
                <button
                  onClick={() => {
                    handleCloseDetailModal();
                    handleOpenItemModal(selectedItem);
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg">
                  ✏️ Edit Barang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default InventarisAdmin;
