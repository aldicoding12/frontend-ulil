// DataTable.js - Perbaikan untuk passing data yang benar ke render functions
import React from "react";
import { formatCurrency } from "../utils/formatters";

const DataTable = ({
  title,
  data,
  columns,
  total,
  totalLabel,
  headerColor,
}) => {
  console.log(`DataTable ${title} data:`, data); // Debug log

  return (
    <>
      <h2 className={`text-lg font-semibold mb-4 ${headerColor}`}>{title}</h2>
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr
            className={`${headerColor
              .replace("text-", "bg-")
              .replace("-700", "-600")} text-white`}>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`p-2 ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left"
                }`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={item._id || item.id || index}
                className={index % 2 === 0 ? "bg-gray-50" : ""}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-2 ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : ""
                    }`}>
                    {col.render
                      ? // Pass the actual item, not just the value, to render function
                        col.render(item[col.key], item, index)
                      : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-4 text-gray-500">
                Data {title.toLowerCase()} tidak tersedia
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="font-semibold bg-gray-100">
            <td colSpan={columns.length - 1} className="p-2 text-left">
              {totalLabel}
            </td>
            <td className="p-2 text-right">{formatCurrency(total || 0)}</td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};

export default DataTable;
