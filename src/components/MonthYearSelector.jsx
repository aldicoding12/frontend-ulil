// 📁 components/MonthYearSelector.jsx - Enhanced dengan Real-time Integration
import React, { useState, useEffect } from "react";

const MonthYearSelector = ({
  selectedRange,
  selectedDate = null, // 🆕 Current selected date from store
  onDateChange,
  className = "",
  disabled = false,
}) => {
  // Initialize from selectedDate if provided, otherwise use current date
  const initDate = selectedDate || new Date().toISOString().split("T")[0];
  const initDateObj = new Date(initDate);

  const [selectedMonth, setSelectedMonth] = useState(
    initDateObj.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(initDateObj.getFullYear());
  const [selectedDay, setSelectedDay] = useState(initDateObj.getDate());
  const [currentSelectedDate, setCurrentSelectedDate] = useState(initDate);

  // Data bulan
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  // Generate years (5 tahun ke belakang sampai 2 tahun ke depan)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push(year);
  }

  // 🆕 Generate days dalam bulan yang dipilih
  const getDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const daysInSelectedMonth = getDaysInMonth(selectedMonth, selectedYear);

  // 🚀 REAL-TIME SYNC - Update local state when selectedDate prop changes
  useEffect(() => {
    if (selectedDate && selectedDate !== currentSelectedDate) {
      console.log("📅 Syncing date selector with store:", selectedDate);
      const dateObj = new Date(selectedDate);
      setSelectedMonth(dateObj.getMonth() + 1);
      setSelectedYear(dateObj.getFullYear());
      setSelectedDay(dateObj.getDate());
      setCurrentSelectedDate(selectedDate);
    }
  }, [selectedDate, currentSelectedDate]);

  // 🆕 Update date from individual components dengan real-time feedback
  const updateDateFromComponents = (month, year, day) => {
    const date = new Date(year, month - 1, day);
    const dateString = date.toISOString().split("T")[0];
    setCurrentSelectedDate(dateString);

    if (onDateChange && dateString !== selectedDate) {
      console.log("📅 Date changed via components:", dateString);
      onDateChange(dateString);
    }
  };

  // 🆕 Handle day change dengan validation
  const handleDayChange = (day) => {
    setSelectedDay(day);
    updateDateFromComponents(selectedMonth, selectedYear, day);
  };

  // Handle month change dengan day adjustment
  const handleMonthChange = (month) => {
    setSelectedMonth(month);

    // Adjust day if it doesn't exist in new month
    const daysInNewMonth = getDaysInMonth(month, selectedYear);
    const adjustedDay =
      selectedDay > daysInNewMonth ? daysInNewMonth : selectedDay;
    setSelectedDay(adjustedDay);

    updateDateFromComponents(month, selectedYear, adjustedDay);
  };

  // Handle year change dengan leap year adjustment
  const handleYearChange = (year) => {
    setSelectedYear(year);

    // Adjust day for leap year (February)
    const daysInNewMonth = getDaysInMonth(selectedMonth, year);
    const adjustedDay =
      selectedDay > daysInNewMonth ? daysInNewMonth : selectedDay;
    setSelectedDay(adjustedDay);

    updateDateFromComponents(selectedMonth, year, adjustedDay);
  };

  // Handle direct date input dengan real-time sync
  const handleDateChange = (date) => {
    console.log("📅 Direct date input:", date);
    setCurrentSelectedDate(date);

    // Parse date and update components
    const dateObj = new Date(date);
    setSelectedMonth(dateObj.getMonth() + 1);
    setSelectedYear(dateObj.getFullYear());
    setSelectedDay(dateObj.getDate());

    if (onDateChange && date !== selectedDate) {
      onDateChange(date);
    }
  };

  // 🚀 Quick Date Actions untuk kemudahan navigasi
  const quickDateActions = {
    today: () => {
      const today = new Date().toISOString().split("T")[0];
      handleDateChange(today);
    },
    yesterday: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      handleDateChange(yesterday.toISOString().split("T")[0]);
    },
    startOfMonth: () => {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      handleDateChange(start.toISOString().split("T")[0]);
    },
    endOfMonth: () => {
      const end = new Date(selectedYear, selectedMonth, 0);
      handleDateChange(end.toISOString().split("T")[0]);
    },
  };

  // Update when selectedRange changes untuk optimized defaults
  useEffect(() => {
    if (selectedRange === "monthly") {
      // Untuk monthly, gunakan mid-month untuk representasi yang baik
      updateDateFromComponents(selectedMonth, selectedYear, 15);
    } else if (selectedRange === "weekly") {
      // Untuk weekly, keep current date
      updateDateFromComponents(selectedMonth, selectedYear, selectedDay);
    } else if (selectedRange === "yearly") {
      // Untuk yearly, gunakan 1 Januari
      updateDateFromComponents(selectedMonth, selectedYear, 1);
    }
  }, [selectedRange]);

  // 🚀 YEARLY SELECTOR - Streamlined untuk tahun
  if (selectedRange === "yearly") {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <div className="flex items-center gap-3 justify-center">
          <span className="text-sm text-gray-600 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            disabled={disabled}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all hover:border-green-400">
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <span className="text-sm text-green-700 font-bold bg-green-50 px-3 py-1 rounded-md">
            {selectedYear}
          </span>
        </div>

        {/* 🆕 Yearly Quick Actions */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleYearChange(currentYear)}
            disabled={disabled}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors">
            Tahun Ini
          </button>
          <button
            onClick={() => handleYearChange(currentYear - 1)}
            disabled={disabled}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors">
            Tahun Lalu
          </button>
        </div>

        <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          📊 Akan menampilkan laporan tahunan <strong>{selectedYear}</strong>
        </div>
      </div>
    );
  }

  // 🚀 WEEKLY SELECTOR - Enhanced dengan Quick Actions
  if (selectedRange === "weekly") {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {/* Primary Date Input dengan Real-time Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">
            Pilih Tanggal:
          </span>
          <input
            type="date"
            value={currentSelectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={disabled}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all hover:border-green-400"
          />
          {/* 🆕 Real-time Status */}
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            title="Real-time update"></div>
        </div>

        {/* 🆕 Quick Date Actions */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={quickDateActions.today}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors">
            Hari Ini
          </button>
          <button
            onClick={quickDateActions.yesterday}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors">
            Kemarin
          </button>
          <button
            onClick={() => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              handleDateChange(weekAgo.toISOString().split("T")[0]);
            }}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50 transition-colors">
            Seminggu Lalu
          </button>
        </div>

        {/* Component selectors sebagai alternatif */}
        <div className="flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
          <span>Atau pilih manual:</span>
          <select
            value={selectedDay}
            onChange={(e) => handleDayChange(parseInt(e.target.value))}
            disabled={disabled}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100">
            {daysInSelectedMonth.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            disabled={disabled}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100">
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            disabled={disabled}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100">
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Info display dengan enhanced formatting */}
        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              Laporan minggu yang mengandung:{" "}
              <strong>
                {new Date(currentSelectedDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 🚀 MONTHLY SELECTOR - Enhanced dengan Real-time Features
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Primary selectors untuk bulan/tahun */}
      <div className="flex items-center gap-4 justify-center">
        <span className="text-sm text-gray-600 font-medium">Periode:</span>

        {/* Month Selector dengan enhanced styling */}
        <select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(parseInt(e.target.value))}
          disabled={disabled}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all hover:border-green-400">
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          disabled={disabled}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all hover:border-green-400">
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Display selected period dengan enhanced styling */}
        <div className="text-sm text-green-700 font-bold bg-green-50 px-4 py-2 rounded-md border border-green-200">
          {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
        </div>
      </div>

      {/* 🆕 Quick Month Navigation */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            setSelectedMonth(currentMonth);
            setSelectedYear(currentYear);
            updateDateFromComponents(currentMonth, currentYear, 15);
          }}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors">
          Bulan Ini
        </button>
        <button
          onClick={() => {
            const lastMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
            const lastMonthYear =
              selectedMonth === 1 ? selectedYear - 1 : selectedYear;
            setSelectedMonth(lastMonth);
            setSelectedYear(lastMonthYear);
            updateDateFromComponents(lastMonth, lastMonthYear, 15);
          }}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors">
          Bulan Lalu
        </button>
        <button
          onClick={() => {
            const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
            const nextMonthYear =
              selectedMonth === 12 ? selectedYear + 1 : selectedYear;
            setSelectedMonth(nextMonth);
            setSelectedYear(nextMonthYear);
            updateDateFromComponents(nextMonth, nextMonthYear, 15);
          }}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors">
          Bulan Depan
        </button>
      </div>

      {/* 🆕 Specific Date Selector untuk fine-tuning */}
      <div className="flex items-center gap-3 text-sm border-t pt-3">
        <span className="text-gray-600">Tanggal spesifik:</span>

        <select
          value={selectedDay}
          onChange={(e) => handleDayChange(parseInt(e.target.value))}
          disabled={disabled}
          className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 transition-all">
          {daysInSelectedMonth.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <span className="text-xs text-gray-500">atau input langsung:</span>

        <input
          type="date"
          value={currentSelectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 transition-all"
        />

        {/* 🆕 Real-time indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600">Live</span>
        </div>
      </div>

      {/* Enhanced display info dengan real-time status */}
      <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            📊 Akan menampilkan laporan bulanan{" "}
            <strong>
              {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </strong>
            <span className="text-gray-500">
              {" "}
              (tanggal referensi:{" "}
              {new Date(currentSelectedDate).toLocaleDateString("id-ID")})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthYearSelector;
