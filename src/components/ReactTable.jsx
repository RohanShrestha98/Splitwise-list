import React, { useEffect, useImperativeHandle } from "react";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { LiaSortSolid } from "react-icons/lia";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const ReactTable = React.forwardRef(
  ({ columns, data, setSelectedRows }, ref) => {
    const [rowSelection, setRowSelection] = React.useState({});
    const [sorting, setSorting] = React.useState([]);

    const table = useReactTable({
      data,
      columns,
      state: {
        rowSelection,
        sorting,
      },
      enableSorting: true,
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      debugTable: true,
      manualPagination: true,
    });

    useImperativeHandle(ref, () => ({
      clearSelection() {
        table.toggleAllRowsSelected(false);
      },
    }));

    useEffect(() => {
      const handleSelectedId = () => {
        const newData =
          data?.length > 0 &&
          setSelectedRows &&
          table
            ?.getSelectedRowModel()
            ?.flatRows?.map(
              (item) => item?.original?.id || item?.original?.student?.id
            );
        setSelectedRows && setSelectedRows(newData);
      };
      handleSelectedId();
    }, [table?.getSelectedRowModel()]);

    return (
      <div className="overflow-x-auto min-h-[64vh] bg-white no-scrollbar">
        {data?.length > 0 && (
          <table className="w-full table-auto border-collapse">
            <thead className="border-b border-t border-inputBorder">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = table
                      .getState()
                      .sorting.find((s) => s.id === header.column.id);

                    let Icon;
                    if (!sorted) Icon = LiaSortSolid; // neutral
                    else if (sorted.desc) Icon = AiOutlineArrowDown;
                    else Icon = AiOutlineArrowUp;

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="px-3 py-3 text-left leading-4 text-tableText font-medium text-xs cursor-pointer select-none whitespace-nowrap"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <Icon className="ml-1 w-3 h-3 text-gray-500 flex-shrink-0" />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white w-full">
              {table?.getRowModel()?.rows?.map((row) => (
                <tr key={row.id}>
                  {row?.getVisibleCells()?.map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 text-tableSubText text-xs border-b border-inputBorder whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
);

ReactTable.displayName = "ReactTable";

export { ReactTable };
