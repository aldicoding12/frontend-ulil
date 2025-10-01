import React, { useState } from "react";
import { useTransaction } from "../hooks/useTransaction";
import { useBalance } from "../hooks/useBalance";

const TransactionForm = ({ type = "income", onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    method: "cash",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { addIncome, addExpense, loading } = useTransaction();
  const { fetchBalance } = useBalance();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    let result;
    if (type === "income") {
      result = await addIncome(transactionData);
    } else {
      result = await addExpense(transactionData);
    }

    if (result.success) {
      // Reset form
      setFormData({
        name: "",
        amount: "",
        method: "cash",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Update balance display (opsional, karena backend sudah return balance baru)
      await fetchBalance();

      // Callback untuk parent component
      if (onSuccess) {
        onSuccess(result);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {type === "income" ? "Sumber Pemasukan" : "Keterangan Pengeluaran"}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder={
            type === "income"
              ? "Contoh: Donasi Jumat"
              : "Contoh: Pembelian alat kebersihan"
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Metode
        </label>
        <select
          name="method"
          value={formData.method}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="cash">Tunai</option>
          <option value="transfer">Transfer</option>
          <option value="other">Lainnya</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan (Opsional)
        </label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Catatan tambahan..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : type === "income"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        } transition-colors`}>
        {loading ? (
          <>
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            Menyimpan...
          </>
        ) : (
          `Tambah ${type === "income" ? "Pemasukan" : "Pengeluaran"}`
        )}
      </button>
    </form>
  );
};

export default TransactionForm;
