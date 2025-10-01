// components/auth/ProtectedRoute.jsx - Enhanced untuk pembatasan akses
import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { AlertTriangle, Home, LogIn, Shield, User } from "lucide-react";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  fallbackPath = "/login",
}) => {
  const { user, isAuthenticated, isLoading, canAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memverifikasi akses...</p>
          <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (!canAccess(requiredRole)) {
    return (
      <AccessDeniedPage
        userRole={user?.role}
        requiredRole={requiredRole}
        navigate={navigate}
      />
    );
  }

  // Access granted
  return children;
};

// Component untuk halaman akses ditolak
const AccessDeniedPage = ({ userRole, requiredRole, navigate }) => {
  const getAccessDeniedInfo = () => {
    switch (requiredRole) {
      case "pengurus":
        return {
          title: "Akses Khusus Pengurus",
          message: "Halaman ini khusus untuk pengurus masjid.",
          icon: <Shield className="w-8 h-8 text-red-600" />,
          suggestions: [
            {
              label: "Kembali ke Beranda",
              action: () => navigate("/"),
              variant: "primary",
              icon: <Home className="w-4 h-4" />,
            },
            {
              label: "Login sebagai Pengurus",
              action: () => navigate("/login"),
              variant: "secondary",
              icon: <LogIn className="w-4 h-4" />,
            },
          ],
        };
      default:
        return {
          title: "Akses Ditolak",
          message: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          suggestions: [
            {
              label: "Kembali ke Beranda",
              action: () => navigate("/"),
              variant: "primary",
              icon: <Home className="w-4 h-4" />,
            },
            {
              label: "Login Ulang",
              action: () => navigate("/login"),
              variant: "secondary",
              icon: <LogIn className="w-4 h-4" />,
            },
          ],
        };
    }
  };

  const { title, message, icon, suggestions } = getAccessDeniedInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="absolute top-40 right-20 text-red-200">
          <Shield className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-20 text-red-200">
          <User className="w-5 h-5" />
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{message}</p>

          {/* User Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Anda login sebagai:</p>
            <p className="font-semibold text-gray-700 capitalize">
              {userRole || "User Tidak Dikenal"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={suggestion.action}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                suggestion.variant === "primary"
                  ? "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-200"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200"
              }`}>
              {suggestion.icon}
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Butuh bantuan? Hubungi pengurus masjid
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
