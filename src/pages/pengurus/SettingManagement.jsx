/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Globe,
  Shield,
  ChevronRight,
  Edit2,
  Save,
  X,
  Camera,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Info,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";
import customAPI from "../../api";

function SettingManagement() {
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState("overview");

  // State untuk loading
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  // State untuk profile masjid dari database
  const [profileData, setProfileData] = useState(null);

  // State untuk users - DIPERBAIKI: pastikan selalu array
  const [users, setUsers] = useState([]);

  // State untuk modal edit profile
  const [editModal, setEditModal] = useState({
    isOpen: false,
    data: null,
  });

  // State untuk modal user
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);

  // State untuk filter dan search user
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // State untuk form data user
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "jamaah",
  });

  // State untuk upload file
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch profile data saat component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch users when user management tab is active
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await customAPI.get("/profile");
      if (response.data && response.data.data) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 404) {
        setProfileData(null);
      } else {
        setError("Gagal memuat data profil masjid");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  // DIPERBAIKI: Perbaiki API endpoint dan pastikan response selalu array
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      // PERBAIKAN: Ganti endpoint dari "/user/geAlltUser" ke "/user"
      const response = await customAPI.get("/user");

      // PERBAIKAN: Pastikan data selalu berupa array
      let userData = [];
      if (response.data && response.data.data) {
        if (response.data.data.users) {
          // Jika response memiliki struktur { data: { users: [...] } }
          userData = Array.isArray(response.data.data.users)
            ? response.data.data.users
            : [];
        } else if (Array.isArray(response.data.data)) {
          // Jika response memiliki struktur { data: [...] }
          userData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        // Jika response langsung array
        userData = response.data;
      }

      setUsers(userData);
      setError(null); // Clear error jika berhasil
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Gagal memuat data user");
      setUsers([]); // PERBAIKAN: Set sebagai array kosong saat error
    } finally {
      setUserLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditProfile = () => {
    if (profileData) {
      setEditModal({
        isOpen: true,
        data: { ...profileData },
      });
    } else {
      setEditModal({
        isOpen: true,
        data: {
          mosqueName: "",
          fullAddress: "",
          streetName: "",
          establishmentYear: new Date().getFullYear(),
          founderName: "",
          briefHistory: "",
          vision: "",
          mission: "",
          mosqueMotto: "",
          activeCongregationCount: 0,
        },
      });
    }
    setSelectedFile(null);
    setPreviewImage(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (
      !editModal.data.mosqueName ||
      !editModal.data.fullAddress ||
      !editModal.data.streetName ||
      !editModal.data.founderName
    ) {
      alert(
        "Nama masjid, alamat lengkap, nama jalan, dan nama pendiri wajib diisi!"
      );
      return;
    }

    if (!profileData && !selectedFile) {
      alert("Logo masjid wajib diupload untuk profil masjid baru!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      Object.keys(editModal.data).forEach((key) => {
        if (editModal.data[key] !== null && editModal.data[key] !== undefined) {
          formData.append(key, editModal.data[key]);
        }
      });

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      let response;
      if (profileData) {
        response = await customAPI.put(
          `/profile/${profileData._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await customAPI.post("/profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data && response.data.data) {
        setProfileData(response.data.data);
        setEditModal({ isOpen: false, data: null });
        setSelectedFile(null);
        setPreviewImage(null);
        alert(
          profileData
            ? "Profil masjid berhasil diperbarui!"
            : "Profil masjid berhasil dibuat!"
        );
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error.response?.data?.message || "Gagal menyimpan data profil");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setEditModal({ isOpen: false, data: null });
    setSelectedFile(null);
    setPreviewImage(null);
  };

  // User Management Functions - DIPERBAIKI: Tambahkan validasi array
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesRole;
      })
    : [];

  const indexOfLastUser = userCurrentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const openUserModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (mode === "add") {
      setUserFormData({ name: "", email: "", password: "", role: "jamaah" });
    } else if (mode === "edit" && user) {
      setUserFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "jamaah",
      });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserFormData({ name: "", email: "", password: "", role: "jamaah" });
  };

  // DIPERBAIKI: Perbaiki endpoint untuk user operations
  const handleUserSubmit = async () => {
    try {
      if (modalMode === "add") {
        // PERBAIKAN: Gunakan endpoint yang sesuai dari backend
        await customAPI.post("/user/register", userFormData);
      } else if (modalMode === "edit") {
        const updateData = { ...userFormData };
        if (!updateData.password) delete updateData.password;
        await customAPI.put(`/user/${selectedUser._id}`, updateData);
      }
      await fetchUsers();
      closeUserModal();
      setError(null);
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.message || "Gagal menyimpan data user");
    }
  };

  const handleUserDelete = async () => {
    try {
      await customAPI.delete(`/user/${selectedUser._id}`);
      await fetchUsers();
      closeUserModal();
      setError(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Gagal menghapus user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "pengurus":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "jamaah":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "pengurus":
        return "👑";
      case "jamaah":
        return "👤";
      default:
        return "❓";
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pengaturan Aplikasi
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola profil masjid dan manajemen pengguna
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={activeTab === "users" ? fetchUsers : fetchProfile}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => handleTabChange("overview")}
              className={`flex-shrink-0 flex items-center justify-center gap-3 py-4 px-6 font-medium transition-colors border-b-2 ${
                activeTab === "overview"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}>
              <Settings className="w-5 h-5" />
              Ringkasan
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex-shrink-0 flex items-center justify-center gap-3 py-4 px-6 font-medium transition-colors border-b-2 ${
                activeTab === "profile"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}>
              <Building2 className="w-5 h-5" />
              Profil Masjid
            </button>
            <button
              onClick={() => handleTabChange("users")}
              className={`flex-shrink-0 flex items-center justify-center gap-3 py-4 px-6 font-medium transition-colors border-b-2 ${
                activeTab === "users"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}>
              <Users className="w-5 h-5" />
              Manajemen User
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleTabChange("profile")}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Profil Masjid
                      </div>
                      <div className="text-sm text-gray-600">
                        {profileData
                          ? "Edit informasi masjid"
                          : "Buat profil masjid"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </button>
                <button
                  onClick={() => handleTabChange("users")}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Manajemen User
                      </div>
                      <div className="text-sm text-gray-600">
                        Kelola pengguna aplikasi
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Informasi Sistem
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status Profil</span>
                  {profileData ? (
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Sudah Ada
                    </span>
                  ) : (
                    <span className="font-semibold text-orange-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Belum Ada
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total User</span>
                  <span className="font-semibold text-gray-900">
                    {Array.isArray(users) ? users.length : 0} user
                  </span>
                </div>
                {profileData && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Tahun Berdiri</span>
                      <span className="font-semibold text-gray-900">
                        {profileData.establishmentYear}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Jumlah Jamaah Aktif</span>
                      <span className="font-semibold text-gray-900">
                        {profileData.activeCongregationCount || 0} orang
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Statistik User
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Pengurus</span>
                  <span className="font-semibold text-purple-600">
                    {Array.isArray(users)
                      ? users.filter((u) => u.role === "pengurus").length
                      : 0}{" "}
                    orang
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Jamaah</span>
                  <span className="font-semibold text-green-600">
                    {Array.isArray(users)
                      ? users.filter((u) => u.role === "jamaah").length
                      : 0}{" "}
                    orang
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            {profileData && (
              <div className="lg:col-span-2 xl:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  Ringkasan Profil Masjid
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {profileData.mosqueName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {profileData.fullAddress}
                    </p>
                    <p className="text-sm text-gray-700 text-justify leading-relaxed">
                      {profileData.briefHistory}
                    </p>
                  </div>
                  {profileData.image && (
                    <div className="flex justify-center">
                      <img
                        src={profileData.image}
                        alt="Logo Masjid"
                        className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Profil Masjid
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {profileData
                      ? "Informasi lengkap tentang masjid"
                      : "Belum ada profil masjid"}
                  </p>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                  <Edit2 className="w-4 h-4" />
                  {profileData ? "Edit Profil" : "Buat Profil"}
                </button>
              </div>
            </div>

            {profileData ? (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-green-600" />
                        Informasi Dasar
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Masjid
                          </label>
                          <p className="text-gray-900 font-medium">
                            {profileData.mosqueName}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat Lengkap
                          </label>
                          <p className="text-gray-900">
                            {profileData.fullAddress}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Jalan
                          </label>
                          <p className="text-gray-900">
                            {profileData.streetName}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tahun Berdiri
                            </label>
                            <p className="text-gray-900">
                              {profileData.establishmentYear}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jumlah Jamaah Aktif
                            </label>
                            <p className="text-gray-900">
                              {profileData.activeCongregationCount || 0} orang
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Pendiri
                          </label>
                          <p className="text-gray-900">
                            {profileData.founderName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vision, Mission & History */}
                  <div className="space-y-6">
                    {profileData.image && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-purple-600" />
                          Logo Masjid
                        </h4>
                        <div className="flex justify-center">
                          <img
                            src={profileData.image}
                            alt="Logo Masjid"
                            className="w-48 h-48 object-contain rounded-lg border border-gray-200"
                          />
                        </div>
                      </div>
                    )}

                    {profileData.briefHistory && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-600" />
                          Sejarah Singkat
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-justify">
                          {profileData.briefHistory}
                        </p>
                      </div>
                    )}

                    {profileData.vision && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Visi
                        </h4>
                        <p className="text-gray-700 text-justify leading-relaxed">
                          {profileData.vision}
                        </p>
                      </div>
                    )}

                    {profileData.mission && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Misi
                        </h4>
                        <div className="text-gray-700">
                          {profileData.mission
                            .split("\n")
                            .filter((item) => item.trim()).length > 1 ? (
                            <ol className="list-decimal list-inside space-y-2">
                              {profileData.mission
                                .split("\n")
                                .filter((item) => item.trim())
                                .map((item, index) => (
                                  <li
                                    key={index}
                                    className="leading-relaxed text-justify">
                                    {item.trim()}
                                  </li>
                                ))}
                            </ol>
                          ) : (
                            <p className="text-justify leading-relaxed">
                              {profileData.mission}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {profileData.mosqueMotto && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Motto Masjid
                        </h4>
                        <p className="text-gray-700 italic">
                          "{profileData.mosqueMotto}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Profil Masjid
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Buat profil masjid untuk melengkapi informasi aplikasi
                  </p>
                  <button
                    onClick={handleEditProfile}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors mx-auto">
                    <Building2 className="w-5 h-5" />
                    Buat Profil Masjid
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manajemen User
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Kelola pengguna aplikasi masjid
                  </p>
                </div>
                <button
                  onClick={() => openUserModal("add")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Tambah User
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau email user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="all">Semua Role</option>
                    <option value="pengurus">Pengurus</option>
                    <option value="jamaah">Jamaah</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="p-6">
              {userLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                    <span className="text-gray-600">Memuat data user...</span>
                  </div>
                </div>
              ) : currentUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterRole !== "all"
                      ? "Tidak Ada User Ditemukan"
                      : "Belum Ada User"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterRole !== "all"
                      ? "Coba ubah kriteria pencarian atau filter"
                      : "Tambahkan user pertama untuk mulai mengelola pengguna"}
                  </p>
                  {!searchTerm && filterRole === "all" && (
                    <button
                      onClick={() => openUserModal("add")}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors mx-auto">
                      <Plus className="w-5 h-5" />
                      Tambah User Pertama
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Users Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {currentUsers.map((user) => (
                      <div
                        key={user._id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {user.name || "Tidak ada nama"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {user.email || "Tidak ada email"}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => {
                                const dropdown = document.getElementById(
                                  `dropdown-${user._id}`
                                );
                                dropdown.classList.toggle("hidden");
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div
                              id={`dropdown-${user._id}`}
                              className="hidden absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => {
                                  document
                                    .getElementById(`dropdown-${user._id}`)
                                    .classList.add("hidden");
                                  openUserModal("view", user);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                                <Eye className="w-4 h-4" />
                                Lihat
                              </button>
                              <button
                                onClick={() => {
                                  document
                                    .getElementById(`dropdown-${user._id}`)
                                    .classList.add("hidden");
                                  openUserModal("edit", user);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  document
                                    .getElementById(`dropdown-${user._id}`)
                                    .classList.add("hidden");
                                  openUserModal("delete", user);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                                <Trash2 className="w-4 h-4" />
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                              user.role
                            )}`}>
                            <span>{getRoleIcon(user.role)}</span>
                            {user.role === "pengurus" ? "Pengurus" : "Jamaah"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "id-ID"
                                )
                              : "Tidak diketahui"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600">
                        Menampilkan {indexOfFirstUser + 1}-
                        {Math.min(indexOfLastUser, filteredUsers.length)} dari{" "}
                        {filteredUsers.length} user
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setUserCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={userCurrentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                          Sebelumnya
                        </button>
                        <span className="text-sm text-gray-600">
                          Halaman {userCurrentPage} dari {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setUserCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={userCurrentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profileData ? "Edit Profil Masjid" : "Buat Profil Masjid"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Masjid *
                    </label>
                    <input
                      type="text"
                      value={editModal.data?.mosqueName || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, mosqueName: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan nama masjid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      value={editModal.data?.fullAddress || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, fullAddress: e.target.value },
                        }))
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan alamat lengkap masjid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Jalan *
                    </label>
                    <input
                      type="text"
                      value={editModal.data?.streetName || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, streetName: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan nama jalan"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Berdiri *
                      </label>
                      <input
                        type="number"
                        value={
                          editModal.data?.establishmentYear ||
                          new Date().getFullYear()
                        }
                        onChange={(e) =>
                          setEditModal((prev) => ({
                            ...prev,
                            data: {
                              ...prev.data,
                              establishmentYear: parseInt(e.target.value),
                            },
                          }))
                        }
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tahun"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Jamaah Aktif
                      </label>
                      <input
                        type="number"
                        value={editModal.data?.activeCongregationCount || 0}
                        onChange={(e) =>
                          setEditModal((prev) => ({
                            ...prev,
                            data: {
                              ...prev.data,
                              activeCongregationCount:
                                parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Jumlah jamaah"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pendiri *
                    </label>
                    <input
                      type="text"
                      value={editModal.data?.founderName || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, founderName: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan nama pendiri"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sejarah Singkat
                    </label>
                    <textarea
                      value={editModal.data?.briefHistory || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, briefHistory: e.target.value },
                        }))
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ceritakan sejarah singkat masjid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visi
                    </label>
                    <textarea
                      value={editModal.data?.vision || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, vision: e.target.value },
                        }))
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan visi masjid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Misi
                    </label>
                    <textarea
                      value={editModal.data?.mission || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, mission: e.target.value },
                        }))
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan misi masjid (pisahkan setiap poin misi dengan enter/baris baru)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Tulis setiap poin misi di baris terpisah untuk
                      tampilan bernomor otomatis
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motto Masjid
                    </label>
                    <input
                      type="text"
                      value={editModal.data?.mosqueMotto || ""}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, mosqueMotto: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan motto masjid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo Masjid {!profileData && "*"}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900">
                        {previewImage ? (
                          <div className="text-center">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-32 h-32 object-contain mx-auto mb-2 rounded-lg border border-gray-200"
                            />
                            <span className="text-sm">
                              Klik untuk mengganti gambar
                            </span>
                          </div>
                        ) : profileData?.image ? (
                          <div className="text-center">
                            <img
                              src={profileData.image}
                              alt="Current Logo"
                              className="w-32 h-32 object-contain mx-auto mb-2 rounded-lg border border-gray-200"
                            />
                            <span className="text-sm">
                              Klik untuk mengganti gambar
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8" />
                            <span className="text-sm">Upload Logo Masjid</span>
                            <span className="text-xs text-gray-500">
                              PNG, JPG hingga 5MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <p>* = Field wajib diisi</p>
                {!profileData && (
                  <p className="text-orange-600 mt-1">
                    Logo masjid wajib diupload untuk profil baru
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {profileData ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === "add" && "Tambah User Baru"}
                  {modalMode === "edit" && "Edit User"}
                  {modalMode === "view" && "Detail User"}
                  {modalMode === "delete" && "Hapus User"}
                </h3>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {modalMode === "delete" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Hapus User
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Apakah Anda yakin ingin menghapus user{" "}
                    <span className="font-semibold">{selectedUser?.name}</span>?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={closeUserModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Batal
                    </button>
                    <button
                      onClick={handleUserDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      Hapus User
                    </button>
                  </div>
                </div>
              ) : modalMode === "view" ? (
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                      {selectedUser?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedUser?.name || "Tidak ada nama"}
                    </h4>
                    <p className="text-gray-600">
                      {selectedUser?.email || "Tidak ada email"}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getRoleColor(
                        selectedUser?.role
                      )}`}>
                      <span>{getRoleIcon(selectedUser?.role)}</span>
                      {selectedUser?.role === "pengurus"
                        ? "Pengurus"
                        : "Jamaah"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Bergabung
                      </label>
                      <p className="text-gray-900">
                        {selectedUser?.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Tidak diketahui"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={userFormData.name}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password{" "}
                      {modalMode === "edit"
                        ? "(kosongkan jika tidak ingin mengubah)"
                        : "*"}
                    </label>
                    <input
                      type="password"
                      value={userFormData.password}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="jamaah">Jamaah</option>
                      <option value="pengurus">Pengurus</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {modalMode !== "delete" && modalMode !== "view" && (
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={handleUserSubmit}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  {modalMode === "add" ? "Tambah User" : "Simpan Perubahan"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingManagement;
