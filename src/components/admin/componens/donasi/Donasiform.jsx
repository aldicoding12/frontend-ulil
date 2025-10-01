import React, { useState, useEffect } from "react";
import {
  Trash2,
  Loader2,
  Upload,
  X,
  Calendar,
  Target,
  Clock,
} from "lucide-react";
import customAPI from "../../../../api";

const DonasiForm = ({ kegiatan, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    maxParticipants: "",
    category: "Sosial", // Default untuk donasi
    requirements: [""],
    contact: "",
    email: "",
    budget: "",
    // Fields khusus donasi
    donationTarget: "",
    donationDeadline: "",
    donationDescription: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (kegiatan) {
      const eventDate = new Date(kegiatan.date);
      const donationDeadline = kegiatan.donationDeadline
        ? new Date(kegiatan.donationDeadline)
        : null;

      setFormData({
        title: kegiatan.title || "",
        date: eventDate.toISOString().slice(0, 16),
        category: kegiatan.category || "Sosial",
        requirements:
          kegiatan.requirements && kegiatan.requirements.length > 0
            ? kegiatan.requirements
            : [""],
        contact: kegiatan.contact || "",
        email: kegiatan.email || "",
        budget: kegiatan.budget || "",
        // Fields khusus donasi
        donationTarget: kegiatan.donationTarget || "",
        donationDeadline: donationDeadline
          ? donationDeadline.toISOString().slice(0, 16)
          : "",
        donationDescription: kegiatan.donationDescription || "",
      });
      setImagePreview(kegiatan.image || "");
      setImageFile(null);
    } else {
      setFormData({
        title: "",
        date: "",
        category: "Sosial",
        requirements: [""],
        contact: "",
        email: "",
        budget: "",
        donationTarget: "",
        donationDeadline: "",
        donationDescription: "",
      });
      setImagePreview("");
      setImageFile(null);
    }
  }, [kegiatan, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const datetime = new Date(formData.date);
      const donationDeadline = formData.donationDeadline
        ? new Date(formData.donationDeadline)
        : null;

      // Validasi deadline donasi
      if (donationDeadline && donationDeadline <= new Date()) {
        alert("Deadline donasi harus lebih dari tanggal hari ini");
        setLoading(false);
        return;
      }

      // Validasi target donasi
      if (!formData.donationTarget || parseInt(formData.donationTarget) <= 0) {
        alert("Target donasi harus diisi dan lebih dari 0");
        setLoading(false);
        return;
      }

      const submitData = new FormData();

      // Add all form fields
      submitData.append("title", formData.title);
      submitData.append("date", datetime.toISOString());
      submitData.append("category", formData.category);
      submitData.append("contact", formData.contact);
      submitData.append("email", formData.email);
      submitData.append("budget", parseInt(formData.budget) || 0);
      submitData.append("createdBy", "Admin");

      // Fields khusus donasi
      submitData.append("isDonationEvent", "true");
      submitData.append("donationTarget", parseInt(formData.donationTarget));
      submitData.append("donationDescription", formData.donationDescription);

      if (donationDeadline) {
        submitData.append("donationDeadline", donationDeadline.toISOString());
      }

      // Add requirements array
      const filteredRequirements = formData.requirements.filter(
        (req) => req.trim() !== ""
      );
      filteredRequirements.forEach((req, index) => {
        submitData.append(`requirements[${index}]`, req);
      });

      // Add image file if selected
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (kegiatan) {
        // Update existing donation event - gunakan endpoint khusus donasi
        await customAPI.put(`/events/donations/${kegiatan._id}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new donation event - gunakan endpoint khusus donasi
        await customAPI.post("/events/donations", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      onSave();
      onClose();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan event donasi"
      );
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const updateRequirement = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? value : req
      ),
    }));
  };

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {kegiatan ? "Edit Event Donasi" : "Tambah Event Donasi Baru"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Judul Event */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Donasi *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Contoh: Donasi Bantuan Bencana Alam"
              />
            </div>

            {/* Deskripsi Donasi Khusus */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Donasi *
              </label>
              <textarea
                required
                rows={3}
                value={formData.donationDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    donationDescription: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Jelaskan secara detail untuk apa donasi ini akan digunakan..."
              />
            </div>

            {/* Target Donasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Donasi (Rp) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.donationTarget}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    donationTarget: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100000000"
              />
              {formData.donationTarget && (
                <p className="text-sm text-gray-500 mt-1">
                  Target: {formatCurrency(formData.donationTarget)}
                </p>
              )}
            </div>

            {/* Deadline Donasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline Donasi
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.donationDeadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      donationDeadline: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Kosongkan jika tidak ada deadline
              </p>
            </div>

            {/* Tanggal Event */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Donasi *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="Sosial">Sosial</option>
                <option value="Ibadah">Ibadah</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Kajian">Kajian</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Budget Event */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Event (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, budget: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Budget untuk menyelenggarakan event"
              />
            </div>

            {/* Kontak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kontak Person *
              </label>
              <input
                type="tel"
                required
                value={formData.contact}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contact: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="08123456789"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="admin@masjid.com"
              />
            </div>

            {/* Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Event Donasi *
              </label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload gambar event donasi
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, JPEG up to 5MB - Pilih gambar yang menarik
                          untuk donasi
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Ganti Gambar
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Persyaratan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persyaratan Partisipasi
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Masukkan persyaratan untuk berpartisipasi"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-green-600 hover:text-green-700 text-sm font-medium">
                + Tambah Persyaratan
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Target className="w-4 h-4" />
              {kegiatan ? "Update Event Donasi" : "Buat Event Donasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonasiForm;
