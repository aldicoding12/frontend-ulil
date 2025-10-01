// services/inventoryService.js
import customAPI from "../api";
import { buildURLParams } from "../utils/index.jsx";

export class InventoryService {
  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const response = await customAPI.get("/inventory/admin");
      if (response.data.message === "Berhasil menampilkan statistik") {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Get inventory items with pagination and filters
  static async getItems(page = 1, filters = {}, limit = 10) {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.condition !== "all" && { condition: filters.condition }),
        ...(filters.isLendable !== "all" && { isLendable: filters.isLendable }),
        ...(filters.search && { itemName: filters.search }),
      };

      const queryString = buildURLParams(params);
      const response = await customAPI.get(`/inventory?${queryString}`);

      if (response.data.message === "Berhasil menampilkan inventaris") {
        return {
          success: true,
          data: response.data.data || [],
          pagination: {
            current: response.data.currentPage || 1,
            total: response.data.totalPages || 1,
            totalRecords: response.data.totalItems || 0,
          },
        };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error fetching items:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Get single item with borrowers
  static async getItemWithBorrowers(itemId) {
    try {
      const response = await customAPI.get(`/inventory/items/${itemId}`);
      if (response.data.message === "Berhasil menampilkan barang") {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error fetching item borrowers:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Get borrowing requests
  static async getBorrowingRequests(page = 1, filters = {}, limit = 10) {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        status: filters.status,
      };

      const queryString = buildURLParams(params);
      const response = await customAPI.get(
        `/inventory/borrowing-requests?${queryString}`
      );

      if (
        response.data.message === "Berhasil menampilkan permintaan peminjaman"
      ) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: {
            current: response.data.currentPage || 1,
            total: response.data.totalPages || 1,
            totalRecords: response.data.totalItems || 0,
          },
        };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error fetching borrowing requests:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Create new item
  static async createItem(itemData) {
    try {
      const formData = new FormData();
      Object.entries(itemData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await customAPI.post("/inventory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error creating item:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Update existing item
  static async updateItem(itemId, itemData) {
    try {
      const formData = new FormData();
      Object.entries(itemData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await customAPI.put(`/inventory/${itemId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error updating item:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Delete item
  static async deleteItem(itemId) {
    try {
      await customAPI.delete(`/inventory/${itemId}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting item:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Approve borrowing request
  static async approveBorrowing(itemId, borrowingId, approvedBy = "Admin") {
    try {
      const response = await customAPI.patch(
        `/inventory/${itemId}/borrowings/${borrowingId}/approve`,
        { approvedBy }
      );

      if (response.data.message === "Permintaan peminjaman disetujui") {
        return { success: true };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error approving borrowing:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Reject borrowing request
  static async rejectBorrowing(
    itemId,
    borrowingId,
    rejectionReason = "Ditolak oleh admin"
  ) {
    try {
      const response = await customAPI.patch(
        `/inventory/${itemId}/borrowings/${borrowingId}/reject`,
        { rejectionReason }
      );

      if (response.data.message === "Permintaan peminjaman ditolak") {
        return { success: true };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error rejecting borrowing:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  // Mark item as returned
  static async markAsReturned(
    itemId,
    borrowingId,
    actualReturnDate = new Date().toISOString()
  ) {
    try {
      const response = await customAPI.patch(
        `/inventory/${itemId}/borrowings/${borrowingId}/return`,
        { actualReturnDate }
      );

      if (response.data.message === "Barang berhasil dikembalikan") {
        return { success: true };
      }
      return { success: false, error: "Invalid response format" };
    } catch (error) {
      console.error("Error marking as returned:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}
