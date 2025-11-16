import React, { useEffect, useState } from 'react'
import { getMonthlyReport, fetchData } from '../api'
import { toVN } from '../utils/categoryLabels'
import { useNavigate } from 'react-router-dom'

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

export default function MonthlyReport() {
  const navigate = useNavigate()
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Yearly summary computed client-side
  const [yearlySummary, setYearlySummary] = useState([])

  const monthlyLimit = Number(localStorage.getItem('monthlyLimit')) || null

  useEffect(() => {
    load()
  }, [month, year])

  // Recompute yearly summary when year changes or monthlyLimits change
  useEffect(() => {
    loadYearlySummary()
  }, [year])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getMonthlyReport(month, year, monthlyLimit)
      setData(res)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải báo cáo')
    } finally {
      setLoading(false)
    }
  }

  const loadYearlySummary = async () => {
    try {
      // Fetch all expenses and aggregate by month for the selected year
      const all = await fetchData()
      const monthlyTotals = Array.from({ length: 12 }).map(() => 0)
      const monthlyCounts = Array.from({ length: 12 }).map(() => 0)

      all.forEach((e) => {
        const d = e?.date ? new Date(e.date) : null
        if (!d || isNaN(d.getTime())) return
        const y = d.getFullYear()
        if (y !== Number(year)) return
        const m = d.getMonth() // 0..11
        monthlyTotals[m] += Number(e.amount || 0)
        monthlyCounts[m] += 1
      })

      // Read per-month limits from localStorage (key: monthlyLimits JSON) or fallback to monthlyLimit
      let monthlyLimits = {}
      try {
        monthlyLimits = JSON.parse(localStorage.getItem('monthlyLimits')) || {}
      } catch (e) {
        monthlyLimits = {}
      }
      const defaultLimit = Number(localStorage.getItem('monthlyLimit')) || 0

      const rows = monthlyTotals.map((spent, idx) => {
        const m = idx + 1
        const key = `${year}-${String(m).padStart(2, '0')}`
        const limit = Number(monthlyLimits[key] ?? defaultLimit)
        const diff = limit - spent // positive = remaining, negative = exceeded
        const count = monthlyCounts[idx]
        return { month: m, spent, limit, diff, count }
      })

      setYearlySummary(rows)
    } catch (err) {
      console.error('Error loading yearly summary', err)
    }
  }

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>Báo Cáo Tháng</h2>
        <div className='flex items-center gap-3'>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className='px-3 py-2 border rounded'>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>{`Tháng ${i + 1}`}</option>
            ))}
          </select>
          <input type='number' value={year} onChange={(e) => setYear(Number(e.target.value))} className='px-3 py-2 border rounded w-28' />
          <button onClick={() => navigate('/dashboard')} className='px-4 py-2 bg-gray-200 rounded'>Quay lại</button>
        </div>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <div className='text-red-600 mb-4'>{error}</div>}

      {data && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-white rounded shadow'>
              <h3 className='text-sm text-gray-500'>Tổng chi (tháng)</h3>
              <p className='text-2xl font-bold'>{formatVND(data.total)}</p>
            </div>
            <div className='p-4 bg-white rounded shadow'>
              <h3 className='text-sm text-gray-500'>Tỉ lệ tiết kiệm</h3>
              <p className='text-2xl font-bold'>
                {data.savingsRatio === null ? 'N/A' : `${Math.round(data.savingsRatio * 100)}%`}
              </p>
            </div>
            <div className='p-4 bg-white rounded shadow'>
              <h3 className='text-sm text-gray-500'>Thời gian</h3>
              <p className='text-2xl font-bold'>Tháng {data.month} / {data.year}</p>
            </div>
          </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-white rounded shadow'>
              <h3 className='font-semibold mb-3'>Top danh mục tốn tiền nhất</h3>
              {data.topCategories.length === 0 && <p>Không có dữ liệu</p>}
              <ul className='space-y-2'>
                {data.topCategories.map((c) => (
                  <li key={c.category} className='flex justify-between'>
                    <span>{toVN(c.category)}</span>
                    <strong>{formatVND(c.total)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className='p-4 bg-white rounded shadow'>
              <h3 className='font-semibold mb-3'>Chi theo ngày</h3>
              {data.daily.length === 0 && <p>Không có dữ liệu</p>}
              <div className='max-h-64 overflow-auto'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='text-sm text-gray-500 border-b'>
                      <th className='py-2'>Ngày</th>
                      <th className='py-2'>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((d) => (
                      <tr key={d.day} className='border-b'>
                        <td className='py-2'>{d.day}</td>
                        <td className='py-2'>{formatVND(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Báo cáo năm (tính toán client-side) - hiển thị độc lập */}
      <div className='mt-8 p-4 bg-white rounded shadow'>
        <h3 className='text-lg font-semibold mb-3'>Báo Cáo Năm {year}</h3>
        <div className='max-h-96 overflow-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='text-sm text-gray-500 border-b'>
                <th className='py-2 w-1/3'>Tháng</th>
                <th className='py-2'>Số tiền</th>
              </tr>
            </thead>
            <tbody>
                  {yearlySummary.map((r) => (
                    <tr key={r.month} className='border-b'>
                      <td className='py-2'>Tháng {r.month}</td>
                      <td className='py-2'>
                        {r.count === 0 ? (
                          <span className='text-gray-400'>-</span>
                        ) : r.diff < 0 ? (
                          <span className='text-red-600'>-{formatVND(Math.abs(r.diff))}</span>
                        ) : (
                          <span className='text-green-600'>+{formatVND(r.diff)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className='font-bold'>
                    <td className='py-2'>Tổng năm</td>
                    <td className='py-2'>
                      {formatVND(yearlySummary.reduce((s, r) => s + (r.count > 0 ? (r.diff || 0) : 0), 0))}
                    </td>
                  </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
