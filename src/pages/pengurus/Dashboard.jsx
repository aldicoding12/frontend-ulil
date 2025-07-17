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
} from "lucide-react";

// Import Zustand Store untuk data real
import { useFinanceStore } from "../../store/financeStore";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 🚀 ZUSTAND STORE - Ambil data real dari finance store
  const {
    // Balance states
    currentBalance,
    formattedBalance,

    // Report states
    reportData,
    reportLoading,

    // Actions
    fetchBalance,
    fetchReport,
  } = useFinanceStore();

  // Destructure report data untuk mendapatkan totalIncome dan totalExpense REAL
  const {
    totalIncome = 0, // ✅ Data REAL pemasukan dengan default 0
    totalExpense = 0, // ✅ Data REAL pengeluaran dengan default 0
    incomes = [], // Array pemasukan
    expenses = [], // Array pengeluaran
  } = reportData;

  // // Debug: Log data untuk memastikan ada
  // console.log("🔍 Debug Dashboard Data:", {
  //   totalIncome,
  //   totalExpense,
  //   saldoAkhir,
  //   incomesCount: incomes.length,
  //   expensesCount: expenses.length,
  //   reportLoading,
  //   currentBalance,
  // });

  // Dashboard data - hanya untuk data non-keuangan (sisa data dummy)
  const [dashboardData, setDashboardData] = useState({
    keuangan: {
      totalDonasi: 125750000,
      donasiHariIni: 2500000,
      trendDonasi: 15.2,
    },
    berita: {
      totalBerita: 45,
      beritaPublished: 38,
      beritaDraft: 7,
      viewsTotal: 12450,
      viewsHariIni: 340,
      trendViews: 8.5,
    },
    jamaah: {
      totalJamaah: 1247,
      jamaahAktif: 892,
      jamaahBaru: 23,
      trendPertumbuhan: 12.3,
    },
    kegiatan: {
      kegiatanAktif: 8,
      kegiatanSelesai: 156,
      pesertaTotal: 2340,
      kegiatanMendatang: 12,
    },
  });

  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load balance
        await fetchBalance();

        // Load report data dengan range dan date default
        // Sesuai dengan defaultnya di store: monthly dan hari ini
        const today = new Date().toISOString().split("T")[0];
        await fetchReport("monthly", today);
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []); // Remove dependencies to avoid infinite loop

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Refresh real data dari store
      await fetchBalance();

      // Refresh report dengan range dan date yang sesuai
      const today = new Date().toISOString().split("T")[0];
      await fetchReport("monthly", today);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick actions
  const quickActions = [
    {
      id: 1,
      title: "Tambah Berita",
      icon: PlusCircle,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Tambah Kegiatan",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Laporan Keuangan",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Manajemen Jamaah",
      icon: UserPlus,
      color: "bg-orange-500",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      message: "Donasi baru sebesar Rp 1,500,000",
      time: "5 menit lalu",
      user: "Ahmad Rizki",
    },
    {
      id: 2,
      message: 'Berita "Kajian Ramadan" dipublikasikan',
      time: "15 menit lalu",
      user: "Admin",
    },
    {
      id: 3,
      message: 'Kegiatan "Buka Bersama" mendapat 25 pendaftar baru',
      time: "1 jam lalu",
      user: "System",
    },
    {
      id: 4,
      message: "Jamaah baru: Siti Nurhaliza bergabung",
      time: "2 jam lalu",
      user: "System",
    },
    {
      id: 5,
      message: "Pengeluaran untuk renovasi masjid: Rp 5,000,000",
      time: "3 jam lalu",
      user: "Admin",
    },
  ];

  // Upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Kajian Tafsir Al-Quran",
      date: "2024-12-30",
      time: "19:30",
      location: "Aula Utama",
      participants: 45,
    },
    {
      id: 2,
      title: "Sholat Tarawih",
      date: "2024-12-30",
      time: "20:00",
      location: "Masjid Utama",
      participants: 120,
    },
    {
      id: 3,
      title: "Buka Bersama Jamaah",
      date: "2024-12-31",
      time: "18:00",
      location: "Halaman Masjid",
      participants: 200,
    },
    {
      id: 4,
      title: "Kajian Hadits",
      date: "2025-01-02",
      time: "08:00",
      location: "Ruang Kajian",
      participants: 30,
    },
  ];

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
              Selamat datang kembali! Berikut ringkasan aktivitas masjid hari
              ini.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Update terakhir: {lastUpdated.toLocaleTimeString("id-ID")}
            </div>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Donasi */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donasi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(dashboardData.keuangan.totalDonasi)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{dashboardData.keuangan.trendDonasi}%
                </span>
                <span className="text-sm text-gray-500 ml-1">bulan ini</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Jamaah */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jamaah</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(dashboardData.jamaah.totalJamaah)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600 font-medium">
                  +{dashboardData.jamaah.trendPertumbuhan}%
                </span>
                <span className="text-sm text-gray-500 ml-1">bulan ini</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Berita */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Berita</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.berita.totalBerita}
              </p>
              <div className="flex items-center mt-2">
                <Eye className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600 font-medium">
                  {formatNumber(dashboardData.berita.viewsTotal)} views
                </span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Kegiatan Aktif */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Kegiatan Aktif
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.kegiatan.kegiatanAktif}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600 font-medium">
                  {dashboardData.kegiatan.kegiatanMendatang} mendatang
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
        {/* Keuangan Detail - MENGGUNAKAN DATA REAL */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ringkasan Keuangan bulan ini
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
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
                    Saldo Akhir Real-Time
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

              {/* Status indicator */}
              <div className="text-xs text-gray-500 text-center mt-3">
                💡 Data diambil real-time dari laporan keuangan (Monthly)
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left">
                <div
                  className={`${action.color} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {action.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Metrik Performa
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jamaah Aktif</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(dashboardData.jamaah.jamaahAktif)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">71.5%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Views Berita Hari Ini</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(dashboardData.berita.viewsHariIni)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    +{dashboardData.berita.trendViews}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jamaah Baru</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dashboardData.jamaah.jamaahBaru}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-blue-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Minggu ini</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Aktivitas Terbaru
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
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
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Kegiatan Mendatang
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Kelola
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {event.title}
                </h4>
                <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.date} • {event.time}
                  </div>
                </div>
                <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {event.participants} peserta
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
