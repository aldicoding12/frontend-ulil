// api.js - Perbaikan API functions
import axios from "axios";

const customAPI = axios.create({
  baseURL: "/api/ul/data", // Pastikan ini sesuai dengan backend routes
  withCredentials: true, // ✅ CRITICAL: Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk request
customAPI.interceptors.request.use(
  (config) => {
    console.log("API Request:", config);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor untuk response
customAPI.interceptors.response.use(
  (response) => {
    console.log("API Response:", response);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    return Promise.reject(error);
  }
);

// ✅ Function untuk create income
export const createIncome = async (incomeData) => {
  try {
    const response = await customAPI.post(
      "/finance/incomes/create",
      incomeData
    );
    console.log("Income created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating income:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menambahkan pemasukan"
    );
  }
};

// ✅ Function untuk create expense
export const createExpense = async (expenseData) => {
  try {
    const response = await customAPI.post(
      "/finance/expenses/create",
      expenseData
    );
    console.log("Expense created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menambahkan pengeluaran"
    );
  }
};

// ✅ Update income - DIPERBAIKI untuk konsistensi dengan baseURL
export const updateIncome = async (id, incomeData) => {
  try {
    const response = await customAPI.put(`/finance/incomes/${id}`, incomeData);
    console.log("Income updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating income:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal mengupdate pemasukan"
    );
  }
};

// ✅ Update expense - DIPERBAIKI untuk konsistensi dengan baseURL
export const updateExpense = async (id, expenseData) => {
  try {
    const response = await customAPI.put(
      `/finance/expenses/${id}`,
      expenseData
    );
    console.log("Expense updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal mengupdate pengeluaran"
    );
  }
};

// ✅ Delete income - DIPERBAIKI untuk konsistensi dengan customAPI
export const deleteIncome = async (id) => {
  try {
    const response = await customAPI.delete(`/finance/incomes/${id}`);
    console.log("Income deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting income:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menghapus pemasukan"
    );
  }
};

// ✅ Delete expense - DIPERBAIKI untuk konsistensi dengan customAPI
export const deleteExpense = async (id) => {
  try {
    const response = await customAPI.delete(`/finance/expenses/${id}`);
    console.log("Expense deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menghapus pengeluaran"
    );
  }
};

export default customAPI;
