import { useRef, useEffect, useCallback } from "react";
import { Chart } from "chart.js/auto";
import { CHART_COLORS } from "../constants/reportConstants";

export const useChart = (chartData, selectedRange) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  console.log("🎨 useChart called with:");
  console.log("- chartData type:", typeof chartData);
  console.log("- chartData is Array:", Array.isArray(chartData));
  console.log("- chartData length:", chartData?.length);
  console.log("- chartData:", chartData);
  console.log("- selectedRange:", selectedRange);

  const validateChartData = useCallback((data) => {
    console.log("🔍 Validating chart data:", data);

    // Must be array
    if (!Array.isArray(data)) {
      console.log("❌ Chart data is not an array");
      return false;
    }

    // Must have data
    if (data.length === 0) {
      console.log("❌ Chart data is empty array");
      return false;
    }

    // Check first item structure
    const firstItem = data[0];
    console.log("🔍 First item:", firstItem);

    if (!firstItem || typeof firstItem !== "object") {
      console.log("❌ First item is not an object");
      return false;
    }

    // Must have required fields
    const hasValidFields =
      firstItem.date ||
      firstItem.year ||
      firstItem.income !== undefined ||
      firstItem.expense !== undefined ||
      firstItem.balance !== undefined;

    if (!hasValidFields) {
      console.log("❌ First item missing required fields");
      return false;
    }

    console.log("✅ Chart data is valid");
    return true;
  }, []);

  const prepareChartData = useCallback(
    (data, range) => {
      console.log("🎨 prepareChartData called with:", { data, range });

      if (!validateChartData(data)) {
        console.log("❌ Invalid chart data, returning empty");
        return { labels: [], datasets: [] };
      }

      try {
        let labels, incomeValues, expenseValues, balanceValues;

        if (range === "yearly") {
          labels = data.map((item, index) => {
            const year =
              item.year ||
              new Date(item.date).getFullYear() ||
              `Year ${index + 1}`;
            return year.toString();
          });
        } else {
          labels = data.map((item, index) => {
            if (!item.date) {
              return `Day ${index + 1}`;
            }
            const date = new Date(item.date);
            return date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
          });
        }

        incomeValues = data.map((item) => item.income || item.totalIncome || 0);
        expenseValues = data.map(
          (item) => item.expense || item.totalExpense || 0
        );
        balanceValues = data.map(
          (item) => item.balance || item.balanceEnd || item.saldo || 0
        );

        console.log("✅ Chart data prepared:");
        console.log("- Labels count:", labels.length);
        console.log("- Income values:", incomeValues);
        console.log("- Expense values:", expenseValues);
        console.log("- Balance values:", balanceValues);

        return {
          labels,
          datasets: [
            {
              label: "Saldo",
              data: balanceValues,
              borderColor: CHART_COLORS.balance.border,
              backgroundColor: CHART_COLORS.balance.background,
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              order: 1,
            },
            {
              label: "Pemasukan",
              data: incomeValues,
              borderColor: CHART_COLORS.income.border,
              backgroundColor: CHART_COLORS.income.background,
              borderWidth: 1,
              tension: 0.1,
              borderDash: [5, 5],
              fill: false,
              order: 2,
            },
            {
              label: "Pengeluaran",
              data: expenseValues,
              borderColor: CHART_COLORS.expense.border,
              backgroundColor: CHART_COLORS.expense.background,
              borderWidth: 1,
              tension: 0.1,
              borderDash: [5, 5],
              fill: false,
              order: 3,
            },
          ],
        };
      } catch (error) {
        console.error("❌ Error preparing chart data:", error);
        return { labels: [], datasets: [] };
      }
    },
    [validateChartData]
  );

  useEffect(() => {
    console.log("🎨 useChart effect triggered");

    if (!chartRef.current) {
      console.log("❌ No chart ref");
      return;
    }

    // Destroy existing chart first
    if (chartInstanceRef.current) {
      console.log("🗑️ Destroying existing chart");
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!validateChartData(chartData)) {
      console.log("❌ Invalid chart data, not creating chart");
      return;
    }

    try {
      const ctx = chartRef.current.getContext("2d");
      const chartConfig = prepareChartData(chartData, selectedRange);

      if (!chartConfig.labels.length) {
        console.log("❌ No labels for chart");
        return;
      }

      console.log("🎨 Creating new chart...");

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: chartConfig,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label || "";
                  const value = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(context.parsed.y);
                  return `${label}: ${value}`;
                },
              },
            },
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              beginAtZero: false,
              grid: { color: "rgba(0, 0, 0, 0.05)" },
              ticks: {
                callback: function (value) {
                  return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value);
                },
              },
            },
          },
          animation: { duration: 500 },
        },
      });

      console.log("✅ Chart created successfully");
    } catch (error) {
      console.error("❌ Error creating chart:", error);
    }

    return () => {
      if (chartInstanceRef.current) {
        console.log("🗑️ Cleanup: destroying chart");
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, selectedRange, prepareChartData, validateChartData]);

  return chartRef;
};
