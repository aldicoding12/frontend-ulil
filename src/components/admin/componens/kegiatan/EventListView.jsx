/* eslint-disable no-unused-vars */
import React from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Eye,
  UserPlus,
  Heart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getCategoryColor,
  getCategoryIcon,
  formatEventDate,
  formatEventTime,
  monthsShort,
} from "../../../../utils/constants";

const EventListView = ({
  displayEvents,
  isVisible,
  onViewDetail,
  onRegister,
  onToggleFavorite,
}) => {
  if (displayEvents.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="card bg-base-100 shadow-lg border border-gray-100">
          <div className="card-body p-12">
            <CalendarIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              🔍 Tidak ada kegiatan ditemukan
            </h3>
            <p className="text-gray-500 text-lg font-semibold">
              Belum ada kegiatan yang dijadwalkan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {displayEvents.map((event, index) => (
        <div
          key={event._id}
          className={`card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}>
          {/* Event Image */}
          <figure className="relative">
            <img
              src={
                event.image ||
                "https://images.unsplash.com/photo-1584502905346-b7b90d6a7c66?w=600&h=300&fit=crop"
              }
              alt={event.title}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(event._id)}
              className={`btn btn-circle btn-sm absolute top-4 right-4 backdrop-blur-sm transition-all duration-300 ${
                event.isFavorite
                  ? "bg-red-500/30 text-red-200 scale-110"
                  : "bg-white/20 text-white hover:bg-white/30 hover:scale-110"
              }`}>
              <Heart
                className={`w-5 h-5 ${event.isFavorite ? "fill-current" : ""}`}
              />
            </button>

            {/* Category Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div
                className={`badge badge-lg text-white backdrop-blur-sm ${getCategoryColor(
                  event.category
                )}`}>
                <span className="mr-1">{getCategoryIcon(event.category)}</span>
                {event.category}
              </div>

              {event.isDonationEvent && (
                <div className="badge badge-warning text-white">🎁 Donasi</div>
              )}
            </div>

            {/* Date Badge */}
            <div className="absolute bottom-4 left-4">
              <div className="card bg-white/90 backdrop-blur-sm compact">
                <div className="card-body items-center text-center p-3">
                  <div className="text-xl font-bold text-gray-800">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-xs text-gray-600 font-bold -mt-1">
                    {monthsShort[new Date(event.date).getMonth()]}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute bottom-4 right-4">
              {(() => {
                const isEventPassed = new Date(event.date) < new Date();
                const isEventFull =
                  event.registeredCount >= event.maxParticipants;
                const isAlmostFull =
                  event.registeredCount >= event.maxParticipants * 0.8;
                const isEventAvailable =
                  event.status !== "draft" && event.status !== "pending";

                if (!isEventAvailable) {
                  return (
                    <div className="badge badge-neutral">⏳ BELUM TERSEDIA</div>
                  );
                } else if (isEventPassed) {
                  return <div className="badge badge-neutral">⏰ SELESAI</div>;
                } else if (isEventFull) {
                  return <div className="badge badge-error">🚫 PENUH</div>;
                } else if (isAlmostFull) {
                  return (
                    <div className="badge badge-warning">⚠️ HAMPIR PENUH</div>
                  );
                } else {
                  return <div className="badge badge-success">✅ TERSEDIA</div>;
                }
              })()}
            </div>
          </figure>

          {/* Event Body */}
          <div className="card-body p-6">
            <h2 className="card-title text-xl leading-tight mb-3">
              {event.title}
            </h2>

            <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2 text-sm">
              {event.description}
            </p>

            {/* Event Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarIcon className="w-5 h-5 text-green-500" />
                <div className="text-sm">
                  <div className="font-bold text-gray-800">
                    {formatEventDate(event.date)}
                  </div>
                  <div className="text-xs text-green-600 font-bold">
                    ⏰ {formatEventTime(event.date)} WIB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-green-500" />
                <span className="text-sm font-bold truncate">
                  📍 {event.location}
                </span>
              </div>

              {/* Peserta atau Donasi */}
              {event.isDonationEvent ? (
                <div className="flex items-center gap-3 text-yellow-600 font-bold text-sm">
                  🎯 Target: Rp{event.donationTarget?.toLocaleString()} <br />
                  💰 Terkumpul: Rp{event.donationCurrent?.toLocaleString()}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        👥 {event.registeredCount || 0} /{" "}
                        {event.maxParticipants}
                      </span>
                      <div className="badge badge-success badge-outline badge-sm">
                        {Math.round(
                          ((event.registeredCount || 0) /
                            event.maxParticipants) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <progress
                      className={`progress w-full h-2 ${getCategoryColor(
                        event.category
                      )}`}
                      value={Math.min(
                        ((event.registeredCount || 0) / event.maxParticipants) *
                          100,
                        100
                      )}
                      max="100"></progress>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="card-actions justify-between gap-3">
              <button
                onClick={() => onViewDetail(event)}
                className="btn btn-outline flex-1 btn-sm">
                <Eye className="w-4 h-4" />
                👁️ Detail
              </button>

              {event.isDonationEvent ? (
                <button
                  onClick={() => onViewDetail(event)}
                  className="btn btn-warning flex-1 btn-sm text-white">
                  🎁 Donasi
                </button>
              ) : event.isRegistered ? (
                <button className="btn btn-success flex-1 btn-sm">
                  <CheckCircle className="w-4 h-4" />✅ Terdaftar
                </button>
              ) : (
                (() => {
                  const isEventPassed = new Date(event.date) < new Date();
                  const isEventFull =
                    event.registeredCount >= event.maxParticipants;
                  const isEventAvailable =
                    event.status !== "draft" && event.status !== "pending";

                  if (!isEventAvailable) {
                    return (
                      <button
                        disabled
                        className="btn btn-disabled flex-1 btn-sm">
                        <AlertCircle className="w-4 h-4" />⏳ Belum Tersedia
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={() => onRegister(event)}
                      disabled={isEventFull || isEventPassed}
                      className={`btn flex-1 btn-sm text-white ${getCategoryColor(
                        event.category
                      )} hover:opacity-90 disabled:btn-disabled`}>
                      <UserPlus className="w-4 h-4" />
                      {isEventPassed
                        ? "⏰ Selesai"
                        : isEventFull
                        ? "🚫 Penuh"
                        : "📝 Daftar"}
                    </button>
                  );
                })()
              )}
            </div>
          </div>

          {/* Bottom Highlight */}
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>
      ))}
    </div>
  );
};

export default EventListView;
