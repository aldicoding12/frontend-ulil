/* eslint-disable no-unused-vars */
// tableColumns.js - Perbaikan untuk handling data yang lebih baik dengan kolom keterangan
import React from "react";
import { Edit3, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "./formatters";

// Helper function untuk menampilkan keterangan dengan fallback
const renderDescription = (value, item) => {
  const description = item?.note || item?.description || value || "-";

  // Jika keterangan terlalu panjang, potong dan tambahkan tooltip
  if (description && description.length > 50) {
    return (
      <span title={description} className="cursor-help">
        {description.substring(0, 47)}...
      </span>
    );
  }

  return (
    <span className={description === "-" ? "text-gray-400 italic" : ""}>
      {description}
    </span>
  );
};

export const createIncomeColumns = (onEdit, onDelete, data) => [
  {
    header: "Tanggal",
    key: "date",
    render: formatDate,
    width: "15%",
  },
  {
    header: "Nama",
    key: "name",
    width: "25%",
  },
  {
    header: "Jumlah",
    key: "amount",
    align: "right",
    render: formatCurrency,
    width: "20%",
  },
  {
    header: "Keterangan",
    key: "note",
    render: renderDescription,
    width: "25%",
  },
  {
    header: "Aksi",
    key: "actions",
    align: "center",
    width: "15%",
    render: (value, item, index) => {
      // Pastikan kita mendapatkan item yang benar
      const currentItem = item || (data && data[index]) || null;

      // Debug log untuk troubleshooting
      console.log("Income item in actions:", {
        currentItem,
        index,
        dataLength: data?.length,
      });

      return (
        <div className="flex gap-1 justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!currentItem) {
                console.error("Data tidak tersedia untuk di-edit", {
                  currentItem,
                  index,
                });
                alert("Data tidak tersedia untuk di-edit");
                return;
              }

              console.log("Editing income:", currentItem);
              onEdit(currentItem);
            }}
            className="group relative p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
            title="Edit Pemasukan"
            type="button">
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!currentItem) {
                console.error("Data tidak tersedia untuk dihapus", {
                  currentItem,
                  index,
                });
                alert("Data tidak tersedia untuk dihapus");
                return;
              }

              console.log("Deleting income:", currentItem);
              onDelete(currentItem);
            }}
            className="group relative p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
            title="Hapus Pemasukan"
            type="button">
            <Trash2 size={14} />
          </button>
        </div>
      );
    },
  },
];

export const createExpenseColumns = (onEdit, onDelete, data) => [
  {
    header: "Tanggal",
    key: "date",
    render: formatDate,
    width: "15%",
  },
  {
    header: "Nama",
    key: "name",
    width: "25%",
  },
  {
    header: "Jumlah",
    key: "amount",
    align: "right",
    render: formatCurrency,
    width: "20%",
  },
  {
    header: "Keterangan",
    key: "note",
    render: renderDescription,
    width: "25%",
  },
  {
    header: "Aksi",
    key: "actions",
    align: "center",
    width: "15%",
    render: (value, item, index) => {
      // Pastikan kita mendapatkan item yang benar
      const currentItem = item || (data && data[index]) || null;

      // Debug log untuk troubleshooting
      console.log("Expense item in actions:", {
        currentItem,
        index,
        dataLength: data?.length,
      });

      return (
        <div className="flex gap-1 justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!currentItem) {
                console.error("Data tidak tersedia untuk di-edit", {
                  currentItem,
                  index,
                });
                alert("Data tidak tersedia untuk di-edit");
                return;
              }

              console.log("Editing expense:", currentItem);
              onEdit(currentItem);
            }}
            className="group relative p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
            title="Edit Pengeluaran"
            type="button">
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!currentItem) {
                console.error("Data tidak tersedia untuk dihapus", {
                  currentItem,
                  index,
                });
                alert("Data tidak tersedia untuk dihapus");
                return;
              }

              console.log("Deleting expense:", currentItem);
              onDelete(currentItem);
            }}
            className="group relative p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
            title="Hapus Pengeluaran"
            type="button">
            <Trash2 size={14} />
          </button>
        </div>
      );
    },
  },
];

// Helper function untuk kolom yang bisa digunakan di komponen lain
export const createBaseColumns = (type = "income") => {
  const baseColumns = [
    {
      header: "Tanggal",
      key: "date",
      render: formatDate,
      width: "15%",
    },
    {
      header: "Nama",
      key: "name",
      width: "30%",
    },
    {
      header: "Jumlah",
      key: "amount",
      align: "right",
      render: formatCurrency,
      width: "20%",
    },
    {
      header: "Keterangan",
      key: "note",
      render: renderDescription,
      width: "35%",
    },
  ];

  return baseColumns;
};

// Export helper function untuk mendapatkan kolom view-only (tanpa aksi)
export const createViewOnlyColumns = (type = "income") => {
  return createBaseColumns(type);
};
