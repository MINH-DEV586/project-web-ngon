import React from "react";

interface Expense {
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ExportProps {
  expenses: Expense[];
}

const Export: React.FC<ExportProps> = ({ expenses }) => {
  const handleExport = () => {
    if (!expenses || expenses.length === 0) return;

    const BOM = "\uFEFF"; 
    const DELIMITER = ";";

    const header = ["Ngày", "Danh mục", "Mô tả", "Số tiền (VND)"].join(DELIMITER);
    const rows = expenses.map(e =>
      [e.date, e.category, `"${(e.description || "").replace(/;/g, " ")}"`, e.amount].join(DELIMITER)
    );

    const csvContent = BOM + [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ChiTieu_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded-xl">
      Xuất Excel (CSV)
    </button>
  );
};

export default Export;
