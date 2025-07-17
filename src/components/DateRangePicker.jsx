import React, { useState } from "react";

export const DateRangePicker = ({
  selectedRange,
  onDateChange,
  onRangeChange,
  className = "",
}) => {
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });

  const ranges = [
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
    { value: "yearly", label: "Tahunan" },
    { value: "custom", label: "Kustom" },
  ];

  const handleCustomRangeChange = (field, value) => {
    const newRange = { ...customRange, [field]: value };
    setCustomRange(newRange);

    if (newRange.startDate && newRange.endDate) {
      onDateChange(newRange);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Range Type Selector */}
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedRange === range.value
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}>
            {range.label}
          </button>
        ))}
      </div>

      {/* Date Selector based on range */}
      {selectedRange !== "custom" && (
        <MonthYearSelector
          selectedRange={selectedRange}
          onDateChange={onDateChange}
        />
      )}

      {/* Custom Range Inputs */}
      {selectedRange === "custom" && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Dari:</span>
          <input
            type="date"
            value={customRange.startDate}
            onChange={(e) =>
              handleCustomRangeChange("startDate", e.target.value)
            }
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <span className="text-sm text-gray-600">Sampai:</span>
          <input
            type="date"
            value={customRange.endDate}
            onChange={(e) => handleCustomRangeChange("endDate", e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}
    </div>
  );
};
