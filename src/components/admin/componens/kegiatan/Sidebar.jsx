/* eslint-disable no-unused-vars */
import React from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import EventCard from "./EventCard";
import { formatEventDate } from "../../../../utils/constants";

const Sidebar = ({
  selectedDate,
  displayEvents,
  favorites,
  filteredEvents,
  currentDate,
  onViewDetail,
  onRegister,
  onToggleFavorite,
  onAddEvent,
}) => {
  return (
    <div className="card bg-base-100 shadow-lg sticky top-6 border border-gray-100">
      <div className="card-body p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {selectedDate ? "📅 Kegiatan Hari Ini" : "📍 Pilih Tanggal"}
            </h3>
            {selectedDate && (
              <p className="text-sm text-green-600 font-semibold">
                {formatEventDate(selectedDate)}
              </p>
            )}
          </div>
        </div>

        {selectedDate ? (
          displayEvents.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {displayEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  isCompact={true}
                  onViewDetail={onViewDetail}
                  onRegister={onRegister}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}

              {/* Add Event Button for dates with existing events */}
              <div className="divider"></div>
              <button
                onClick={() => onAddEvent(selectedDate)}
                className="btn btn-warning w-full gap-2">
                <Plus className="w-5 h-5" />
                🕐 Reservasi Jam Lain
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="font-bold text-gray-700 mb-3 text-lg">
                📅 Belum Ada Kegiatan
              </h4>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed font-medium">
                Tidak ada kegiatan yang dijadwalkan pada tanggal ini
              </p>
              <button
                onClick={() => onAddEvent(selectedDate)}
                className="btn btn-success gap-3">
                <Plus className="w-5 h-5" />➕ Buat Reservasi
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-blue-500" />
            </div>
            <h4 className="font-bold text-gray-700 mb-3 text-lg">
              👆 Pilih Tanggal
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Klik pada tanggal di kalender untuk melihat kegiatan atau menambah
              kegiatan baru
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
