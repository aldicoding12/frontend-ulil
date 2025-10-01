import React, { useState, useEffect } from "react";

// Helper function untuk mendapatkan tanggal hari ini dengan timezone lokal
const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function untuk format date dari object ke string
const formatDateForInput = (date) => {
  if (!date) return getTodayLocalDate();

  const d = new Date(date);
  // Pastikan tidak ada timezone offset issue
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AddTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  type = "income",
  title,
  editData = null,
  isEditMode = false,
}) => {
  const isIncome = type === "income";

  // Initial form state dengan tanggal hari ini yang benar
  const getInitialFormData = () => ({
    name: "",
    amount: "",
    date: getTodayLocalDate(), // Gunakan helper function
    description: "",
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Effect to populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editData) {
        // Populate form with edit data
        setFormData({
          name: editData.name || "",
          amount: editData.amount ? editData.amount.toString() : "",
          date: editData.date
            ? formatDateForInput(editData.date) // Gunakan helper function
            : getTodayLocalDate(), // Default ke hari ini
          description: editData.description || editData.note || "", // Support both fields
        });
      } else {
        // Reset form for new transaction dengan tanggal hari ini
        setFormData(getInitialFormData());
      }
      // Clear any previous errors and success state
      setErrors({});
      setSubmitSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, isEditMode, editData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", submit: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama/keterangan wajib diisi";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Jumlah harus lebih dari 0";
    }

    if (!formData.date) {
      newErrors.date = "Tanggal wajib diisi";
    } else {
      // Validasi tanggal tidak boleh di masa depan
      const inputDate = new Date(formData.date + "T00:00:00"); // Pastikan timezone lokal
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set ke akhir hari ini

      if (inputDate > today) {
        newErrors.date = "Tanggal tidak boleh di masa depan";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        type,
      });

      setSubmitSuccess(true);

      // Close modal after success
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      setErrors({
        submit: error.message || "Gagal menyimpan data. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state dengan tanggal hari ini
    setFormData(getInitialFormData());
    setErrors({});
    setSubmitSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const formatRupiah = (value) => {
    if (!value || isNaN(value)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Dynamic styling
  const titleColorClass = isIncome ? "text-green-600" : "text-red-600";
  const buttonColorClass = isIncome
    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
    : "bg-red-600 hover:bg-red-700 focus:ring-red-500";

  // Dynamic title
  const getModalTitle = () => {
    if (title) return title;

    const transactionType = isIncome ? "Pemasukan" : "Pengeluaran";
    return isEditMode ? `Edit ${transactionType}` : `Tambah ${transactionType}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4 transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className={`text-lg font-semibold ${titleColorClass}`}>
            {getModalTitle()}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Tutup modal">
            ✕
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="p-3 bg-green-100 text-green-700 text-sm rounded-md border border-green-200 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>
              {isEditMode ? "Berhasil diperbarui!" : "Berhasil ditambahkan!"}
            </span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200 flex items-center gap-2">
            <span className="text-red-600">⚠</span>
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Nama/Keterangan <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder={
                isIncome ? "Contoh: Donasi Jamaah" : "Contoh: Listrik Masjid"
              }
              disabled={isSubmitting || submitSuccess}
              autoFocus={!isEditMode} // Focus on new transaction
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Jumlah (IDR) <span className="text-red-500">*</span>
            </label>
            <input
              name="amount"
              type="number"
              min="1"
              step="1"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.amount
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Masukkan jumlah"
              disabled={isSubmitting || submitSuccess}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
            {formData.amount &&
              !errors.amount &&
              parseFloat(formData.amount) > 0 && (
                <p className="text-gray-600 text-sm mt-1">
                  {formatRupiah(parseFloat(formData.amount))}
                </p>
              )}
          </div>

          {/* Date Field dengan max hari ini */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={getTodayLocalDate()} // Gunakan helper function
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.date
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              disabled={isSubmitting || submitSuccess}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
            {/* Info helper text */}
            <p className="text-xs text-gray-500 mt-1">
              Default: Hari ini ({getTodayLocalDate()}) | Max: Hari ini
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Deskripsi <span className="text-gray-400">(Opsional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              placeholder="Tambahkan deskripsi jika diperlukan..."
              disabled={isSubmitting || submitSuccess}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 transition-all focus:outline-none focus:ring-2 ${buttonColorClass}`}>
              {isSubmitting
                ? "Menyimpan..."
                : isEditMode
                ? "Perbarui"
                : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
