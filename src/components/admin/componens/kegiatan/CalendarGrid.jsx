/* eslint-disable no-unused-vars */
import React from "react";
import { Plus } from "lucide-react";
import {
  daysOfWeek,
  getDaysInMonth,
  getFirstDayOfMonth,
  getCategoryColorLight,
  getCategoryIcon,
  isToday,
  isWeekend,
} from "../../../../utils/constants";

const CalendarGrid = ({
  currentDate,
  selectedDate,
  filteredEvents,
  onDateClick,
  onViewDetail,
}) => {
  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateString = date.toDateString();
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dateString;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const days = [];

    // Previous month's trailing days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
      });
    }

    // Next month's leading days
    const remainingCells = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(nextYear, nextMonth, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  return (
    <div className="card bg-base-100 shadow-lg border border-gray-100">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 grid grid-cols-7 text-center py-4 border-b-2 border-green-200">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-sm font-bold text-green-700 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7 gap-1 p-2 bg-green-50/30">
        {calendarDays.map((day, index) => {
          const isTodayDate = isToday(day.date);
          const isSelected =
            selectedDate &&
            day.date.toDateString() === selectedDate.toDateString();
          const hasEvents = day.events.length > 0;
          const isWeekendDate = isWeekend(day.date);

          return (
            <div
              key={index}
              onClick={() => onDateClick(day.date)}
              className={`h-[70px] p-2 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105 relative group ${
                !day.isCurrentMonth
                  ? "bg-gray-50/80 text-gray-400 border-gray-200"
                  : isWeekendDate
                  ? "bg-blue-50/50 border-green-200"
                  : "bg-white border-green-200"
              } ${
                isTodayDate
                  ? "bg-green-100 border-green-500 ring-2 ring-green-300 shadow-md"
                  : ""
              } ${
                isSelected
                  ? "bg-green-200 border-green-600 ring-2 ring-green-400 shadow-lg scale-105"
                  : ""
              }`}>
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-bold transition-all duration-200 ${
                    isTodayDate
                      ? "badge badge-success text-white text-xs"
                      : isSelected
                      ? "text-green-800 font-black text-lg"
                      : day.isCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}>
                  {day.date.getDate()}
                </span>

                {/* Event indicator */}
                {hasEvents && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="badge badge-xs badge-success">
                      {day.events.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Events List */}
              <div className="space-y-0.5">
                {day.events.slice(0, 1).map((event) => {
                  const isEventAvailable =
                    event.status !== "draft" && event.status !== "pending";

                  return (
                    <div
                      key={event._id}
                      onClick={() =>
                        isEventAvailable ? onViewDetail(event) : null
                      }
                      className={`text-xs p-1.5 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                        isEventAvailable
                          ? `hover:shadow-md hover:scale-105 ${getCategoryColorLight(
                              event.category
                            )}`
                          : "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                      }`}>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          {isEventAvailable
                            ? getCategoryIcon(event.category)
                            : "⏳"}
                        </span>
                        <span className="truncate flex-1 font-bold leading-tight">
                          {isEventAvailable ? event.title : "Belum Tersedia"}
                        </span>
                      </div>
                      {!isEventAvailable && (
                        <div className="text-[10px] opacity-70 mt-0.5 font-medium">
                          Menunggu publikasi
                        </div>
                      )}
                    </div>
                  );
                })}
                {day.events.length > 1 && (
                  <div className="badge badge-xs badge-success w-full">
                    +{day.events.length - 1} lainnya
                  </div>
                )}
              </div>

              {/* Hover effect for empty dates */}
              {!hasEvents && day.isCurrentMonth && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <div className="badge badge-success gap-1">
                    <Plus className="w-3 h-3" />
                    Reservasi
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
