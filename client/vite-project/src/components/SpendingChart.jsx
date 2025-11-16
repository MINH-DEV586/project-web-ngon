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

function SpendingChart({ expenses, month }) {
  // Nếu có prop `month` (YYYY-MM) thì hiển thị theo từng ngày của tháng đó,
  // ngược lại mặc định là 7 ngày gần nhất.
  let chartData = []

  if (month) {
    const [y, m] = month.split('-').map(Number)
    const daysInMonth = new Date(y, m, 0).getDate()
    const monthLabel = String(m).padStart(2, '0')

    chartData = [...Array(daysInMonth)].map((_, i) => {
      const day = i + 1
      const dayStr = String(day).padStart(2, '0')
      const dateKey = `${y}-${monthLabel}-${dayStr}`
      const dayExpenses = (expenses || []).filter((e) => {
        const d = e.date ? String(e.date) : ''
        return d === dateKey || d.split('T')[0] === dateKey
      })
      const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
      return {
        date: `${dayStr}/${monthLabel}`,
        amount: Number(total) || 0,
      }
    })
  } else {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    chartData = last7Days.map(date => {
      const dayExpenses = (expenses || []).filter((e) => {
        const d = e.date ? String(e.date) : '';
        return d.split('T')[0] === date || d === date;
      });
      const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

      return {
        date: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short' }),
        amount: Number(total) || 0,
      };
    })
  }

  const formatMonthVN = (ym) => {
    try {
      const d = new Date(`${ym}-01`)
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    } catch (e) {
      return ym
    }
  }

  const title = month ? `Chi Tiêu ${formatMonthVN(month)}` : 'Chi Tiêu Hàng Tuần'
  const subtitle = month ? `Biểu đồ giao dịch của ${formatMonthVN(month)}` : 'Biểu đồ giao dịch 7 ngày qua'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>

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
          <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => v.toLocaleString('vi-VN')} />
          <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Đã tiêu']} />
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
