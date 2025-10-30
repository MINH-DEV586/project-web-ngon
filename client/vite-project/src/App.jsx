import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  Plus,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import StatCard from './components/StatCard'
import SpendingChart from './components/SpendingChart'
import CategoryChart from './components/CategoryChart'
import TransactionList from './components/TransactionList'
import Model from './components/Model'
import { fetchData, createData, deleteData, updateData } from './api'

function App() {
  const [expenses, setExpense] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModelOpen, setIsModelOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  // 🧮 Tính toán thống kê
  const calculateTotal = (expenseList) => {
    const list = expenseList || []
    const total = list.reduce((sum, e) => sum + Number(e.amount || 0), 0)

    const categoryTotals = list.reduce((acc, e) => {
      const category = e.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + Number(e.amount || 0)
      return acc
    }, {})

    return {
      total,
      count: list.length,
      avg: list.length ? total / list.length : 0,
      highest: list.length
        ? Math.max(...list.map((e) => Number(e.amount || 0)))
        : 0,
      categoryTotals,
    }
  }

  const stats = calculateTotal(expenses)

  // 🔄 Lấy dữ liệu từ API khi load trang
  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true)
      try {
        const expData = await fetchData()
        const normalized = (expData || []).map((e) => ({
          ...e,
          date: e?.date
            ? String(e.date).split('T')[0]
            : new Date().toISOString().split('T')[0],
        }))
        setExpense(normalized)
      } catch (error) {
        console.error('Error loading expenses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()
  }, [])

  // ➕ Thêm chi tiêu
  const handleAddExpense = async (payload) => {
    try {
      const created = await createData(payload)
      if (!created) throw new Error('Failed to create expense')
      setExpense((prev) => [
        { ...created, date: created.date.split('T')[0] },
        ...prev,
      ])
      setIsModelOpen(false)
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  // ✏️ Bắt đầu sửa chi tiêu
  const onEditExpense = (expense) => {
    setEditingExpense(expense)
    setIsModelOpen(true)
  }

  // 💾 Lưu khi sửa
  const handleSaveEdit = async (payload) => {
    if (!editingExpense) return
    try {
      const updated = await updateData(editingExpense._id, payload)
      setExpense((prev) =>
        prev.map((e) =>
          e._id === updated._id
            ? { ...updated, date: updated.date.split('T')[0] }
            : e
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
      setExpense((prev) => prev.filter((e) => e._id !== id))
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100'>
      {/* Header */}
      <div className='bg-white shadow-lg'>
        <div className='max-w-7xl mx-auto px-6 py-6 lg:py-4 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-700 lg:text-4xl mb-1'>
              Expense Tracker
            </h1>
            <p className='text-gray-700'>Manage your finance with ease</p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => {
                setEditingExpense(null)
                setIsModelOpen(true)
              }}
              className='px-4 py-2 bg-gray-600 text-white rounded-xl
              font-semibold hover:shadow-2xl transition-all flex items-center gap-2'
            >
              <Plus className='w-4 h-4' /> Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            value={`$${stats.total.toFixed(2)}`}
            title='Total Spent'
            icon={Wallet}
            subtitle='This month'
            bgColor='bg-gradient-to-br from-indigo-500 to-indigo-600'
            iconColor='bg-indigo-700'
          />
          <StatCard
            value={stats.count}
            title='Expenses'
            icon={ShoppingCart}
            subtitle={`${stats.count} Transactions`}
            bgColor='bg-gradient-to-br from-purple-500 to-purple-600'
            iconColor='bg-purple-700'
          />
          <StatCard
            value={`$${stats.avg.toFixed(2)}`}
            title='Average'
            icon={TrendingUp}
            subtitle='Per expense'
            bgColor='bg-gradient-to-br from-pink-500 to-pink-600'
            iconColor='bg-pink-700'
          />
          <StatCard
            value={`$${stats.highest.toFixed(2)}`}
            title='Highest'
            icon={DollarSign}
            subtitle='Single expense'
            bgColor='bg-gradient-to-br from-orange-500 to-orange-600'
            iconColor='bg-orange-700'
          />
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8'>
          <div className='lg:col-span-3'>
            <SpendingChart expenses={expenses} />
          </div>
          <div className='lg:col-span-2'>
            <CategoryChart categoryTotal={stats.categoryTotals} />
          </div>
        </div>

        {/* ✅ Transaction List */}
        <TransactionList
          expenses={expenses}
          onDelete={handleDeleteExpense}
          onEdit={onEditExpense}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />
      </div>

      {/* Modal thêm/sửa */}
      <Model
        isOpen={isModelOpen}
        onclose={() => {
          setIsModelOpen(false)
          setEditingExpense(null)
        }}
        onsubmit={editingExpense ? handleSaveEdit : handleAddExpense}
        initialData={editingExpense}
      />
    </div>
  )
}

export default App
