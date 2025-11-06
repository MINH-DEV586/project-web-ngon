import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  Plus,
  Wallet,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import SpendingChart from '../components/SpendingChart'
import CategoryChart from '../components/CategoryChart'
import TransactionList from '../components/TransactionList'
import Model from '../components/Model'
import { fetchData, createData, deleteData, updateData } from '../api'

// 🖼️ Thêm logo
import logo from '../assets/favicon.png'
const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)


function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [isModelOpen, setIsModelOpen] = useState(false)
  const [isLimitOpen, setIsLimitOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [monthlyLimit, setMonthlyLimit] = useState(
    Number(localStorage.getItem('monthlyLimit')) || 1000
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showAlert, setShowAlert] = useState(false)

  const navigate = useNavigate()

  // 🚪 Logout
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất không?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
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

  // ⚠️ Cảnh báo vượt định mức
  useEffect(() => {
    setShowAlert(stats.total > monthlyLimit)
  }, [stats.total, monthlyLimit])

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

  // 💰 Lưu định mức
  const handleSaveLimit = (e) => {
      e.preventDefault()
      // Lấy giá trị, loại bỏ dấu chấm ra trước khi chuyển sang số
      const rawValue = e.target.limit.value.replace(/\./g, '')
      const newLimit = Number(rawValue)

      if (isNaN(newLimit) || newLimit <= 0) {
        alert('⚠️ Vui lòng nhập định mức hợp lệ.')
        return
      }

      setMonthlyLimit(newLimit)
      localStorage.setItem('monthlyLimit', newLimit)
      setIsLimitOpen(false)
}


  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100'>
      {/* 🔹 Header */}
      <header className='bg-white shadow-lg'>
        <div className='max-w-7xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-3'>
          {/* 🖼️ Logo + Tiêu đề */}
          <div className='flex items-center gap-3'>
            <img
              src={logo}
              alt='Expense Tracker Logo'
              className='w-10 h-10 rounded-xl object-cover shadow-sm'
            />
            <div>
              <h1 className='text-3xl font-bold text-gray-700 lg:text-4xl mb-1'>
                Quản Lí Chi Tiêu
              </h1>
              <p className='text-gray-700 text-sm'>Quản lí thu nhập của bạn một cách dễ dàng</p>
            </div>
          </div>

          {/* 🔘 Nút điều khiển */}
          <div className='flex items-center gap-3 flex-wrap'>
            <button
              onClick={() => setIsLimitOpen(true)}
              className='px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-amber-600 transition-all'
            >
              <SlidersHorizontal className='w-4 h-4' /> Thiết Lập Định Mức
            </button>

            <button
              onClick={() => {
                setEditingExpense(null)
                setIsModelOpen(true)
              }}
              className='px-4 py-2 bg-gray-700 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-800 transition-all'
            >
              <Plus className='w-4 h-4' /> Thêm Chi Tiêu
            </button>

            <button
              onClick={handleLogout}
              className='px-4 py-2 bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-red-600 transition-all'
            >
              <LogOut className='w-4 h-4' /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ⚠️ Alert nếu vượt định mức */}
      {showAlert && (
        <div className='max-w-7xl mx-auto mt-6 px-6'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2'>
            <AlertTriangle className='w-5 h-5 text-red-600' />
            <p className='font-semibold'>
              ⚠️ Warning: Chi tiêu của bạn ({formatVND(stats.total)}) đã vượt quá số tiền hàng tháng của bạn ({formatVND(monthlyLimit)})!
            </p>
          </div>
        </div>
      )}

      {/* 📈 Nội dung chính */}
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Thống kê */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            value={formatVND(stats.total)}
            title='Tổng Chi tiêu'
            icon={Wallet}
            subtitle={`Giới hạn chi tiêu: ${formatVND(monthlyLimit)}`}
            bgColor='bg-gradient-to-br from-indigo-500 to-indigo-600'
            iconColor='bg-indigo-700'
          />
          <StatCard
            value={stats.count}
            title='Giao Dịch'
            icon={ShoppingCart}
            subtitle='Chi tiêu'
            bgColor='bg-gradient-to-br from-purple-500 to-purple-600'
            iconColor='bg-purple-700'
          />
          <StatCard
            value={formatVND(stats.avg)}
            title='Trung Bình'
            icon={TrendingUp}
            subtitle='Mỗi giao dịch'
            bgColor='bg-gradient-to-br from-pink-500 to-pink-600'
            iconColor='bg-pink-700'
          />
          <StatCard
            value={formatVND(stats.highest)}
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
            <SpendingChart expenses={expenses} />
          </div>
          <div className='lg:col-span-2'>
            <CategoryChart categoryTotal={stats.categoryTotals} />
          </div>
        </div>

        {/* Danh sách giao dịch */}
        <TransactionList
          expenses={expenses}
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
          <div className='bg-white rounded-3xl p-6 w-full max-w-md shadow-xl'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Giới hạn số tiền trong tháng</h2>
            <form onSubmit={handleSaveLimit} className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Giới hạn số tiền tháng này (₫)
                </label>
                <input
                    type='text'
                    name='limit'
                    value={new Intl.NumberFormat('vi-VN').format(monthlyLimit)}
                    onChange={(e) => {
                      // Bỏ dấu chấm ra để lấy số thực
                      const rawValue = e.target.value.replace(/\./g, '')
                      // Nếu là số hợp lệ thì cập nhật
                      if (!isNaN(rawValue) && rawValue !== '') {
                        setMonthlyLimit(Number(rawValue))
                      } else if (rawValue === '') {
                        setMonthlyLimit(0)
                      }
                    }}
                    className='w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500'
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
    </div>
  )
}

export default Dashboard
