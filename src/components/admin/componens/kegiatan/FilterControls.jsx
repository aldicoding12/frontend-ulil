import React from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  categories,
  months,
  getCategoryIcon,
} from "../../../../utils/constants";

const FilterControls = ({
  selectedCategory,
  setSelectedCategory,
  viewMode,
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) => {
  return (
    <div className="card bg-base-100 shadow-lg mb-8 border border-gray-100">
      <div className="card-body p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-bold text-lg">🔍 Filter Kategori:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select select-bordered select-success font-semibold">
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all"
                    ? "🌟 Semua Kategori"
                    : `${getCategoryIcon(cat)} ${cat}`}
                </option>
              ))}
            </select>
          </div>

          {viewMode === "calendar" && (
            <div className="flex items-center gap-4">
              <button onClick={onToday} className="btn btn-outline btn-success">
                📍 Hari Ini
              </button>

              <div className="join border-2 border-gray-200">
                <button
                  onClick={onPreviousMonth}
                  className="btn join-item btn-ghost">
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="btn join-item btn-ghost font-bold text-gray-800 min-w-[200px]">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>

                <button
                  onClick={onNextMonth}
                  className="btn join-item btn-ghost">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
