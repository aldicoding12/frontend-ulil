// pages/pengurus/auth/LoginView.jsx - Enhanced version
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import customAPI from "../../../api";
import { useAuth } from "../../../components/auth/AuthProvider";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  Home,
  Star,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const LoginView = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 User already authenticated, redirecting...");
      const redirectPath = user.role === "pengurus" ? "/pengurus" : "/";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("userEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear API error
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email diperlukan";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password diperlukan";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Login API function
  const loginUser = async (credentials) => {
    try {
      const response = await customAPI.post("/user/login", credentials);
      console.log("Login successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login API Error:", error);

      if (error.response) {
        const errorMessage = error.response.data?.message || "Login gagal";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("Tidak dapat terhubung ke server");
      } else {
        throw new Error("Terjadi kesalahan yang tidak terduga");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("🔵 Starting login process...");

      const loginData = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("🟢 Login API response:", loginData);

      // Store user email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("userEmail", formData.email);
      } else {
        localStorage.removeItem("userEmail");
      }

      if (loginData.data) {
        console.log("🟢 Login data received:", loginData.data);

        // Call login function from useAuth
        const redirectPath = login(loginData.data);
        console.log("🔄 Redirect path:", redirectPath);

        // Get intended destination from location state or use role-based redirect
        const from = location.state?.from?.pathname || redirectPath;

        // Check if user has access to intended destination
        const canAccessIntended =
          !from.includes("/pengurus") || loginData.data.role === "pengurus";

        const finalRedirect = canAccessIntended ? from : redirectPath;

        console.log("🔄 Final redirect:", finalRedirect);

        // Redirect after a short delay to allow state updates
        setTimeout(() => {
          navigate(finalRedirect, { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setApiError(error.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleForgotPassword = () => {
    alert(
      "Fitur lupa password akan segera hadir. Silakan hubungi pengurus masjid."
    );
  };

  const handleContactAdmin = () => {
    alert("Silakan hubungi pengurus masjid untuk mendapatkan akses admin.");
  };

  const handleRegisterRedirect = () => {
    navigate("/registrasi");
  };

  const handleHomeRedirect = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-green-200">
          <Star className="w-6 h-6" />
        </div>
        <div className="absolute top-40 right-20 text-green-200">
          <Home className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-20 text-green-200">
          <Heart className="w-5 h-5" />
        </div>
        <div className="absolute bottom-20 right-16 text-green-200">
          <Star className="w-7 h-7" />
        </div>
        <div className="absolute top-60 left-1/2 text-green-200">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Masuk ke Sistem
              </h1>
              <p className="text-green-100 text-sm">
                {location.state?.from
                  ? "Silakan login untuk melanjutkan"
                  : "Akses dashboard dan fitur lengkap"}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Intended destination info */}
            {location.state?.from && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-blue-700">
                  Anda akan diarahkan ke halaman yang diminta setelah login
                </span>
              </div>
            )}

            {/* API Error Display */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-green-600" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="contoh@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-green-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-12 ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}>
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  disabled={isLoading}>
                  Lupa password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-sm text-gray-500">
            Belum punya akun?{" "}
            <button
              onClick={handleRegisterRedirect}
              className="text-green-600 hover:text-green-700 font-medium"
              disabled={isLoading}>
              Daftar sebagai jamaah
            </button>
          </p>

          <p className="text-xs text-gray-400">
            Butuh akses pengurus?{" "}
            <button
              onClick={handleContactAdmin}
              className="text-green-600 hover:text-green-700 font-medium"
              disabled={isLoading}>
              Hubungi pengurus masjid
            </button>
          </p>

          <button
            onClick={handleHomeRedirect}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}>
            <Home className="w-4 h-4 mr-1" />
            Kembali ke beranda
          </button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center mt-6 space-x-2 text-xs text-gray-500">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Keamanan data terjamin dengan enkripsi SSL</span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
