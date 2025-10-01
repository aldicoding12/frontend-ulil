// store/dashboardStore.js - Zustand store untuk semua data dashboard
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import customAPI from "../api.js"; // Import CustomAPI

// =====================================================
// 📊 DASHBOARD STORE - Aggregated data untuk dashboard
// =====================================================
export const useDashboardStore = create(
  devtools(
    (set, get) => ({
      // ============ STATE ============
      loading: false,
      error: null,
      lastUpdated: null,

      // Dashboard stats
      dashboardStats: {
        totalJamaah: 0,
        jamaahAktif: 0,
        jamaahBaru: 0,
        trendPertumbuhan: 0,

        totalBerita: 0,
        beritaPublished: 0,
        beritaDraft: 0,
        viewsTotal: 0,
        viewsHariIni: 0,
        trendViews: 0,

        kegiatanAktif: 0,
        kegiatanSelesai: 0,
        kegiatanMendatang: 0,
        pesertaTotal: 0,

        totalDonasi: 0,
        donasiHariIni: 0,
        trendDonasi: 0,

        inventoryStats: {
          totalItems: 0,
          lendableItems: 0,
          damagedItems: 0,
          pendingRequests: 0,
          approvedBorrowings: 0,
        },
      },

      // Recent activities
      recentActivities: [],

      // Upcoming events
      upcomingEvents: [],

      // ============ ACTIONS ============

      // 🚀 Fetch semua data dashboard
      fetchAllDashboardData: async () => {
        set({ loading: true, error: null });

        try {
          // Parallel fetch semua data
          const [
            usersStats,
            newsStats,
            eventsStats,
            donationStats,
            inventoryStats,
            recentActivities,
            upcomingEvents,
          ] = await Promise.all([
            get().fetchUsersStats(),
            get().fetchNewsStats(),
            get().fetchEventsStats(),
            get().fetchDonationStats(),
            get().fetchInventoryStats(),
            get().fetchRecentActivities(),
            get().fetchUpcomingEvents(),
          ]);

          // Aggregate semua stats
          const aggregatedStats = {
            // Users/Jamaah stats
            totalJamaah: usersStats?.totalUsers || 0,
            jamaahAktif: usersStats?.activeUsers || 0,
            jamaahBaru: usersStats?.newUsers || 0,
            trendPertumbuhan: usersStats?.growthRate || 0,

            // News stats
            totalBerita: newsStats?.totalNews || 0,
            beritaPublished: newsStats?.publishedNews || 0,
            beritaDraft: newsStats?.draftNews || 0,
            viewsTotal: newsStats?.totalViews || 0,
            viewsHariIni: newsStats?.todayViews || 0,
            trendViews: newsStats?.viewsGrowth || 0,

            // Events stats
            kegiatanAktif: eventsStats?.activeEvents || 0,
            kegiatanSelesai: eventsStats?.completedEvents || 0,
            kegiatanMendatang: eventsStats?.upcomingEvents || 0,
            pesertaTotal: eventsStats?.totalParticipants || 0,

            // Donation stats
            totalDonasi: donationStats?.totalAmount || 0,
            donasiHariIni: donationStats?.todayAmount || 0,
            trendDonasi: donationStats?.growthRate || 0,

            // Inventory stats
            inventoryStats: inventoryStats || {},
          };

          set({
            dashboardStats: aggregatedStats,
            recentActivities: recentActivities || [],
            upcomingEvents: upcomingEvents || [],
            loading: false,
            lastUpdated: new Date(),
          });
        } catch (error) {
          console.error("❌ Error fetching dashboard data:", error);
          set({ error: error.message, loading: false });
        }
      },

      // 📈 Fetch users/jamaah statistics
      fetchUsersStats: async () => {
        try {
          // Gunakan endpoint yang ada atau buat endpoint baru
          const response = await customAPI.get("/user/stats"); // Endpoint baru
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching users stats:", error);
          // Return dummy data jika endpoint belum ada
          return {
            totalUsers: 1247,
            activeUsers: 892,
            newUsers: 23,
            growthRate: 12.3,
          };
        }
      },

      // 📰 Fetch news statistics
      fetchNewsStats: async () => {
        try {
          const response = await customAPI.get("/user/stats"); // Endpoint baru
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching news stats:", error);
          // Return dummy data jika endpoint belum ada
          return {
            totalNews: 45,
            publishedNews: 38,
            draftNews: 7,
            totalViews: 12450,
            todayViews: 340,
            viewsGrowth: 8.5,
          };
        }
      },

      // 🎯 Fetch events statistics
      fetchEventsStats: async () => {
        try {
          const response = await customAPI.get("/events/upcoming"); // Endpoint sudah ada!
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching events stats:", error);
          return {
            activeEvents: 8,
            completedEvents: 156,
            upcomingEvents: 12,
            totalParticipants: 2340,
          };
        }
      },

      // 💰 Fetch donation statistics
      fetchDonationStats: async () => {
        try {
          // Gunakan endpoint donation yang ada
          const response = await customAPI.get("/donation/stats/all"); // Modifikasi endpoint
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching donation stats:", error);
          return {
            totalAmount: 125750000,
            todayAmount: 2500000,
            growthRate: 15.2,
          };
        }
      },

      // 📦 Fetch inventory statistics
      fetchInventoryStats: async () => {
        try {
          const response = await customAPI.get("/inventory/admin"); // Endpoint sudah ada!
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching inventory stats:", error);
          return {
            totalItems: 0,
            lendableItems: 0,
            damagedItems: 0,
            pendingRequests: 0,
            approvedBorrowings: 0,
          };
        }
      },

      // 📋 Fetch recent activities
      fetchRecentActivities: async () => {
        try {
          const response = await customAPI.get("/activities/recent"); // Endpoint baru
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching recent activities:", error);
          // Return dummy data
          return [
            {
              id: 1,
              message: "Donasi baru sebesar Rp 1,500,000",
              time: "5 menit lalu",
              user: "Ahmad Rizki",
              type: "donation",
            },
            {
              id: 2,
              message: 'Berita "Kajian Ramadan" dipublikasikan',
              time: "15 menit lalu",
              user: "Admin",
              type: "news",
            },
          ];
        }
      },

      // 📅 Fetch upcoming events
      fetchUpcomingEvents: async () => {
        try {
          const response = await customAPI.get("/events/upcoming"); // Endpoint sudah ada!
          return response.data;
        } catch (error) {
          console.error("❌ Error fetching upcoming events:", error);
          return [];
        }
      },

      // 🔄 Refresh specific data
      refreshUsersData: async () => {
        const stats = await get().fetchUsersStats();
        set((state) => ({
          dashboardStats: {
            ...state.dashboardStats,
            totalJamaah: stats?.totalUsers || 0,
            jamaahAktif: stats?.activeUsers || 0,
            jamaahBaru: stats?.newUsers || 0,
            trendPertumbuhan: stats?.growthRate || 0,
          },
          lastUpdated: new Date(),
        }));
      },

      refreshNewsData: async () => {
        const stats = await get().fetchNewsStats();
        set((state) => ({
          dashboardStats: {
            ...state.dashboardStats,
            totalBerita: stats?.totalNews || 0,
            beritaPublished: stats?.publishedNews || 0,
            beritaDraft: stats?.draftNews || 0,
            viewsTotal: stats?.totalViews || 0,
            viewsHariIni: stats?.todayViews || 0,
            trendViews: stats?.viewsGrowth || 0,
          },
          lastUpdated: new Date(),
        }));
      },

      // 🧹 Clear error
      clearError: () => set({ error: null }),

      // 💾 Reset store
      resetStore: () =>
        set({
          loading: false,
          error: null,
          lastUpdated: null,
          dashboardStats: {
            totalJamaah: 0,
            jamaahAktif: 0,
            jamaahBaru: 0,
            trendPertumbuhan: 0,
            totalBerita: 0,
            beritaPublished: 0,
            beritaDraft: 0,
            viewsTotal: 0,
            viewsHariIni: 0,
            trendViews: 0,
            kegiatanAktif: 0,
            kegiatanSelesai: 0,
            kegiatanMendatang: 0,
            pesertaTotal: 0,
            totalDonasi: 0,
            donasiHariIni: 0,
            trendDonasi: 0,
            inventoryStats: {},
          },
          recentActivities: [],
          upcomingEvents: [],
        }),
    }),
    {
      name: "dashboard-store", // untuk debugging
    }
  )
);

