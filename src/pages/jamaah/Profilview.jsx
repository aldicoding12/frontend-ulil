/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import customAPI from "../../api";

const ProfilView = () => {
  const [mosqueData, setMosqueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const flipbookRef = useRef(null);

  // Effects
  useEffect(() => {
    fetchMosqueProfile();
  }, []);

  // API Functions
  const fetchMosqueProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customAPI.get("/profile");
      const data = response.data.data;

      const enhancedData = {
        ...response.data,
        mosqueName: data.mosqueName || "Masjid",
        founderName: data.founderName || "-",
        establishmentYear: data.establishmentYear || new Date().getFullYear(),
        activeCongregationCount: data.activeCongregationCount || 0,
        vision: data.vision || "Visi sedang dalam penyusunan",
        mission: data.mission || "Misi sedang dalam penyusunan",
        mosqueMotto: data.mosqueMotto || "Membangun Umat, Menguatkan Iman",
        briefHistory: data.briefHistory || "Sejarah sedang dalam dokumentasi",
        fullAddress: data.fullAddress || response.data.streetName || "Alamat",
        logoUrl: data.image || data.mosqueImage || null,
        // Statistik Jamaah - gunakan data dari API atau fallback
        maleCount: data.maleCount || 10,
        femaleCount: data.femaleCount || 10,
        childrenCount: data.childrenCount || 10,
        elderlyCount: data.elderlyCount || 10,
        weeklyAttendance: data.weeklyAttendance || [
          { day: "Sen", count: 20 },
          { day: "Sel", count: 30 },
          { day: "Rab", count: 50 },
          { day: "Kam", count: 70 },
          { day: "Jum", count: 80 },
          { day: "Sab", count: 90 },
          { day: "Min", count: 100 },
        ],
        monthlyGrowth: data.monthlyGrowth || [
          { month: "Jan", jamaah: 100 },
          { month: "Feb", jamaah: 200 },
          { month: "Mar", jamaah: 300 },
          { month: "Apr", jamaah: 700 },
          { month: "Mei", jamaah: 800 },
          { month: "Jun", jamaah: 1000 },
        ],
      };

      setMosqueData(enhancedData);
    } catch (err) {
      setError("Gagal memuat profil masjid");
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, 3));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  // Render Functions
  const renderLoadingState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
        <p className="text-green-700 font-medium text-lg">
          Memuat profil masjid...
        </p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchMosqueProfile}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 font-medium">
          Coba Lagi
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <div className="text-6xl mb-4">🏗️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Profil Masjid Belum Tersedia
        </h3>
        <p className="text-gray-600 mb-6">
          Silakan buat profil masjid terlebih dahulu di halaman pengaturan
        </p>
        <button
          onClick={fetchMosqueProfile}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 font-medium">
          Coba Lagi
        </button>
      </div>
    </div>
  );

  const renderCoverPage = () => (
    <div className="bg-gradient-to-b from-green-600 to-green-700 h-full flex flex-col items-center justify-center text-white p-12 relative overflow-hidden min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-4xl">🕌</div>
        <div className="absolute top-20 right-16 text-3xl">✨</div>
        <div className="absolute bottom-20 left-20 text-3xl">🌙</div>
        <div className="absolute bottom-16 right-12 text-4xl">⭐</div>
      </div>

      <div className="text-center space-y-6 relative z-10">
        {/* Logo/Image */}
        <div className="mb-6">
          {mosqueData.logoUrl ? (
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <img
                src={mosqueData.logoUrl}
                alt={`Logo ${mosqueData.mosqueName}`}
                className="w-full h-full object-contain rounded-full bg-white bg-opacity-20 p-2 shadow-lg"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-6xl rounded-full bg-white bg-opacity-20 shadow-lg hidden">
                🕌
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center text-6xl rounded-full bg-white bg-opacity-20 shadow-lg">
              🕌
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2 tracking-wide">
          {mosqueData.mosqueName}
        </h1>

        {/* Address */}
        <p className="text-lg opacity-90 max-w-md mx-auto leading-relaxed">
          {mosqueData.fullAddress}
        </p>

        {/* Establishment Year */}
        <div className="bg-white bg-opacity-20 rounded-xl p-6 mt-8 backdrop-blur-sm border border-white border-opacity-20">
          <p className="text-sm opacity-80 mb-2 uppercase tracking-wider">
            Didirikan Tahun
          </p>
          <p className="text-3xl font-bold">{mosqueData.establishmentYear}</p>
        </div>

        {/* Motto Preview */}
        <div className="bg-white bg-opacity-10 rounded-xl p-4 mt-6 backdrop-blur-sm border border-white border-opacity-20">
          <p className="text-sm opacity-90 italic">
            "{mosqueData.mosqueMotto}"
          </p>
        </div>
      </div>
    </div>
  );

  const renderHistoryPage = () => (
    <div className="bg-white h-full p-10 min-h-screen">
      <h2 className="text-3xl font-bold text-green-700 border-b-2 border-green-200 pb-4 mb-8">
        Sejarah & Pendiri
      </h2>
      <div className="space-y-6">
        <div className="bg-green-50 p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="font-semibold text-green-800 text-lg mb-3 flex items-center">
            <span className="mr-2">👤</span>
            Pendiri Masjid
          </h3>
          <p className="text-gray-700 text-xl font-medium">
            {mosqueData.founderName}
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-gray-400">
          <h3 className="font-semibold text-gray-800 text-lg mb-3 flex items-center">
            <span className="mr-2">📚</span>
            Sejarah Singkat
          </h3>
          <p className="text-gray-700 leading-relaxed text-justify">
            {mosqueData.briefHistory}
          </p>
        </div>

        {/* Timeline sederhana */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800 text-lg mb-3 flex items-center">
            <span className="mr-2">📅</span>
            Milestone Penting
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="text-gray-700">
                {mosqueData.establishmentYear} - Pendirian Masjid
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="text-gray-700">
                2025 - Jumlah Jamaah: {mosqueData.activeCongregationCount} orang
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisionMissionPage = () => (
    <div className="bg-gray-50 h-full p-10 min-h-screen">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-green-700 border-b-2 border-green-200 pb-4 mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Visi
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-gray-700 leading-relaxed text-justify text-lg">
              {mosqueData.vision}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-green-700 border-b-2 border-green-200 pb-4 mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Misi
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="space-y-3 text-gray-700">
              {mosqueData.mission
                .split("\n")
                .filter((item) => item.trim())
                .map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="leading-relaxed flex-1">
                      {item.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatisticsPage = () => {
    // Hitung total dari data yang ada
    const totalFromCategories =
      mosqueData.maleCount +
      mosqueData.femaleCount +
      mosqueData.childrenCount +
      mosqueData.elderlyCount;

    // Gunakan total yang lebih besar atau yang ada di database
    const displayTotal = Math.max(
      mosqueData.activeCongregationCount,
      totalFromCategories
    );

    const genderData = [
      { name: "Laki-laki", value: mosqueData.maleCount, color: "#10b981" },
      { name: "Perempuan", value: mosqueData.femaleCount, color: "#3b82f6" },
      { name: "Anak-anak", value: mosqueData.childrenCount, color: "#f59e0b" },
      { name: "Lansia", value: mosqueData.elderlyCount, color: "#ef4444" },
    ].filter((item) => item.value > 0); // Hanya tampilkan yang memiliki data

    return (
      <div className="bg-white h-full p-10 min-h-screen">
        <h2 className="text-3xl font-bold text-green-700 border-b-2 border-green-200 pb-4 mb-8 flex items-center">
          <span className="mr-3">📊</span>
          Statistik & Data Jamaah
        </h2>

        {/* Motto */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <span className="mr-2">💫</span>
            Motto Masjid
          </h3>
          <p className="text-xl italic text-center">
            "{mosqueData.mosqueMotto}"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Total Jamaah */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-800 text-lg mb-3 flex items-center">
              <span className="mr-2">👥</span>
              Total Jamaah Aktif
            </h3>
            <div className="text-center bg-white p-4 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-blue-600">{displayTotal}</p>
              <p className="text-blue-500">orang</p>
            </div>
          </div>

          {/* Demografis Jamaah */}
          {genderData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="font-semibold text-green-800 text-lg mb-4 flex items-center">
                <span className="mr-2">👥</span>
                Demografis Jamaah
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value">
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {genderData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kehadiran Mingguan - hanya tampilkan jika ada data */}
          {mosqueData.weeklyAttendance.some((item) => item.count > 0) && (
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-800 text-lg mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Kehadiran Mingguan
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mosqueData.weeklyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pertumbuhan Bulanan - hanya tampilkan jika ada data */}
          {mosqueData.monthlyGrowth.some((item) => item.jamaah > 0) && (
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-800 text-lg mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Pertumbuhan Jamaah
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mosqueData.monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="jamaah"
                      stroke="#f97316"
                      fill="#fed7aa"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pesan jika tidak ada data statistik */}
          {genderData.length === 0 &&
            !mosqueData.weeklyAttendance.some((item) => item.count > 0) &&
            !mosqueData.monthlyGrowth.some((item) => item.jamaah > 0) && (
              <div className="col-span-full bg-gray-50 p-8 rounded-lg text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Data Statistik Belum Tersedia
                </h3>
                <p className="text-gray-500">
                  Silakan lengkapi data statistik jamaah di halaman pengaturan
                </p>
              </div>
            )}
        </div>
      </div>
    );
  };

  // Navigation component
  const Navigation = () => (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white shadow-lg rounded-full px-6 py-3 flex items-center space-x-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`p-2 rounded-full transition-colors ${
            currentPage === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-green-600 hover:bg-green-100"
          }`}>
          ←
        </button>

        <div className="flex space-x-2">
          {[0, 1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentPage === page ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === 3}
          className={`p-2 rounded-full transition-colors ${
            currentPage === 3
              ? "text-gray-300 cursor-not-allowed"
              : "text-green-600 hover:bg-green-100"
          }`}>
          →
        </button>
      </div>
    </div>
  );

  // Main render logic
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!mosqueData) return renderEmptyState();

  const pages = [
    renderCoverPage(),
    renderHistoryPage(),
    renderVisionMissionPage(),
    renderStatisticsPage(),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-extrabold text-green-800 mb-2 flex items-center justify-center gap-3">
          {mosqueData?.logoUrl ? (
            <img
              src={mosqueData.logoUrl}
              alt="Logo Masjid"
              className="w-12 h-12 object-contain rounded-full bg-green-100 p-1 shadow-md"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "inline-block";
              }}
            />
          ) : null}
          <span className={mosqueData?.logoUrl ? "hidden" : "inline-block"}>
            🕌
          </span>
          Profil Masjid Digital
        </h1>
        <p className="text-green-600 text-lg font-medium">
          Informasi lengkap dan statistik jamaah
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto mt-3 rounded-full"></div>
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {pages[currentPage]}
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default ProfilView;
