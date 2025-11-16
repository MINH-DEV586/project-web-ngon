import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  Plus,
  Wallet,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  Moon,
  Sun,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import SpendingChart from '../components/SpendingChart'
import CategoryChart from '../components/CategoryChart'
import TransactionList from '../components/TransactionList'
import Model from '../components/Model'
import Hello from '../components/Hello'
import Export from '../components/Export'
import UserMenu from '../components/UserMenu'
import UserProfile from '../components/UserProfile'
import ChangePassword from '../components/ChangePassword'
import EditProfile from '../components/EditProfile'
import { fetchData, createData, deleteData, updateData } from '../api'

// 🖼️ Thêm logo
import logo from '../assets/favicon.png'
const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)


function Dashboard({ isDark, setIsDark }) {
  const [expenses, setExpenses] = useState([])
  const [isModelOpen, setIsModelOpen] = useState(false)
  const [isLimitOpen, setIsLimitOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  // Lưu định mức theo từng tháng: object keyed by 'YYYY-MM'
  const [monthlyLimits, setMonthlyLimits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('monthlyLimits')) || {}
    } catch (e) {
      return {}
    }
  })
  const [limitInput, setLimitInput] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showAlert, setShowAlert] = useState(false)

  const navigate = useNavigate()

  const getCurrentMonthKey = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())

  // Derived limit for the selected month
  const monthlyLimit = Number(monthlyLimits[selectedMonth] ?? 1000)

  // Sync limitInput when selectedMonth or monthlyLimits change
  useEffect(() => {
    setLimitInput(monthlyLimits[selectedMonth] ?? 1000)
  }, [selectedMonth, monthlyLimits])

  const formatMonthVN = (ym) => {
    try {
      const d = new Date(`${ym}-01`)
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    } catch (e) {
      return ym
    }
  }

  // 📊 Tính toán thống kê
  const calculateTotal = (list) => {
    const total = list.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const categoryTotals = list.reduce((acc, e) => {
      const cat = e.category || 'Uncategorized'
      acc[cat] = (acc[cat] || 0) + Number(e.amount || 0)
      return acc
    }, {})
    return {
      total,
      count: list.length,
      avg: list.length ? total / list.length : 0,
      highest: list.length ? Math.max(...list.map((e) => Number(e.amount || 0))) : 0,
      categoryTotals,
    }
  }

  const stats = calculateTotal(expenses)
  // Thống kê cho tháng đang chọn (format YYYY-MM)
  const monthExpenses = (expenses || []).filter((e) => {
    const d = e.date ? String(e.date) : ''
    return d.startsWith(selectedMonth)
  })
  const monthStats = calculateTotal(monthExpenses)

  // 🔄 Lấy dữ liệu từ API
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await fetchData()
        const normalized = (data || []).map((e) => ({
          ...e,
          date: e?.date ? e.date.split('T')[0] : new Date().toISOString().split('T')[0],
        }))
        setExpenses(normalized)
      } catch (error) {
        console.error('Error loading expenses:', error)
      }
    }
    loadExpenses()
  }, [])

  // ⚠️ Cảnh báo vượt định mức (so sánh theo tháng đang chọn)
  useEffect(() => {
    setShowAlert(monthStats.total > monthlyLimit)
  }, [monthStats.total, monthlyLimit])

  // ➕ Thêm chi tiêu
  const handleAddExpense = async (payload) => {
    try {
      const created = await createData(payload)
      setExpenses((prev) => [{ ...created, date: created.date.split('T')[0] }, ...prev])
      setIsModelOpen(false)
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  // ✏️ Sửa chi tiêu
  const onEditExpense = (expense) => {
    setEditingExpense(expense)
    setIsModelOpen(true)
  }

  const handleSaveEdit = async (payload) => {
    if (!editingExpense) return
    try {
      const updated = await updateData(editingExpense._id, payload)
      setExpenses((prev) =>
        prev.map((e) =>
          e._id === updated._id ? { ...updated, date: updated.date.split('T')[0] } : e
        )
      )
      setEditingExpense(null)
      setIsModelOpen(false)
    } catch (error) {
      console.error('Error saving edited expense:', error)
    }
  }

  // 🗑️ Xóa chi tiêu
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await deleteData(id)
      setExpenses((prev) => prev.filter((e) => e._id !== id))
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  // 💰 Lưu định mức cho tháng đang chọn
  const handleSaveLimit = (e) => {
    e.preventDefault()
    // Lấy giá trị từ input, loại bỏ dấu phân ngăn
    const rawValue = e.target.limit.value.replace(/\./g, '').trim()
    const newLimit = Number(rawValue)

    if (isNaN(newLimit) || newLimit <= 0) {
      alert('⚠️ Vui lòng nhập định mức hợp lệ.')
      return
    }

    const updated = { ...monthlyLimits, [selectedMonth]: newLimit }
    setMonthlyLimits(updated)
    localStorage.setItem('monthlyLimits', JSON.stringify(updated))
    setIsLimitOpen(false)
  }


  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100'}`}>
      {/* 🔹 Header */}
      <header className={`shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className='max-w-7xl mx-auto px-6 py-6 flex items-center gap-8'>
          {/* 🖼️ Logo + Tiêu đề */}
          
          <div className='flex items-center gap-6 flex-1'>
            <img
              src={logo}
              alt='Expense Tracker Logo'
              className='w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0'
            />
            {/* Month selector box ở góc trái - numeric months */}
            <div className='flex-1'>
              <h1 className={`text-3xl font-bold lg:text-4xl mb-1 whitespace-nowrap ${isDark ? 'text-gray-100' : 'text-gray-700'}`}>
                Quản Lí Chi Tiêu
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Quản lí thu nhập của bạn một cách dễ dàng</p>
            </div>
            <div className='flex flex-col flex-shrink-0'>
              <label className='text-xs text-gray-400 block'>Tháng</label>
              <div className='mt-1 flex items-center gap-2'>
                <select
                  value={selectedMonth.split('-')[1]}
                  onChange={(e) => {
                    const m = e.target.value.padStart(2, '0')
                    const y = selectedMonth.split('-')[0]
                    setSelectedMonth(`${y}-${m}`)
                  }}
                  className='px-2 py-1 rounded-lg border bg-white text-sm'
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option value={String(n).padStart(2, '0')} key={n}>{n}</option>
                  ))}
                </select>

                <select
                  value={selectedMonth.split('-')[0]}
                  onChange={(e) => {
                    const y = e.target.value
                    const m = selectedMonth.split('-')[1]
                    setSelectedMonth(`${y}-${m}`)
                  }}
                  className='px-2 py-1 rounded-lg border bg-white text-sm'
                >
                  {(() => {
                    const thisYear = new Date().getFullYear()
                    const years = []
                    for (let i = thisYear - 5; i <= thisYear + 2; i++) years.push(i)
                    return years.map((yr) => (
                      <option key={yr} value={String(yr)}>{yr}</option>
                    ))
                  })()}
                </select>
              </div>
            </div>
          </div>

          {/* 🔘 Nút điều khiển */}
          <div className='ml-auto flex items-center gap-3 flex-shrink-0'>
            <Hello token={localStorage.getItem('token')} />
            <Export expenses={expenses} />
            
            <button
              onClick={() => setIsLimitOpen(true)}
              className='px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-amber-600 transition-all'
            >
              <SlidersHorizontal className='w-4 h-4' /> Thiết Lập Định Mức
            </button>

            <button
              onClick={() => navigate('/reports/monthly')}
              className='px-4 py-2 bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-all'
            >
              📊 Báo cáo tháng
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                isDark 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                  : 'bg-gray-700 hover:bg-gray-800 text-white'
              }`}
              title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
            </button>

            <button
              onClick={() => {
                setEditingExpense(null)
                setIsModelOpen(true)
              }}
              className={`px-4 py-2 text-white rounded-xl font-semibold flex items-center gap-2 transition-all ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              <Plus className='w-4 h-4' /> Thêm Chi Tiêu
            </button>

            {/* UserMenu Dropdown */}
            <UserMenu
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenChangePassword={() => setIsChangePasswordOpen(true)}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* ⚠️ Alert nếu vượt định mức */}
      {showAlert && (
        <div className='max-w-7xl mx-auto mt-6 px-6'>
          <div className={`${isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded-xl flex items-center gap-2`}>
            <AlertTriangle className='w-5 h-5 text-red-600' />
            <p className='font-semibold'>
              ⚠️ Cảnh báo: Chi tiêu {formatMonthVN(selectedMonth)} ({formatVND(monthStats.total)}) đã vượt quá định mức ({formatVND(monthlyLimit)})!
            </p>
          </div>
        </div>
      )}

      {/* 📈 Nội dung chính */}
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Thống kê */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            value={formatVND(monthStats.total)}
            title={`Tổng Chi tiêu (${formatMonthVN(selectedMonth)})`}
            icon={Wallet}
            subtitle={`Giới hạn chi tiêu: ${formatVND(monthlyLimit)}`}
            bgColor='bg-gradient-to-br from-indigo-500 to-indigo-600'
            iconColor='bg-indigo-700'
          />
          <StatCard
            value={monthStats.count}
            title='Giao Dịch'
            icon={ShoppingCart}
            subtitle={`Tháng: ${formatMonthVN(selectedMonth)}`}
            bgColor='bg-gradient-to-br from-purple-500 to-purple-600'
            iconColor='bg-purple-700'
          />
          <StatCard
            value={formatVND(monthStats.avg)}
            title='Trung Bình'
            icon={TrendingUp}
            subtitle='Mỗi giao dịch'
            bgColor='bg-gradient-to-br from-pink-500 to-pink-600'
            iconColor='bg-pink-700'
          />
          <StatCard
            value={formatVND(monthStats.highest)}
            title='Cao nhất'
            icon={DollarSign}
            subtitle='Giao dịch cao nhất'
            bgColor='bg-gradient-to-br from-orange-500 to-orange-600'
            iconColor='bg-orange-700'
          />
        </div>

        {/* Biểu đồ */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8'>
          <div className='lg:col-span-3'>
            <SpendingChart expenses={monthExpenses} month={selectedMonth} />
          </div>
          <div className='lg:col-span-2'>
            <CategoryChart categoryTotal={monthStats.categoryTotals} />
          </div>
        </div>

        {/* Danh sách giao dịch */}
          <TransactionList
          expenses={monthExpenses}
          onDelete={handleDeleteExpense}
          onEdit={onEditExpense}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />
      </main>

      {/* Modal Thêm / Sửa */}
      <Model
        isOpen={isModelOpen}
        onclose={() => {
          setIsModelOpen(false)
          setEditingExpense(null)
        }}
        onsubmit={editingExpense ? handleSaveEdit : handleAddExpense}
        initialData={editingExpense}
      />

      {/* Modal Giới hạn */}
      {isLimitOpen && (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm'>
          <div className={`rounded-3xl p-6 w-full max-w-md shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Giới hạn số tiền trong tháng</h2>
            <form onSubmit={handleSaveLimit} className='space-y-4'>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Giới hạn số tiền tháng này (₫)
                </label>
                <input
                    type='text'
                    name='limit'
                    value={limitInput !== null ? new Intl.NumberFormat('vi-VN').format(limitInput) : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                      if (raw === '') return setLimitInput(0)
                      setLimitInput(Number(raw))
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-indigo-500 transition ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
              </div>
              <div className='flex gap-3 mt-4'>
                <button
                  type='submit'
                  className='flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition'
                >
                  Lưu
                </button>
                <button
                  type='button'
                  onClick={() => setIsLimitOpen(false)}
                  className='px-4 py-3 rounded-xl border font-semibold hover:bg-gray-100'
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👤 Modal Thông tin người dùng */}
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* 🔐 Modal Đổi mật khẩu */}
      <ChangePassword isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />

      {/* ✏️ Modal Chỉnh sửa hồ sơ */}
      <EditProfile 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={() => window.location.reload()}
      />
    </div>
  )
}

export default Dashboard
