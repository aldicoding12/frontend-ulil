import React from "react";
import { Plus } from "lucide-react";

const AddButton = ({ onClick, label, type }) => (
  <button
    onClick={onClick}
    className={`group relative mb-4 px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
      type === "income"
        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
    }`}
    title={`Tambah ${label}`}>
    <Plus size={16} />
    <span className="text-sm font-medium">Tambah {label}</span>
  </button>
);

export default AddButton;
