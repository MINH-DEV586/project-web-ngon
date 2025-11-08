import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function SpendingChart({ expenses }) {
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayExpenses = expenses.filter((e) => {
      const d = e.date ? String(e.date) : '';
      return d.split('T')[0] === date || d === date;
    });
    const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
  // Hiển thị ngày theo kiểu Việt Nam (VD: Thứ hai, 06/11/2025)
  date: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short' }),

  // Hiển thị tiền kiểu Việt Nam, không có số 0 thừa
  amount: Number(total).toLocaleString('vi-VN'),
};

  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">Chi Tiêu Hàng Tuần </h3>
      <p className="text-sm text-gray-500 mt-1">Biểu đồ giao dịch 7 ngày qua</p>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B6CF6" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`,'Đã tiêu',]}/>
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#lineGradient)"
            strokeWidth={4}
            dot={{ fill: "#6366F1", r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;
