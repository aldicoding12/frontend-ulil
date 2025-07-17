import React from "react";
import {
  Clock,
  MapPin,
  Users,
  Eye,
  UserPlus,
  Heart,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  getCategoryColorLight,
  getCategoryColor,
  getCategoryIcon,
  formatEventTime,
} from "../../../../utils/constants";

const EventCard = ({
  event,
  isCompact = false,
  onViewDetail,
  onRegister,
  onToggleFavorite,
}) => {
  const isEventFull = event.registeredCount >= event.maxParticipants;
  const isEventPassed = new Date(event.date) < new Date();

  if (isCompact) {
    return (
      <div
        className={`group text-xs p-2 mb-1 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] border-2 ${getCategoryColorLight(
          event.category
        )}`}
        onClick={() => onViewDetail(event)}>
        <div className="flex items-center gap-2">
          <span className="text-sm">{getCategoryIcon(event.category)}</span>
          <span className="truncate flex-1 font-semibold text-xs leading-tight">
            {event.title}
          </span>
        </div>
        <div className="text-[10px] font-medium mt-1 opacity-80">
          {formatEventTime(event.date)} WIB
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCategoryIcon(event.category)}</span>
              <div
                className={`badge badge-lg border-2 font-bold ${getCategoryColorLight(
                  event.category
                )}`}>
                {event.category}
              </div>
            </div>
            <h3 className="card-title text-sm leading-tight mb-1">
              {event.title}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(event._id);
            }}
            className={`btn btn-ghost btn-sm btn-circle transition-all duration-300 ${
              event.isFavorite
                ? "text-red-500 hover:bg-red-50 scale-110"
                : "text-gray-400 hover:bg-gray-50 hover:text-red-400"
            }`}>
            <Heart
              className={`w-4 h-4 ${event.isFavorite ? "fill-current" : ""}`}
            />
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="font-semibold">
              {formatEventTime(event.date)} WIB
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="truncate font-semibold">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="w-4 h-4 text-green-500" />
            <span className="font-semibold">
              {event.registeredCount || 0}/{event.maxParticipants} peserta
            </span>
            <div className="flex-1">
              <progress
                className={`progress progress-primary w-full h-2 ${getCategoryColor(
                  event.category
                )}`}
                value={Math.min(
                  ((event.registeredCount || 0) / event.maxParticipants) * 100,
                  100
                )}
                max="100"></progress>
            </div>
          </div>
        </div>

        <div className="card-actions justify-between gap-2">
          <button
            onClick={() => onViewDetail(event)}
            className="btn btn-outline btn-sm flex-1 text-xs">
            <Eye className="w-4 h-4" />
            Detail
          </button>

          {event.isRegistered ? (
            <button className="btn btn-success btn-sm flex-1 text-xs">
              <CheckCircle className="w-4 h-4" />
              Terdaftar
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegister(event);
              }}
              disabled={isEventFull || isEventPassed}
              className={`btn btn-sm flex-1 text-xs text-white ${getCategoryColor(
                event.category
              )} hover:opacity-90 disabled:btn-disabled`}>
              <UserPlus className="w-4 h-4" />
              {isEventPassed ? "Selesai" : isEventFull ? "Penuh" : "Daftar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
