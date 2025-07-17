import React from "react";
import { REPORT_RANGES } from "../constants/reportConstants";
import { formatCurrency } from "../utils/formatters";

const FinancialSummary = ({ saldoAwal, saldoAkhir, selectedRange }) => (
  <div className="mb-4 p-4 bg-gray-50 rounded">
    <div className="text-sm text-gray-600 mb-2">Periode Laporan:</div>
    <div className="font-medium">{REPORT_RANGES[selectedRange]}</div>
    <div className="flex justify-between mt-2">
      <div>
        <div className="text-sm text-gray-600">Saldo Awal</div>
        <div className="font-medium">{formatCurrency(saldoAwal)}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Saldo Akhir</div>
        <div className="font-medium text-green-700">
          {formatCurrency(saldoAkhir)}
        </div>
      </div>
    </div>
  </div>
);

export default FinancialSummary;
