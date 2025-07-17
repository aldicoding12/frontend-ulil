import React from "react";
import DataTable from "../../DataTable";
import AddButton from "../componens/AddButton ";
import {
  createIncomeColumns,
  createExpenseColumns,
} from "../../../utils/tableColumns";

const TransactionTables = ({
  incomes,
  expenses,
  totalIncome,
  totalExpense,
  onEditIncome,
  onDeleteIncome,
  onEditExpense,
  onDeleteExpense,
  onAddIncome,
  onAddExpense,
}) => {
  const incomeColumns = createIncomeColumns(
    onEditIncome,
    onDeleteIncome,
    incomes
  );
  const expenseColumns = createExpenseColumns(
    onEditExpense,
    onDeleteExpense,
    expenses
  );

  return (
    <>
      {/* Pemasukan */}
      <div className="overflow-x-auto transform hover:scale-[1.01] transition-transform duration-200">
        <AddButton onClick={onAddIncome} label="Pemasukan" type="income" />
        <DataTable
          title="Pemasukan"
          data={incomes}
          columns={incomeColumns}
          total={totalIncome}
          totalLabel="Total Pemasukan"
          headerColor="text-green-700"
        />
      </div>

      {/* Pengeluaran */}
      <div className="overflow-x-auto transform hover:scale-[1.01] transition-transform duration-200">
        <AddButton onClick={onAddExpense} label="Pengeluaran" type="expense" />
        <DataTable
          title="Pengeluaran"
          data={expenses}
          columns={expenseColumns}
          total={totalExpense}
          totalLabel="Total Pengeluaran"
          headerColor="text-red-700"
        />
      </div>
    </>
  );
};

export default TransactionTables;
