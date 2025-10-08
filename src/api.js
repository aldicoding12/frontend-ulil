import axios from "axios";

// Deteksi environment
const isDevelopment = import.meta.env.DEV;

const customAPI = axios.create({
  baseURL: isDevelopment
    ? "/api/ul/data" // Development: gunakan proxy
    : "https://backend-ulil.vercel.app/api/ul/data", // Production: direct ke backend
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk request
customAPI.interceptors.request.use(
  (config) => {
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
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
    }
    return Promise.reject(error);
  }
);

export const createIncome = async (incomeData) => {
  try {
    const response = await customAPI.post(
      "/finance/incomes/create",
      incomeData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating income:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menambahkan pemasukan"
    );
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await customAPI.post(
      "/finance/expenses/create",
      expenseData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menambahkan pengeluaran"
    );
  }
};

export const updateIncome = async (id, incomeData) => {
  try {
    const response = await customAPI.put(`/finance/incomes/${id}`, incomeData);
    return response.data;
  } catch (error) {
    console.error("Error updating income:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal mengupdate pemasukan"
    );
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await customAPI.put(
      `/finance/expenses/${id}`,
      expenseData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal mengupdate pengeluaran"
    );
  }
};

export const deleteIncome = async (id) => {
  try {
    const response = await customAPI.delete(`/finance/incomes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting income:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menghapus pemasukan"
    );
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await customAPI.delete(`/finance/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw new Error(
      error?.response?.data?.message || "Gagal menghapus pengeluaran"
    );
  }
};

export default customAPI;
