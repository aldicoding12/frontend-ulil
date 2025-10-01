/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Eye,
  ArrowUpRight,
  RefreshCw,
  MoreVertical,
  Clock,
  MapPin,
  PlusCircle,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  HandCoins,
  Package,
} from "lucide-react";

// Import Zustand Stores
import { useFinanceStore } from "../../store/financeStore";
import { useDashboardStore } from "../../store/dashboardStore";
import NewsModal from "../../components/admin/componens/NewsComponents/NewsModal ";
import KegiatanForm from "../../components/admin/componens/kegiatan/KegiatanForm";
import Donasiform from "../../components/admin/componens/donasi/Donasiform";

const IntegratedAdminDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // 🚀 FINANCE STORE - Data keuangan real
  const {
    currentBalance,
    formattedBalance,
    reportData,
    reportLoading,
    fetchBalance,
    fetchReport,
  } = useFinanceStore();

  // 🚀 DASHBOARD STORE - Semua data dashboard
  const {
    loading: dashboardLoading,
    error: dashboardError,
    lastUpdated,
    dashboardStats,
    recentActivities,
    upcomingEvents,
    fetchAllDashboardData,
    clearError,
  } = useDashboardStore();

  // Destructure finance data
  const {
    totalIncome = 0,
    totalExpense = 0,
    incomes = [],
    expenses = [],
  } = reportData;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load finance data
        await Promise.all([
          fetchBalance(),
          fetchReport("monthly", new Date().toISOString().split("T")[0]),
        ]);

        // Load dashboard data
        await fetchAllDashboardData();
      } catch (error) {
        console.error(error);
      }
    };

    loadInitialData();
  }, []);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dashboardLoading && !reportLoading) {
        refreshAllData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dashboardLoading, reportLoading]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchBalance(),
        fetchReport("monthly", new Date().toISOString().split("T")[0]),
        fetchAllDashboardData(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fungsi untuk membuka modal
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Quick actions dengan modal
  const quickActions = [
    {
      id: 1,
      title: "Tambah Berita",
      icon: PlusCircle,
      color: "bg-blue-500",
      modalType: "news",
    },
    {
      id: 2,
      title: "Tambah Kegiatan",
      icon: Calendar,
      color: "bg-green-500",
      modalType: "kegiatan",
    },
    {
      id: 3,
      title: "Tambah Inventaris",
      icon: UserPlus,
      color: "bg-orange-500",
      modalType: "transaction",
    },
    {
      id: 4,
      title: "Tambah Donasi",
      icon: HandCoins,
      color: "bg-yellow-500",
      modalType: "donasi",
    },
  ];

  // Fungsi untuk render modal yang sesuai
  const renderModal = () => {
    switch (activeModal) {
      case "news":
        return (
          <NewsModal
            isOpen={true}
            onClose={closeModal}
            onSuccess={() => {
              closeModal();
              refreshAllData(); // Refresh data setelah berhasil tambah berita
            }}
          />
        );
      case "kegiatan":
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tambah Kegiatan</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <KegiatanForm
                onSuccess={() => {
                  closeModal();
                  refreshAllData(); // Refresh data setelah berhasil tambah kegiatan
                }}
                onCancel={closeModal}
              />
            </div>
          </div>
        );
      case "transaction":
        return (
          <AddTransactionModal
            isOpen={true}
            onClose={closeModal}
            onSuccess={() => {
              closeModal();
              refreshAllData(); // Refresh data setelah berhasil tambah transaksi
            }}
          />
        );
      case "donasi":
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tambah Donasi</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <Donasiform
                onSuccess={() => {
                  closeModal();
                  refreshAllData(); // Refresh data setelah berhasil tambah donasi
                }}
                onCancel={closeModal}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show error if any
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Error Loading Dashboard
              </h3>
              <p className="text-gray-600 mt-1">{dashboardError}</p>
              <button
                onClick={() => {
                  clearError();
                  fetchAllDashboardData();
                }}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 mt-1">
              Data real-time dari database masjid
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              {lastUpdated ? (
                <>Update: {lastUpdated.toLocaleTimeString("id-ID")}</>
              ) : (
                "Memuat..."
              )}
            </div>
            <button
              onClick={refreshAllData}
              disabled={isRefreshing || dashboardLoading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  isRefreshing || dashboardLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Donasi - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donasi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardLoading ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
                ) : (
                  formatCurrency(dashboardStats.totalDonasi)
                )}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{dashboardStats.trendDonasi}%
                </span>
                <span className="text-sm text-gray-500 ml-1">bulan ini</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Jamaah - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jamaah</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardLoading ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
                ) : (
                  formatNumber(dashboardStats.totalJamaah)
                )}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600 font-medium">
                  +{dashboardStats.trendPertumbuhan}%
                </span>
                <span className="text-sm text-gray-500 ml-1">bulan ini</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Berita - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Berita</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardLoading ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
                ) : (
                  dashboardStats.totalBerita
                )}
              </p>
              <div className="flex items-center mt-2">
                <Eye className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600 font-medium">
                  {formatNumber(dashboardStats.viewsTotal)} views
                </span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Kegiatan Aktif - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Kegiatan Aktif
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardLoading ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-12"></div>
                ) : (
                  dashboardStats.kegiatanAktif
                )}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 font-medium">
                  {dashboardStats.kegiatanMendatang} mendatang
                </span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Keuangan Detail - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ringkasan Keuangan (Real-time)
            </h3>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Live</span>
            </div>
          </div>

          {reportLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Memuat data keuangan...
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pemasukan</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pengeluaran</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Saldo Real-time
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formattedBalance || formatCurrency(currentBalance || 0)}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Perubahan Bersih
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      totalIncome - totalExpense >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                    {formatCurrency(totalIncome - totalExpense)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions dengan Modal */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => openModal(action.modalType)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group">
                  <div
                    className={`${action.color} w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {action.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Metrik Performa
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jamaah Aktif</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dashboardLoading ? (
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                  ) : (
                    formatNumber(dashboardStats.jamaahAktif)
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {(
                      (dashboardStats.jamaahAktif /
                        dashboardStats.totalJamaah) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Views Hari Ini</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dashboardLoading ? (
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                  ) : (
                    formatNumber(dashboardStats.viewsHariIni)
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    +{dashboardStats.trendViews}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jamaah Baru</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dashboardLoading ? (
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-12"></div>
                  ) : (
                    dashboardStats.jamaahBaru
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-blue-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Minggu ini</span>
                </div>
              </div>
            </div>

            {/* Inventory Stats - REAL DATA */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inventaris</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dashboardLoading ? (
                      <div className="animate-pulse h-6 bg-gray-200 rounded w-12"></div>
                    ) : (
                      dashboardStats.inventoryStats?.totalItems || 0
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-orange-600">
                    <Package className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      {dashboardStats.inventoryStats?.pendingRequests || 0}{" "}
                      pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Aktivitas Terbaru
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Live</span>
            </div>
          </div>

          {dashboardLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="animate-pulse h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === "donation"
                        ? "bg-green-500"
                        : activity.type === "news"
                        ? "bg-blue-500"
                        : activity.type === "event"
                        ? "bg-purple-500"
                        : "bg-gray-400"
                    }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {activity.user}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Tidak ada aktivitas terbaru</p>
            </div>
          )}
        </div>

        {/* Upcoming Events - REAL DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Kegiatan Mendatang
            </h3>
            <button
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => (window.location.href = "/admin/events")}>
              Kelola
            </button>
          </div>

          {dashboardLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="animate-pulse h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="animate-pulse h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-green-500 pl-4 py-2 hover:bg-gray-50 transition-colors">
                  <h4 className="text-sm font-medium text-gray-900">
                    {event.title || event.eventName}
                  </h4>
                  <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(
                        event.startDate || event.date
                      ).toLocaleDateString("id-ID")}{" "}
                      •{" "}
                      {event.time ||
                        new Date(
                          event.startDate || event.date
                        ).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                  <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.location || "Masjid"}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {event.participants || event.maxParticipants || 0} peserta
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Tidak ada kegiatan mendatang</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-sm text-green-700">
            Dashboard terintegrasi dengan database real-time
          </span>
        </div>
      </div>

      {/* Render modal yang aktif */}
      {renderModal()}
    </div>
  );
};

export default IntegratedAdminDashboard;
