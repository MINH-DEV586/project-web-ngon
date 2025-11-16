import React from "react";
import * as ExcelJS from 'exceljs';

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
  const handleExport = async () => {
    if (!expenses || expenses.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Hỏi người dùng có muốn xuất file không
    const shouldExport = window.confirm('Bạn có muốn xuất file Excel không?');
    if (!shouldExport) return;

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Chi Tiêu');

    // Thêm header
    const headerRow = worksheet.addRow(['Ngày', 'Danh mục', 'Mô tả', 'Số tiền (VND)']);

    // Style header
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'center' };
    });

    // Thêm dữ liệu
    let total = 0;
    expenses.forEach((expense) => {
      const row = worksheet.addRow([
        expense.date,
        expense.category,
        expense.description || '',
        expense.amount
      ]);
      
      // Canh phải cho cột tiền
      row.getCell(4).alignment = { horizontal: 'right' };
      total += expense.amount;
    });

    // Thêm dòng tổng
    const totalRow = worksheet.addRow(['TỔNG CỘNG', '', '', total]);
    totalRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'right' };
    });

    // Set column widths
    worksheet.columns = [
      { width: 15 },
      { width: 18 },
      { width: 30 },
      { width: 18 }
    ];

    // Freeze header
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ChiTieu_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);

    // Không in tự động — chỉ xuất file
  };

  return (
    <button 
      onClick={handleExport} 
      className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-green-600 transition-all"
    >
      📊 Xuất Excel
    </button>
  );
};

export default Export;
