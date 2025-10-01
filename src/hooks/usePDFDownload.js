import { useState, useCallback } from "react";
import costumAPI from "../api";
import { REPORT_RANGES } from "../constants/reportConstants";

export const usePDFDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // 🚀 SIMPLIFIED: Direct PDF download
  const downloadPDF = useCallback(async (reportType, date = null) => {
    setDownloading(true);
    setError(null);

    try {
      const endpoints = {
        weekly: "/finance/report/weekly/pdf",
        monthly: "/finance/report/monthly/pdf",
        yearly: "/finance/report/yearly/pdf",
      };

      // Default dates jika tidak ada date parameter
      const currentDate = new Date().toISOString().split("T")[0];
      const currentYear = new Date().getFullYear();

      let params = {};

      if (reportType === "yearly") {
        // Untuk yearly, jika ada date, extract tahunnya
        const year = date ? new Date(date).getFullYear() : currentYear;
        params = {
          start: `${year}-01-01`,
          end: `${year}-12-31`,
        };
      } else {
        // Untuk weekly dan monthly, gunakan date parameter
        params = {
          date: date || currentDate,
        };
      }

      const response = await costumAPI.get(endpoints[reportType], {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate filename berdasarkan type dan date
      let filename;
      if (reportType === "yearly") {
        const year = date ? new Date(date).getFullYear() : currentYear;
        filename = `Laporan-Tahunan-${year}.pdf`;
      } else if (reportType === "monthly") {
        const dateObj = new Date(date || currentDate);
        const monthYear = dateObj.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        });
        filename = `Laporan-Bulanan-${monthYear}.pdf`;
      } else {
        // weekly
        const dateObj = new Date(date || currentDate);
        const formattedDate = dateObj.toLocaleDateString("id-ID");
        filename = `Laporan-Mingguan-${formattedDate}.pdf`;
      }

      // Check if server provides filename
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Provide more specific error messages
      if (err.response?.status === 404) {
        setError(
          `Data laporan ${REPORT_RANGES[reportType]} tidak ditemukan untuk periode yang dipilih.`
        );
      } else if (err.response?.status === 500) {
        setError(
          `Server error saat mengambil data ${REPORT_RANGES[reportType]}. Silakan coba lagi.`
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          err.message ||
            `Gagal mengunduh PDF ${REPORT_RANGES[reportType]}. Silakan coba lagi.`
        );
      }
    } finally {
      setDownloading(false);
    }
  }, []);

  return {
    downloading,
    error,
    downloadPDF,
  };
};
