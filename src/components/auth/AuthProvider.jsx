// components/auth/AuthProvider.jsx - Enhanced untuk pembatasan akses
import React, { createContext, useContext, useState, useEffect } from "react";
import customAPI from "../../api"; // Sesuaikan path

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Enhanced cookie utility
const getCookie = (name) => {
  try {
    console.log(`🍪 Looking for cookie: ${name}`);
    console.log(`🍪 All cookies: ${document.cookie}`);

    if (!document.cookie) {
      console.log(`🍪 No cookies found`);
      return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop().split(";").shift();
      console.log(`🍪 Found ${name} cookie:`, cookieValue ? "YES" : "NO");
      return cookieValue;
    }

    console.log(`🍪 Cookie ${name} not found`);
    return null;
  } catch (error) {
    console.error("🍪 Error getting cookie:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    console.log("🔵 AuthProvider: Initial auth check...");
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("🔵 AuthProvider: Starting auth check");
      setIsLoading(true);

      // Check if JWT cookie exists
      const jwtCookie = getCookie("jwt");

      if (jwtCookie) {
        console.log("✅ JWT Cookie found, verifying with server...");

        try {
          // Verify token with backend
          const response = await customAPI.get("/user/verify-token");

          if (response.data.success) {
            const userData = response.data.data;
            console.log("✅ Token verified, user data:", userData);

            setUser(userData);
            setIsAuthenticated(true);

            // Store user data in localStorage sebagai backup
            localStorage.setItem("userData", JSON.stringify(userData));
          } else {
            console.log("❌ Token verification failed");
            handleAuthFailure();
          }
        } catch (verifyError) {
          console.error("❌ Token verification error:", verifyError);
          handleAuthFailure();
        }
      } else {
        // No cookie, check localStorage sebagai fallback
        console.log("❌ No JWT cookie found, checking localStorage...");

        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log("⚠️ Using localStorage data:", parsedUser);

            // Set user but mark as potentially stale
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error(
              "❌ Error parsing localStorage userData:",
              parseError
            );
            handleAuthFailure();
          }
        } else {
          console.log("❌ No authentication data found");
          handleAuthFailure();
        }
      }
    } catch (error) {
      console.error("❌ Auth check error:", error);
      handleAuthFailure();
    } finally {
      console.log("🔵 Auth check completed");
      setIsLoading(false);
    }
  };

  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("userData");
  };

  // Login function
  const login = (userData) => {
    console.log("🟢 AuthProvider: Login called with:", userData);
    try {
      setUser(userData);
      setIsAuthenticated(true);

      // Store user data in localStorage
      localStorage.setItem("userData", JSON.stringify(userData));
      console.log("📦 User data stored in localStorage");

      // Return redirect path berdasarkan role
      const redirectPath = userData.role === "pengurus" ? "/pengurus" : "/";
      console.log("🔄 Login successful, redirect to:", redirectPath);
      return redirectPath;
    } catch (error) {
      console.error("❌ Login error:", error);
      return "/";
    }
  };

  // Logout function
  const logout = async () => {
    console.log("🔴 AuthProvider: Logout called");
    try {
      // Call backend logout to clear cookie
      try {
        await customAPI.post("/user/logout");
        console.log("✅ Backend logout successful");
      } catch (logoutError) {
        console.error("⚠️ Backend logout error:", logoutError);
        // Continue with frontend logout even if backend fails
      }

      // Clear local state and storage
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userData");
      localStorage.removeItem("userEmail");

      console.log("🔴 Frontend logout completed");
      return "/login";
    } catch (error) {
      console.error("❌ Logout error:", error);
      return "/login";
    }
  };

  // Helper functions untuk role checking
  const isPengurus = () => {
    return user?.role === "pengurus";
  };

  const isJamaah = () => {
    return user?.role === "jamaah";
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const canAccess = (requiredRole) => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true; // No role required, just need to be authenticated
    return user?.role === requiredRole;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    // Helper functions
    isPengurus,
    isJamaah,
    hasRole,
    canAccess,
  };

  console.log("📊 AuthProvider Current State:", {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    userName: user?.name,
    cookieExists: !!getCookie("jwt"),
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
