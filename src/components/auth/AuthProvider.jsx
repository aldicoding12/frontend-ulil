/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from "react";
import customAPI from "../../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getCookie = (name) => {
  try {
    if (!document.cookie) {
      return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop().split(";").shift();
      return cookieValue;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Cek localStorage dulu untuk restore state cepat
      const storedUserData = localStorage.getItem("userData");

      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);

          // Set state dari localStorage dulu (untuk UX yang lebih baik)
          setUser(parsedUserData);
          setIsAuthenticated(true);

          // Verify dengan backend di background (tidak blocking)
          verifyWithBackend(parsedUserData);
        } catch (parseError) {
          localStorage.removeItem("userData");
          handleAuthFailure();
        }
      } else {
        // Tidak ada data di localStorage
        handleAuthFailure();
      }
    } catch (error) {
      handleAuthFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWithBackend = async (cachedUserData) => {
    try {
      const jwtCookie = getCookie("jwt");

      if (!jwtCookie) {
        // PERBAIKAN: Jika tidak ada cookie tapi ada cached data, tetap gunakan cached data
        // User akan tetap "login" sampai mereka explicitly logout
        if (cachedUserData) {
          return;
        }
        handleAuthFailure();
        return;
      }

      const response = await customAPI.get("/user/verify-token", {
        withCredentials: true,
      });

      if (response.data.success) {
        const userData = response.data.data;

        // Update state dan localStorage dengan data terbaru dari server
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("userData", JSON.stringify(userData));
      } else {
        // PERBAIKAN: Jika verifikasi gagal tapi ada cached data, tetap gunakan cached data
        if (cachedUserData) {
          return;
        }
        handleAuthFailure();
      }
    } catch (error) {
      // PERBAIKAN: Jika error apapun (network, server down, dll) dan ada cached data,
      // tetap gunakan cached data - user tetap login
      if (cachedUserData) {
        return;
      }

      // Hanya logout jika memang tidak ada data sama sekali
      handleAuthFailure();
    }
  };

  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("userData");
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("userData", JSON.stringify(userData));

    const redirectPath = userData.role === "pengurus" ? "/pengurus" : "/";

    return redirectPath;
  };

  const logout = async () => {
    try {
      // Clear frontend state FIRST
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userData");

      // Call backend logout (in background, non-blocking)
      try {
        await customAPI.post("/user/logout", {}, { withCredentials: true });
      } catch (logoutError) {
        // Tidak masalah jika backend logout gagal, yang penting frontend sudah clear
      }

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (error) {
      // Tetap clear state meskipun ada error
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userData");

      return true;
    }
  };

  // Helper functions
  const isPengurus = () => user?.role === "pengurus";
  const isJamaah = () => user?.role === "jamaah";
  const hasRole = (role) => user?.role === role;
  const canAccess = (requiredRole) => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true;
    return user?.role === requiredRole;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    isPengurus,
    isJamaah,
    hasRole,
    canAccess,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
