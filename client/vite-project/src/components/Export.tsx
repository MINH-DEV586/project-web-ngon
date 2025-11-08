import React from 'react';
interface Expense {
    _id: string; 
    description: string; 
    amount: number; 
    category: string;
    date: string; 
    notes: string;

}

interface ExportProps {
    expenses: Expense[];
}

// 📥 HÀM XỬ LÝ XUẤT DỮ LIỆU SANG CSV
const handleExportToCSV = (expenses: Expense[]) => {
    if (!expenses || expenses.length === 0) {
        alert("Không có dữ liệu chi tiêu để xuất. Vui lòng kiểm tra lại dữ liệu đã tải.");
        return;
    }

    const DELIMITER = ';';
    const BOM = "\uFEFF";

    const headers = [
        "ID", "Mô tả", "Số tiền", "Danh mục", "Ngày Chi Tiêu", "Ghi chú"
    ].join(DELIMITER);

    const csvData = expenses.map(e => {
        const description = e.description ? e.description.replace(/;/g, ' ') : '';
        const notes = e.notes ? e.notes.replace(/;/g, ' ') : ''; 
        
        return [
            `"${e._id || ''}"`,
            `"${description}"`,
            e.amount || 0,
            e.category || 'N/A',
            // Sử dụng dữ liệu date đã được chuẩn hóa trong Dashboard (chỉ có YYYY-MM-DD)
            e.date, 
            `"${notes}"`, 
        ].join(DELIMITER); 
    }).join('\n');

    const csvContent = BOM + headers + '\n' + csvData;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    link.setAttribute("download", `chi_tieu_cot_loi_${today}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

// ⚛️ COMPONENT NÚT XUẤT FILE
const Export: React.FC<ExportProps> = ({ expenses }) => {
    return (
        <button
            onClick={() => handleExportToCSV(expenses)}
            className='px-4 py-2 bg-green-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-green-600 transition-all dark:bg-green-600 dark:hover:bg-green-700'
        >
            {/* Icon SVG cho biểu tượng Excel/Spreadsheet */}
            <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0zIDZIMjFWMjBoLTZWMTFoLTZ2OUgzdjExeiIvPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0xNyAyaDN2NmgtM1Yyem0tOCAwaDN2NmgtM1Yyem0tNSAwaDN2NmgtM1YyeiIvPjwvc3ZnPg==" 
                alt="Export" 
                className='w-4 h-4' 
            />
            Xuất Excel (CSV)
        </button>
    );
};

export default Export;