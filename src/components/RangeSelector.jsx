import React from "react";
import { REPORT_RANGES } from "../constants/reportConstants";

const RangeSelector = ({ selectedRange, onRangeChange }) => (
  <div className="flex gap-4">
    {Object.entries(REPORT_RANGES).map(([key, label]) => (
      <button
        key={key}
        className={`px-4 py-2 rounded text-white ${
          selectedRange === key
            ? "bg-green-800"
            : "bg-green-700 hover:bg-green-800"
        }`}
        onClick={() => onRangeChange(key)}>
        {label}
      </button>
    ))}
  </div>
);

export default RangeSelector;
