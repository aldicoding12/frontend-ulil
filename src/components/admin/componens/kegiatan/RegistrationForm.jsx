import React, { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

const RegistrationForm = ({ kegiatan, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor HP harus diisi";
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor HP tidak valid";
    } else if (formData.phone.replace(/[^0-9]/g, "").length < 10) {
      newErrors.phone = "Nomor HP minimal 10 digit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };

      await onSubmit(registrationData);

      // Reset form
      setFormData({ name: "", phone: "" });
      setErrors({});
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^[0-9+\-\s]*$/.test(value)) {
      setFormData((prev) => ({ ...prev, phone: value }));
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleNameChange = (e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  if (!isOpen || !kegiatan) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">📝 Daftar Kegiatan</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="alert alert-success mb-6">
          <div>
            <h3 className="font-bold">{kegiatan.title}</h3>
            <p className="text-sm font-semibold">{kegiatan.category}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">👤 Nama Lengkap *</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className={`input input-bordered ${
                errors.name ? "input-error" : ""
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">
                📱 Nomor HP/WhatsApp *
              </span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`input input-bordered ${
                errors.phone ? "input-error" : ""
              }`}
              placeholder="08xxxxxxxxxx"
            />
            {errors.phone && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </span>
              </label>
            )}
            <label className="label">
              <span className="label-text-alt">
                📞 Nomor HP akan digunakan untuk konfirmasi kegiatan
              </span>
            </label>
          </div>

          <div className="alert alert-warning">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-bold">⚠️ Perhatian:</p>
              <p className="text-sm">
                Pastikan data yang Anda masukkan benar. Anda akan menerima
                konfirmasi melalui nomor HP yang didaftarkan.
              </p>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost">
              ❌ Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}✅ Daftar
              Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
