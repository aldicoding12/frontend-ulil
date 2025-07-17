import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Loader,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
} from "lucide-react";

// Simple Text Editor Component
const SimpleTextEditor = ({
  value,
  onChange,
  placeholder = "Tulis konten...",
  disabled = false,
}) => {
  const textareaRef = React.useRef(null);

  const insertText = (before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => insertText("**", "**");
  const handleItalic = () => insertText("*", "*");
  const handleUnorderedList = () => insertText("\n- ");
  const handleOrderedList = () => insertText("\n1. ");
  const handleLink = () => {
    const url = prompt("Masukkan URL:");
    if (url) {
      insertText(`[link](${url})`);
    }
  };
  const handleImage = () => {
    const url = prompt("Masukkan URL gambar:");
    if (url) {
      insertText(`![gambar](${url})`);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={handleBold}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bold">
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Italic">
          <Italic size={16} />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={handleUnorderedList}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bullet List">
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Numbered List">
          <ListOrdered size={16} />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={handleLink}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Insert Link">
          <Link size={16} />
        </button>
        <button
          type="button"
          onClick={handleImage}
          disabled={disabled}
          className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Insert Image">
          <Image size={16} />
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-[300px] p-4 border-0 focus:ring-0 focus:outline-none resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
        onKeyDown={(e) => {
          if (disabled) return;
          // Keyboard shortcuts
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case "b":
                e.preventDefault();
                handleBold();
                break;
              case "i":
                e.preventDefault();
                handleItalic();
                break;
            }
          }
        }}
      />

      {/* Character count */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-500 flex justify-between">
        <span>Karakter: {(value || "").length}</span>
        <span>
          Kata:{" "}
          {(value || "").split(/\s+/).filter((word) => word.length > 0).length}
        </span>
      </div>
    </div>
  );
};

const NewsModal = ({ isOpen, onClose, onSubmit, editingNews, isLoading }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (editingNews) {
      setFormData({
        title: editingNews.title || "",
        content: editingNews.content || "",
        author: editingNews.author || "",
      });
      setImagePreview(editingNews.image || "");
    } else {
      setFormData({
        title: "",
        content: "",
        author: "",
      });
      setImagePreview("");
    }
    setImageFile(null);
    setErrors({});

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editingNews, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul berita wajib diisi";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Konten berita wajib diisi";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Nama penulis wajib diisi";
    }

    // Validasi gambar untuk berita baru
    if (!editingNews && !imageFile) {
      newErrors.image = "Gambar berita wajib diupload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    console.log("=== IMAGE CHANGE DEBUG ===");
    console.log("Event target:", e.target);
    console.log("Files:", e.target.files);
    console.log("Files length:", e.target.files?.length);

    const file = e.target.files?.[0];
    console.log("Selected file:", file);

    if (file) {
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      });

      // Validate image file
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        console.error("❌ Invalid file type:", file.type);
        alert("Format gambar tidak valid. Gunakan JPG, PNG, atau GIF.");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error("❌ File too large:", file.size);
        alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      console.log("✅ File validation passed, setting imageFile state");
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("✅ FileReader loaded, setting preview");
        setImagePreview(e.target.result);
      };
      reader.onerror = (e) => {
        console.error("❌ FileReader error:", e);
        alert("Gagal membaca file gambar");
      };
      reader.readAsDataURL(file);

      // Clear image error if exists
      if (errors.image) {
        console.log("✅ Clearing image error");
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
    } else {
      console.log("❌ No file selected");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== SUBMIT DEBUG ===");
    console.log("editingNews:", editingNews);
    console.log("imageFile:", imageFile);
    console.log(
      "imageFile details:",
      imageFile
        ? {
            name: imageFile.name,
            type: imageFile.type,
            size: imageFile.size,
            lastModified: imageFile.lastModified,
          }
        : "No file"
    );
    console.log("imagePreview:", imagePreview);

    // Validasi form
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    try {
      // Siapkan FormData dengan benar
      const submitData = new FormData();

      // Tambahkan data text
      submitData.append("title", formData.title.trim());
      submitData.append("content", formData.content.trim());
      submitData.append("author", formData.author.trim());

      // Tambahkan file gambar jika ada
      if (imageFile) {
        console.log("✅ Appending image file:", {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
        });
        // Gunakan nama field yang konsisten dengan backend
        submitData.append("image", imageFile, imageFile.name);
      }

      // Untuk edit, tambahkan ID jika diperlukan
      if (editingNews && editingNews.id) {
        submitData.append("id", editingNews.id.toString());
      }

      // Debug: Periksa semua entries di FormData
      console.log("📝 FormData entries:");
      for (const [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(
            `✅ ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`📄 ${key}: ${value}`);
        }
      }

      // Validasi final sebelum submit
      if (!editingNews && !imageFile) {
        throw new Error("File gambar wajib untuk berita baru");
      }

      console.log("🚀 Calling onSubmit with FormData");
      await onSubmit(submitData);
      console.log("✅ onSubmit completed successfully");
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      alert(
        error.message ||
          "Terjadi kesalahan saat menyimpan berita. Silakan coba lagi."
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
    // Reset file input dengan ref
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Jika edit mode dan menghapus gambar, set flag untuk backend
    if (editingNews) {
      setImagePreview(""); // Kosongkan preview untuk menandakan gambar dihapus
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingNews ? "Edit Berita" : "Tambah Berita Baru"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <form enctype="multipart/form-data" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Berita *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Masukkan judul berita..."
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Author */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penulis *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.author ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nama penulis..."
                disabled={isLoading}
              />
              {errors.author && (
                <p className="text-red-500 text-sm mt-1">{errors.author}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Berita {!editingNews && "*"}
                {editingNews && (
                  <span className="text-sm text-gray-500 font-normal">
                    {" "}
                    (Kosongkan jika tidak ingin mengubah gambar)
                  </span>
                )}
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    } ${isLoading ? "pointer-events-none opacity-50" : ""}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload</span>{" "}
                        atau drag & drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (Max 5MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="image"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </label>
                </div>

                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      disabled={isLoading}>
                      <X size={16} />
                    </button>
                    <div className="mt-2 space-y-1">
                      {imageFile && (
                        <div className="text-sm text-green-600 font-medium">
                          ✓ File baru dipilih: {imageFile.name} (
                          {(imageFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                      {editingNews && !imageFile && imagePreview && (
                        <div className="text-sm text-gray-600">
                          📷 Menggunakan gambar yang sudah ada
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Info untuk Edit Mode */}
                {editingNews && !imagePreview && !imageFile && (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    ℹ️ Tidak ada gambar yang dipilih. Gambar lama akan tetap
                    dipertahankan.
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Berita *
              </label>
              <div className={`${errors.content ? "border-red-500" : ""}`}>
                <SimpleTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  placeholder="Tulis konten berita di sini..."
                  disabled={isLoading}
                />
              </div>
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    {editingNews ? "Memperbarui..." : "Menyimpan..."}
                  </>
                ) : editingNews ? (
                  "Perbarui Berita"
                ) : (
                  "Simpan Berita"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