// =====================================================
// 🏪 Shorthand hooks untuk komponen
// =====================================================
export const useJamaahStats = () => {
  const { totalJamaah, jamaahAktif, jamaahBaru, trendPertumbuhan } =
    useDashboardStore((state) => state.dashboardStats);
  return { totalJamaah, jamaahAktif, jamaahBaru, trendPertumbuhan };
};

export const useNewsStats = () => {
  const {
    totalBerita,
    beritaPublished,
    beritaDraft,
    viewsTotal,
    viewsHariIni,
    trendViews,
  } = useDashboardStore((state) => state.dashboardStats);
  return {
    totalBerita,
    beritaPublished,
    beritaDraft,
    viewsTotal,
    viewsHariIni,
    trendViews,
  };
};

export const useEventsStats = () => {
  const { kegiatanAktif, kegiatanSelesai, kegiatanMendatang, pesertaTotal } =
    useDashboardStore((state) => state.dashboardStats);
  return { kegiatanAktif, kegiatanSelesai, kegiatanMendatang, pesertaTotal };
};

export const useDonationStats = () => {
  const { totalDonasi, donasiHariIni, trendDonasi } = useDashboardStore(
    (state) => state.dashboardStats
  );
  return { totalDonasi, donasiHariIni, trendDonasi };
};
