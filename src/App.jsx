// App.jsx - Updated dengan enhanced route protection
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// components jamaah
import DashboardView from "./pages/jamaah/DashboardView";
import Profilview from "./pages/jamaah/Profilview";
import KontakView from "./pages/jamaah/KontakView";
import BeritaView from "./pages/jamaah/BeritaView";
import LaporanView from "./pages/jamaah/laporanView";
import DetailBerita from "./pages/jamaah/DetailBerita";
import KegiatanView from "./pages/jamaah/KegiatanView";
import DonasiView from "./pages/jamaah/DonasiView";
import ReservasiView from "./pages/jamaah/ReservasiView";
import InventarisView from "./pages/jamaah/InventarisView";

// Pages pengurus
import Dashboard from "./pages/pengurus/Dashboard";
import LaporanManagement from "./pages/pengurus/LaporanManagement";
import BeritaManajement from "./pages/pengurus/BeritaManajement";
import KagiatanManagement from "./pages/pengurus/KagiatanManagement";
import DonasiManagement from "./pages/pengurus/donasiManagement";
import KontakManagement from "./pages/pengurus/KontakManagement";
import InventarisAdmin from "./pages/pengurus/InventarisManagement";

// auth
import LoginView from "./pages/pengurus/auth/LoginView";
import RegistrasiView from "./pages/pengurus/auth/RegistrasiView";

// layoutsnya
import PublicLayouts from "./Layouts/PublicLayouts";
import MainLayout from "./Layouts/MainLayout";

// Auth components
import AuthProvider from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              Error: {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Router configuration dengan enhanced protection
const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayouts />,
    children: [
      // 🟢 PUBLIC ROUTES (Always accessible - tidak perlu login)
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: "berita",
        element: <BeritaView />,
      },
      {
        path: "berita/:id",
        element: <DetailBerita />,
      },
      {
        path: "kegiatan",
        element: <KegiatanView />,
      },
      {
        path: "contact",
        element: <KontakView />,
      },
      {
        path: "inventaris",
        element: <InventarisView />,
      },

      // 🟡 AUTHENTICATED ROUTES (Perlu login - jamaah + pengurus bisa akses)
      {
        path: "profil",
        element: (
          <ProtectedRoute>
            <Profilview />
          </ProtectedRoute>
        ),
      },
      {
        path: "laporan",
        element: (
          <ProtectedRoute>
            <LaporanView />
          </ProtectedRoute>
        ),
      },
      {
        path: "donasi",
        element: (
          <ProtectedRoute>
            <DonasiView />
          </ProtectedRoute>
        ),
      },
      {
        path: "reservasi",
        element: (
          <ProtectedRoute>
            <ReservasiView />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 🟢 AUTH ROUTES (Public - untuk yang belum login)
  {
    path: "/login",
    element: <LoginView />,
  },
  {
    path: "/registrasi",
    element: <RegistrasiView />,
  },

  // 🔴 PENGURUS ONLY ROUTES (Hanya pengurus yang bisa akses)
  {
    path: "/pengurus",
    element: (
      <ProtectedRoute requiredRole="pengurus">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: { title: "Dashboard Pengurus" },
      },
      {
        path: "keuangan",
        element: <LaporanManagement />,
        handle: { title: "Manajemen Keuangan" },
      },
      {
        path: "berita",
        element: <BeritaManajement />,
        handle: { title: "Manajemen Berita" },
      },
      {
        path: "kegiatan",
        element: <KagiatanManagement />,
        handle: { title: "Manajemen Kegiatan" },
      },
      {
        path: "donasi",
        element: <DonasiManagement />,
        handle: { title: "Manajemen Donasi" },
      },
      {
        path: "inventory",
        element: <InventarisAdmin />,
        handle: { title: "Manajemen Inventaris" },
      },
      {
        path: "feedback",
        element: <KontakManagement />,
        handle: { title: "Manajemen Kontak" },
      },
      // Tambahan route pengurus lainnya bisa ditambahkan di sini
    ],
  },

  // 🔴 CATCH-ALL ROUTE (404 handler)
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Halaman yang Anda cari tidak tersedia.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    ),
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
