import React, { useState, useMemo, useCallback, useEffect } from "react";
import CostumAPI from "../../api";

function Galeri() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "Semua",
    "Kegiatan",
    "Pembelajaran",
    "Prestasi",
    "Fasilitas",
  ];

  // Fetch galeri data from API
  useEffect(() => {
    fetchGaleriData();
  }, [selectedCategory]);

  const fetchGaleriData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params =
        selectedCategory !== "Semua" ? { category: selectedCategory } : {};
      const response = await CostumAPI.get("/galeri", { params });

      // Transform data to match frontend structure
      const transformedData = response.data.data.map((item) => ({
        id: item._id,
        images: item.images,
        title: item.title,
        description: item.description,
        category: item.category,
        date: new Date(item.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));

      setGalleryItems(transformedData);
    } catch (err) {
      console.error("Error fetching galeri:", err);
      setError("Gagal memuat data galeri. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return galleryItems;
  }, [galleryItems]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleImageClick = useCallback((item) => {
    setSelectedImage(item);
    document.body.style.overflow = "hidden";
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  }, []);

  const handleImageLoad = useCallback((id) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleNextImage = useCallback((itemId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % totalImages,
    }));
  }, []);

  const handlePrevImage = useCallback((itemId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + totalImages) % totalImages,
    }));
  }, []);

  const handleModalNext = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = currentImageIndex[selectedImage.id] || 0;
    const nextIndex = (currentIndex + 1) % selectedImage.images.length;
    setCurrentImageIndex((prev) => ({
      ...prev,
      [selectedImage.id]: nextIndex,
    }));
  }, [selectedImage, currentImageIndex]);

  const handleModalPrev = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = currentImageIndex[selectedImage.id] || 0;
    const prevIndex =
      (currentIndex - 1 + selectedImage.images.length) %
      selectedImage.images.length;
    setCurrentImageIndex((prev) => ({
      ...prev,
      [selectedImage.id]: prevIndex,
    }));
  }, [selectedImage, currentImageIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Galeri Kami</h1>
            <p className="text-xl md:text-2xl text-green-100">
              Dokumentasi Kegiatan dan Prestasi Ulil Albab
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 text-lg font-semibold mb-4">{error}</p>
            <button
              onClick={fetchGaleriData}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200">
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="container mx-auto px-4 py-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Belum ada galeri untuk kategori ini
            </p>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const currentIndex = currentImageIndex[item.id] || 0;
              const currentImage = item.images[currentIndex];
              const hasMultipleImages = item.images.length > 1;

              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleImageClick(item)}>
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    {!imageLoaded[`${item.id}-${currentIndex}`] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={currentImage.thumb}
                      alt={`${item.title} - ${currentIndex + 1}`}
                      loading="lazy"
                      onLoad={() =>
                        handleImageLoad(`${item.id}-${currentIndex}`)
                      }
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded[`${item.id}-${currentIndex}`]
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />

                    {/* Navigation Arrows - Only show if multiple images */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={(e) =>
                            handlePrevImage(item.id, item.images.length, e)
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          aria-label="Previous image">
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
                        <button
                          onClick={(e) =>
                            handleNextImage(item.id, item.images.length, e)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          aria-label="Next image">
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
                      </>
                    )}

                    {/* Image Counter */}
                    {hasMultipleImages && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentIndex + 1} / {item.images.length}
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {item.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}>
          <button
            className="absolute top-4 right-4 text-white hover:text-green-400 transition-colors duration-200 z-10"
            onClick={handleCloseModal}
            aria-label="Close">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={
                  selectedImage.images[currentImageIndex[selectedImage.id] || 0]
                    .full
                }
                alt={`${selectedImage.title} - ${
                  (currentImageIndex[selectedImage.id] || 0) + 1
                }`}
                className="w-full h-96 object-cover"
                loading="eager"
              />

              {/* Modal Navigation */}
              {selectedImage.images.length > 1 && (
                <>
                  <button
                    onClick={handleModalPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-colors duration-200"
                    aria-label="Previous image">
                    <svg
                      className="w-6 h-6"
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
                  <button
                    onClick={handleModalNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-colors duration-200"
                    aria-label="Next image">
                    <svg
                      className="w-6 h-6"
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

                  {/* Modal Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {(currentImageIndex[selectedImage.id] || 0) + 1} /{" "}
                    {selectedImage.images.length}
                  </div>
                </>
              )}
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {selectedImage.category}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {selectedImage.date}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedImage.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Galeri;
