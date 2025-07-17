import React, { useState, useEffect } from "react";
import costumAPI from "../../api";

function BeritaView() {
  const [berita, setBerita] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const getBerita = async () => {
    try {
      const { data } = await costumAPI.get("/news");
      const sortedBerita = data.data.sort(
        (a, b) =>
          new Date(b.createdAt || b.tanggal) -
          new Date(a.createdAt || a.tanggal)
      );
      setBerita(sortedBerita);
      setTimeout(() => setIsLoading(false), 100);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBerita();
  }, []);

  // Filter dan pagination logic
  const filteredBerita = berita.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBerita.length / itemsPerPage);
  const currentItems = filteredBerita.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="w-full h-56 bg-gray-300"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-spin"
            style={{ animationDuration: "20s" }}
          />
          <div
            className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-spin"
            style={{ animationDuration: "15s", animationDirection: "reverse" }}
          />
        </div>

        <div className="hero-content text-center relative z-10">
          <div className="max-w-md">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              📰 BERITA
              <span className="block text-green-200 mt-2 relative">
                TERKINI
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full mt-2"></div>
              </span>
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Ikuti perkembangan kegiatan dan informasi terkini dari Masjid Ulil
              Albab
            </p>

            {/* Search Bar */}
            <div className="form-control w-full max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari berita..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="input w-full px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-6 h-6 text-white/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Results Info */}
        <div className="text-center mb-8">
          {searchTerm ? (
            <p className="text-gray-600 text-lg">
              Menampilkan {filteredBerita.length} hasil untuk "
              <span className="font-semibold text-green-600">{searchTerm}</span>
              "
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 text-lg">
                Menampilkan {currentItems.length} dari {filteredBerita.length}{" "}
                berita terkini
              </p>
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <span>
                  Halaman {currentPage} dari {totalPages}
                </span>
                {totalPages > 1 && (
                  <>
                    <span>•</span>
                    <span>{itemsPerPage} berita per halaman</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Berita Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((item, index) => (
                <div
                  key={item._id || index}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
                  <figure className="relative overflow-hidden h-56">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&h=300&fit=crop"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      📅 {item.tanggal}
                    </div>
                    {index < 3 && !searchTerm && currentPage === 1 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        BARU
                      </div>
                    )}
                  </figure>

                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {item.content?.substring(0, 150)}...
                    </p>
                    <div className="flex justify-end">
                      <a
                        href={`/berita/${item._id}`}
                        className="group/btn inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-all duration-300">
                        <span>Baca Selengkapnya</span>
                        <svg
                          className="w-4 h-4 transform transition-transform duration-300 group-hover/btn:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Bottom Highlight */}
                  <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-md hover:shadow-lg"
                  }`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === i + 1
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-md hover:shadow-lg"
                    }`}
                    onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-md hover:shadow-lg"
                  }`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredBerita.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">
                  {searchTerm ? "Berita tidak ditemukan" : "Belum ada berita"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Coba kata kunci lain"
                    : "Berita akan segera hadir"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 z-50">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}

export default BeritaView;
