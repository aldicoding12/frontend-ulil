/* eslint-disable no-unused-vars */
import React from "react";
import {
  X,
  Heart,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  UserPlus,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  getCategoryColor,
  getCategoryColorLight,
  getCategoryIcon,
  formatEventDate,
  formatEventTime,
} from "../../../../utils/constants";

const EventDetailModal = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onToggleFavorite,
  onAddEvent,
  selectedDate,
}) => {
  if (!isOpen || !event) return null;

  const isEventFull = event.registeredCount >= event.maxParticipants;
  const isEventPassed = new Date(event.date) < new Date();

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Event Image Header */}
        <div className="relative -m-6 mb-6">
          <figure>
            <img
              src={
                event.image ||
                "https://images.unsplash.com/photo-1584502905346-b7b90d6a7c66?w=800&h=400&fit=crop"
              }
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          </figure>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70">
            <X className="w-5 h-5" />
          </button>

          {/* Event Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div
                  className={`badge badge-lg text-white backdrop-blur-sm shadow-lg ${getCategoryColor(
                    event.category
                  )}`}>
                  {getCategoryIcon(event.category)} {event.category}
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 mt-3 drop-shadow-lg">
                  {event.title}
                </h3>
              </div>
              <button
                onClick={() => onToggleFavorite(event._id)}
                className={`btn btn-circle backdrop-blur-sm transition-all duration-300 ${
                  event.isFavorite
                    ? "bg-red-500/30 text-red-200 scale-110"
                    : "bg-white/20 text-white hover:bg-white/30 hover:scale-110"
                }`}>
                <Heart
                  className={`w-6 h-6 ${
                    event.isFavorite ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed text-lg">
            {event.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Event Details */}
            <div className="space-y-6">
              <div className="card bg-green-50 border-2 border-green-200">
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-2xl text-white shadow-lg ${getCategoryColor(
                        event.category
                      )}`}>
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900 mb-1">
                        📅 Tanggal & Waktu
                      </p>
                      <p className="text-gray-600 font-semibold">
                        {formatEventDate(event.date)}
                      </p>
                      <p className="text-gray-600 font-bold">
                        ⏰ {formatEventTime(event.date)} WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-blue-50 border-2 border-blue-200">
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-2xl text-white shadow-lg ${getCategoryColor(
                        event.category
                      )}`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900 mb-1">
                        📍 Lokasi
                      </p>
                      <p className="text-gray-600 font-semibold">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-purple-50 border-2 border-purple-200">
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-2xl text-white shadow-lg ${getCategoryColor(
                        event.category
                      )}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900 mb-2">
                        👥 Peserta
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 font-semibold">
                          {event.registeredCount || 0} / {event.maxParticipants}{" "}
                          terdaftar
                        </span>
                        <div className="badge badge-outline">
                          {Math.round(
                            ((event.registeredCount || 0) /
                              event.maxParticipants) *
                              100
                          )}
                          % terisi
                        </div>
                      </div>
                      <progress
                        className={`progress w-full h-4 ${getCategoryColor(
                          event.category
                        )}`}
                        value={Math.min(
                          ((event.registeredCount || 0) /
                            event.maxParticipants) *
                            100,
                          100
                        )}
                        max="100"></progress>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Requirements and Contact */}
            <div className="space-y-6">
              <div className="card bg-gray-50 border-2 border-gray-200">
                <div className="card-body p-4">
                  <p className="font-bold text-lg text-gray-900 mb-3">
                    📋 Persyaratan
                  </p>
                  <ul className="space-y-2">
                    {event.requirements && event.requirements.length > 0 ? (
                      event.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium">{req}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic font-medium">
                        ✨ Tidak ada persyaratan khusus
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="card bg-teal-50 border-2 border-teal-200">
                <div className="card-body p-4">
                  <p className="font-bold text-lg text-gray-900 mb-3">
                    📞 Kontak
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                      <span className="text-lg">📞</span>
                      <span className="font-semibold">{event.contact}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                      <span className="text-lg">✉️</span>
                      <span className="font-semibold">{event.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action">
            {event.isRegistered ? (
              <button className="btn btn-success flex-1">
                <CheckCircle className="w-6 h-6" />✅ Sudah Terdaftar
              </button>
            ) : (
              (() => {
                const isEventAvailable =
                  event.status !== "draft" && event.status !== "pending";

                if (!isEventAvailable) {
                  return (
                    <button disabled className="btn btn-disabled flex-1">
                      <AlertCircle className="w-6 h-6" />⏳ Kegiatan Belum
                      Tersedia
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => onRegister(event)}
                    disabled={isEventFull || isEventPassed}
                    className={`btn flex-1 text-white ${getCategoryColor(
                      event.category
                    )} hover:opacity-90 disabled:btn-disabled`}>
                    <UserPlus className="w-6 h-6" />
                    {isEventPassed
                      ? "⏰ Kegiatan Selesai"
                      : isEventFull
                      ? "🚫 Penuh"
                      : "📝 Daftar Sekarang"}
                  </button>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
