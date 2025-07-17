/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import customAPI from "../../api";
import {
  Mail,
  MessageCircle,
  Send,
  MapPin,
  Phone,
  Clock,
  Users,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Globe,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";

// Constants
const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Alamat Masjid",
    content:
      "Masjid Ulil Albab UNM Parangtambung, Jl. Daeng Tata Raya, Parangtambung, Kec. Tamalate, Kota Makassar, Sulawesi Selatan 90224",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Phone,
    title: "Nomor Telepon",
    content: "+62 411 123 4567",
    subContent: "WhatsApp: +62 812 3456 7890",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Mail,
    title: "Email Resmi",
    content: "masjidulilalbab@unm.ac.id",
    subContent: "ulilalbab@gmail.com",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Clock,
    title: "Jam Operasional",
    content: "Senin - Jumat: 08:00 - 17:00",
    subContent: "Sabtu - Minggu: 08:00 - 12:00",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
];

const SOCIAL_MEDIA = [
  {
    icon: Instagram,
    name: "Instagram",
    handle: "@masjidulilalbab",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    link: "https://instagram.com/masjidulilalbab",
  },
  {
    icon: Facebook,
    name: "Facebook",
    handle: "Masjid Ulil Albab UNM",
    color: "bg-blue-600",
    link: "https://facebook.com/masjidulilalbab",
  },
  {
    icon: Youtube,
    name: "YouTube",
    handle: "Masjid Ulil Albab Channel",
    color: "bg-red-600",
    link: "https://youtube.com/@masjidulilalbab",
  },
  {
    icon: Globe,
    name: "Website",
    handle: "www.masjidulilalbab.unm.ac.id",
    color: "bg-green-600",
    link: "https://masjidulilalbab.unm.ac.id",
  },
];

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

// Validation rules
const validateField = (field, value) => {
  const trimmedValue = value.trim();

  switch (field) {
    case "name":
      if (!trimmedValue) return "Nama harus diisi";
      if (trimmedValue.length < 2) return "Nama minimal 2 karakter";
      if (trimmedValue.length > 100) return "Nama maksimal 100 karakter";
      break;
    case "email":
      if (!trimmedValue) return "Email harus diisi";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue))
        return "Format email tidak valid";
      break;
    case "subject":
      if (!trimmedValue) return "Subjek harus diisi";
      if (trimmedValue.length < 3) return "Subjek minimal 3 karakter";
      if (trimmedValue.length > 200) return "Subjek maksimal 200 karakter";
      break;
    case "message":
      if (!trimmedValue) return "Pesan harus diisi";
      if (trimmedValue.length < 10) return "Pesan minimal 10 karakter";
      if (trimmedValue.length > 1000) return "Pesan maksimal 1000 karakter";
      break;
    default:
      return null;
  }
  return null;
};

const validateForm = (formData) => {
  const errors = {};
  Object.keys(formData).forEach((field) => {
    const error = validateField(field, formData[field]);
    if (error) errors[field] = error;
  });
  return errors;
};

// Custom hook for form management
const useContactForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field] || errors.general) {
        setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
      }
    },
    [errors]
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }, []);

  const showSuccessMessage = useCallback((message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 8000);
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await customAPI.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (response.data.success) {
        resetForm();
        showSuccessMessage(response.data.message || "Pesan berhasil dikirim!");
      } else {
        throw new Error(response.data.message || "Gagal mengirim pesan");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [formData, resetForm, showSuccessMessage]);

  return {
    formData,
    errors,
    loading,
    showSuccess,
    successMessage,
    handleInputChange,
    handleSubmit,
  };
};

// Error handling helper
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 400) {
      return data.message || "Data tidak valid";
    } else if (status === 429) {
      return "Terlalu banyak pesan dikirim. Coba lagi dalam beberapa menit.";
    } else if (status >= 500) {
      return "Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.";
    }
    return data.message || "Terjadi kesalahan. Silakan coba lagi.";
  } else if (error.request) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }
  return "Terjadi kesalahan tidak terduga. Silakan coba lagi.";
};

// Components
const Header = () => (
  <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white py-16">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
        <MessageCircle className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
      <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed">
        Berikan Saran dan Masukan kepada pengurus Masjid Ulil Albab UNM
        Parangtambung dengan mengisi Form berikut
      </p>
    </div>
  </div>
);

const StatusMessage = ({ type, message, onClose }) => {
  const isSuccess = type === "success";
  const bgColor = isSuccess
    ? "bg-green-50 border-green-200"
    : "bg-red-50 border-red-200";
  const textColor = isSuccess ? "text-green-800" : "text-red-800";
  const iconColor = isSuccess ? "text-green-600" : "text-red-600";
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div
      className={`mb-8 ${bgColor} border rounded-2xl p-6 shadow-sm animate-fade-in`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>
            {isSuccess ? "Pesan Berhasil Dikirim!" : "Terjadi Kesalahan"}
          </h3>
          <p className={`${textColor.replace("800", "700")}`}>
            {isSuccess
              ? `${message} Tim kami akan merespons dalam 1-2 hari kerja.`
              : message}
          </p>
        </div>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  rows,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-3">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      {rows ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          className={`w-full ${
            Icon ? "pl-12" : "pl-4"
          } pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full ${
            Icon ? "pl-12" : "pl-4"
          } pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
    {error && (
      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const ContactInfoCard = ({ info }) => {
  const { icon: Icon, title, content, subContent, color, bgColor } = info;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 leading-relaxed">{content}</p>
          {subContent && (
            <p className="text-gray-600 text-sm mt-1">{subContent}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialMediaLink = ({ social }) => {
  const { icon: Icon, name, handle, color, link } = social;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {name}
        </p>
        <p className="text-sm text-gray-600">{handle}</p>
      </div>
    </a>
  );
};

function KontakView() {
  const {
    formData,
    errors,
    loading,
    showSuccess,
    successMessage,
    handleInputChange,
    handleSubmit,
  } = useContactForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Status Messages */}
        {showSuccess && (
          <StatusMessage type="success" message={successMessage} />
        )}
        {errors.general && (
          <StatusMessage type="error" message={errors.general} />
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Kirim Pesan
                    </h2>
                    <p className="text-gray-600">
                      Sampaikan pesan Anda kepada kami
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-8 space-y-6">
                <FormField
                  label="Nama Lengkap *"
                  icon={Users}
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  disabled={loading}
                />

                <FormField
                  label="Alamat Email *"
                  type="email"
                  icon={Mail}
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  disabled={loading}
                />

                <FormField
                  label="Subjek Pesan *"
                  icon={MessageCircle}
                  placeholder="Subjek pesan Anda"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  error={errors.subject}
                  disabled={loading}
                />

                <div>
                  <FormField
                    label="Pesan *"
                    placeholder="Tulis pesan Anda di sini... (minimal 10 karakter)"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    error={errors.message}
                    disabled={loading}
                    rows={6}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.message.length}/1000 karakter
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 flex items-center justify-center gap-3 shadow-lg">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengirim Pesan...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {CONTACT_INFO.map((info, index) => (
                <ContactInfoCard key={index} info={info} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default KontakView;
