import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  Upload,
  RefreshCw,
  AlertCircle,
  Calendar,
  Tag,
  MoreVertical,
  Save,
} from "lucide-react";
import customAPI from "../../../api";

function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    fetchGalleries();
    fetchCategories();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await customAPI.get("/galeri");
      let galleryData = [];
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data.galleries)) {
          galleryData = response.data.data.galleries;
        } else if (Array.isArray(response.data.data)) {
          galleryData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        galleryData = response.data;
      }
      setGalleries(galleryData);
      setError(null);
    } catch (err) {
      console.error("Error fetching galleries:", err);
      setError("Gagal memuat data galeri");
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await customAPI.get("/galeri/categories");
      let categoryData = [];
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data.categories)) {
          categoryData = response.data.data.categories;
        } else if (Array.isArray(response.data.data)) {
          categoryData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        categoryData = response.data;
      }
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Maksimal 10 gambar dapat diupload sekaligus");
      return;
    }
    setSelectedFiles(files);
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(previews).then((images) => {
      setPreviewImages(images);
    });
  };

  const removePreviewImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const getImageUrl = (image) => {
    if (typeof image === "string") return image;
    if (image && typeof image === "object") {
      return image.full || image.thumb || "";
    }
    return "";
  };

  const openModal = (mode, gallery = null) => {
    setModalMode(mode);
    setSelectedGallery(gallery);
    if (mode === "add") {
      setFormData({
        title: "",
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedFiles([]);
      setPreviewImages([]);
      setExistingImages([]);
    } else if (mode === "edit" && gallery) {
      setFormData({
        title: gallery.title || "",
        description: gallery.description || "",
        category: gallery.category || "",
        date: gallery.date
          ? new Date(gallery.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
      const imageUrls = gallery.images
        ? gallery.images.map((img) => getImageUrl(img))
        : [];
      setExistingImages(imageUrls);
      setSelectedFiles([]);
      setPreviewImages([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGallery(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedFiles([]);
    setPreviewImages([]);
    setExistingImages([]);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.description) {
      alert("Judul, kategori, dan deskripsi wajib diisi!");
      return;
    }
    if (modalMode === "add" && selectedFiles.length === 0) {
      alert("Minimal 1 gambar harus diupload!");
      return;
    }
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("date", formData.date);
      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });
      if (modalMode === "edit") {
        formDataToSend.append("existingImages", JSON.stringify(existingImages));
      }
      let response;
      if (modalMode === "add") {
        response = await customAPI.post("/galeri", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (modalMode === "edit") {
        response = await customAPI.put(
          `/galeri/${selectedGallery._id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      if (response.data) {
        await fetchGalleries();
        closeModal();
        setError(null);
        alert(
          modalMode === "add"
            ? "Galeri berhasil ditambahkan!"
            : "Galeri berhasil diperbarui!"
        );
      }
    } catch (err) {
      console.error("Error saving gallery:", err);
      setError(err.response?.data?.message || "Gagal menyimpan galeri");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await customAPI.delete(`/galeri/${selectedGallery._id}`);
      await fetchGalleries();
      closeModal();
      setError(null);
      alert("Galeri berhasil dihapus!");
    } catch (err) {
      console.error("Error deleting gallery:", err);
      setError(err.response?.data?.message || "Gagal menghapus galeri");
    } finally {
      setLoading(false);
    }
  };

  const filteredGalleries = Array.isArray(galleries)
    ? galleries.filter((gallery) => {
        const matchesSearch =
          gallery.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gallery.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          filterCategory === "all" || gallery.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGalleries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredGalleries.length / itemsPerPage);

  const getCategoryColor = (category) => {
    const colors = {
      Kegiatan: "bg-blue-100 text-blue-800 border-blue-200",
      Pembelajaran: "bg-green-100 text-green-800 border-green-200",
      Prestasi: "bg-purple-100 text-purple-800 border-purple-200",
      Fasilitas: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Manajemen Galeri
          </h3>
          <p className="text-gray-600 mt-1">
            Kelola foto dan dokumentasi kegiatan masjid
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Galeri
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="all">Semua Kategori</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={fetchGalleries}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            <span className="text-gray-600">Memuat data galeri...</span>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterCategory !== "all"
              ? "Tidak Ada Galeri Ditemukan"
              : "Belum Ada Galeri"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterCategory !== "all"
              ? "Coba ubah kriteria pencarian atau filter"
              : "Tambahkan galeri pertama untuk dokumentasi kegiatan masjid"}
          </p>
          {!searchTerm && filterCategory === "all" && (
            <button
              onClick={() => openModal("add")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              Tambah Galeri Pertama
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((gallery) => (
              <div
                key={gallery._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {gallery.images && gallery.images.length > 0 ? (
                    <img
                      src={getImageUrl(gallery.images[0])}
                      alt={gallery.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {gallery.images && gallery.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                      +{gallery.images.length - 1} foto
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {gallery.title}
                    </h4>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {gallery.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                        gallery.category
                      )}`}>
                      <Tag className="w-3 h-3" />
                      {gallery.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {gallery.date
                        ? new Date(gallery.date).toLocaleDateString("id-ID")
                        : ""}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openModal("view", gallery)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                    <button
                      onClick={() => openModal("edit", gallery)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => openModal("delete", gallery)}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                Menampilkan {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredGalleries.length)} dari{" "}
                {filteredGalleries.length} galeri
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === "add" && "Tambah Galeri Baru"}
                  {modalMode === "edit" && "Edit Galeri"}
                  {modalMode === "view" && "Detail Galeri"}
                  {modalMode === "delete" && "Hapus Galeri"}
                </h3>
                <button
                  onClick={closeModal}
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
                    Hapus Galeri
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Apakah Anda yakin ingin menghapus galeri{" "}
                    <span className="font-semibold">
                      {selectedGallery?.title}
                    </span>
                    ? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Batal
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50">
                      {loading ? "Menghapus..." : "Hapus Galeri"}
                    </button>
                  </div>
                </div>
              ) : modalMode === "view" ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedGallery?.title}
                    </h4>
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                          selectedGallery?.category
                        )}`}>
                        <Tag className="w-4 h-4" />
                        {selectedGallery?.category}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {selectedGallery?.date
                          ? new Date(selectedGallery.date).toLocaleDateString(
                              "id-ID",
                              { year: "numeric", month: "long", day: "numeric" }
                            )
                          : ""}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedGallery?.description}
                    </p>
                  </div>

                  {selectedGallery?.images &&
                    selectedGallery.images.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          Foto ({selectedGallery.images.length})
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedGallery.images.map((image, index) => (
                            <img
                              key={index}
                              src={getImageUrl(image)}
                              alt={`${selectedGallery.title} ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() =>
                                window.open(getImageUrl(image), "_blank")
                              }
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Judul *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Masukkan judul galeri"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="">Pilih Kategori</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan deskripsi galeri"
                    />
                  </div>

                  {modalMode === "edit" && existingImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Yang Ada
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Existing ${index}`}
                              className="w-full h-24 object-cover rounded border border-gray-200"
                            />
                            <button
                              onClick={() => removeExistingImage(image)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {modalMode === "add" ? "Upload Foto *" : "Tambah Foto"}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="gallery-upload"
                      />
                      <label
                        htmlFor="gallery-upload"
                        className="cursor-pointer flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900">
                        <Upload className="w-8 h-8" />
                        <span className="text-sm font-medium">
                          Pilih atau drag gambar disini
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG hingga 5MB per file (Maksimal 10 foto)
                        </span>
                      </label>
                    </div>

                    {/* Preview New Images */}
                    {previewImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              className="w-full h-24 object-cover rounded border border-gray-200"
                            />
                            <button
                              onClick={() => removePreviewImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>* = Field wajib diisi</p>
                  </div>
                </div>
              )}
            </div>

            {modalMode !== "delete" && modalMode !== "view" && (
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {modalMode === "add" ? "Tambah Galeri" : "Simpan Perubahan"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryManagement;
