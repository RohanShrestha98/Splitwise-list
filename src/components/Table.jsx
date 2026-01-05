import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import { ReactTable } from "./ReactTable"; // Your custom ReactTable

export default function GoogleSheetTanstackTable() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [totalRohan, setTotalRohan] = useState(0);
  const [totalNiju, setTotalNiju] = useState(0);

  const SHEET_ID = "1OH7X2uQPG2cFxWL0eWePCbytZVE0APTPilulGl2U75E";
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  useEffect(() => {
    axios.get(SHEET_URL).then((res) => {
      const jsonData = JSON.parse(res.data.substring(47, res.data.length - 2));

      const cols = jsonData.table.cols.map((col) => col.label || "No Name");

      const rows = jsonData.table.rows.map((row) =>
        row.c.map((cell) => (cell ? cell.v : "-"))
      );

      // Calculate totals for Paid By
      let rohanTotal = 0;
      let nijuTotal = 0;
      rows.forEach((row) => {
        const paidBy = row[cols.indexOf("Paid By")];
        const amount = Number(row[cols.indexOf("Amount")] || 0);
        if (paidBy === "Rohan Shrestha") rohanTotal += amount;
        if (paidBy === "Niju Shrestha") nijuTotal += amount;
      });

      setTotalRohan(rohanTotal);
      setTotalNiju(nijuTotal);

      setData(rows);

      // Create dynamic columns
      const dynamicColumns = cols.map((header) => ({
        accessorKey: header,
        header: header,
        cell: ({ getValue }) => {
          let cellValue = getValue();

          // Format date columns
          if (
            header.toLowerCase().includes("date") ||
            header.toLowerCase().includes("time")
          ) {
            if (!cellValue) {
              cellValue = "-";
            } else if (
              typeof cellValue === "string" &&
              cellValue.startsWith("Date(")
            ) {
              // Extract numbers from Date(YYYY,MM,DD,HH,mm,ss)
              const numbers = cellValue.match(/\d+/g); // [2026,0,5,12,2,15]
              if (numbers && numbers.length >= 3) {
                const [year, month, day, hour = 0, min = 0, sec = 0] =
                  numbers.map(Number);
                const jsDate = new Date(year, month, day, hour, min, sec);
                cellValue = moment(jsDate).format("ddd, MMM D, YYYY"); // Tue, Jan 5, 2026
              }
            } else if (!isNaN(Number(cellValue))) {
              // Sheets serial number
              const jsDate = new Date(
                (Number(cellValue) - 25569) * 86400 * 1000
              );
              cellValue = moment(jsDate).format("ddd, MMM D, YYYY");
            } else if (typeof cellValue === "string") {
              // Normal string date
              const parsed = moment(cellValue, "M/D/YYYY HH:mm:ss");
              cellValue = parsed.isValid()
                ? parsed.format("ddd, MMM D, YYYY")
                : cellValue;
            }
          }

          // Paid By badges
          if (header === "Paid By") {
            return (
              <span
                className={`px-3 min-w-24 cursor-pointer line-clamp-1 py-[2px] rounded-full text-[10px] font-medium ${
                  cellValue === "Rohan Shrestha"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {cellValue}
              </span>
            );
          }

          // Email styling
          if (header === "Email Address") {
            return (
              <span
                className={`line-clamp-1 font-medium ${
                  cellValue === "nahorshrestha@gmail.com"
                    ? "text-blue-600"
                    : "text-green-600"
                }`}
              >
                {cellValue}
              </span>
            );
          }

          // Amount formatting
          if (header === "Amount") {
            return <span className="font-medium">${cellValue}</span>;
          }

          return cellValue;
        },
      }));

      setColumns(dynamicColumns);
    });
  }, []);

  const memoColumns = useMemo(() => columns, [columns]);

  // Prepare table data (no totals row)
  const memoData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((row) => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col.accessorKey] = row[index];
      });
      return obj;
    });
  }, [data, columns]);

  return (
    <div className="bg-white p-4 rounded-xl">
      <div className="flex items-center justify-between font-medium">
        <p className="text-gray-950  text-xl pb-2">Splitwise List</p>
        <p className="text-[14px] ">
          Due:{" "}
          <span
            className={`${
              totalNiju > totalRohan ? "text-red-600" : "text-green-600"
            }`}
          >
            ${totalNiju - totalRohan}
          </span>{" "}
        </p>
      </div>
      <ReactTable
        columns={memoColumns}
        data={memoData}
        emptyMessage="No data found"
      />

      {/* Totals at the bottom */}
      {/* <div className="flex justify-end gap-6 mt-4 font-semibold text-sm">
        <p>Total Rohan: ${totalRohan}</p>
        <p>Total Niju: ${totalNiju}</p>
        <p>Net Total: ${totalRohan - totalNiju}</p>
      </div> */}
    </div>
  );
}
