import React from "react";
import { toVN } from '../utils/categoryLabels'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366F1", "#22C55E", "#EAB308", "#F43F5E"];

function CategoryChart({ categoryTotal }) {
  // ✅ Sửa tên key từ "colour" → "color" (thống nhất với cách dùng)
  const data = Object.entries(categoryTotal || {}).map(([name, value], index) => ({
    name: toVN(name),
    value,
    color: COLORS[index % COLORS.length],
  }));

  return (  
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Chi Tiêu Theo Danh Mục
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {/* ✅ Dùng item.color thay vì COLORS để đảm bảo khớp với data */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip  formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;
