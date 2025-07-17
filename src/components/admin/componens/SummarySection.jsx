import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const SummarySection = ({ totalIncome, totalExpense, saldoAkhir }) => {
  return (
    <section className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.01]">
      <div className="flex justify-between flex-wrap items-center gap-4">
        <div className="text-lg font-bold text-gray-800">Ringkasan:</div>
        <div className="text-right space-y-1">
          <div className="text-sm text-gray-600">
            Total Pemasukan:{" "}
            <span className="font-semibold text-green-600">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Total Pengeluaran:{" "}
            <span className="font-semibold text-red-600">
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="text-lg font-bold text-green-700 mt-1">
            Saldo Akhir: {formatCurrency(saldoAkhir)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummarySection;
