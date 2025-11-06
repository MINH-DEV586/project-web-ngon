import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

function Model({ isOpen, onsubmit, initialData, onclose }) {
  const empty = {
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    notes: '',
  }

  const categories = ['Food', 'Transport', 'Entertaiment', 'Shopping', 'Bills', 'Others']
  const [formData, setFormData] = useState(initialData || empty)

  useEffect(() => {
    setFormData(initialData || empty)
  }, [initialData])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!formData.description || !formData.amount) {
      alert('Please fill in required fields')
      return
    }
    onsubmit({
      ...formData,
      amount: parseFloat(formData.amount.toString().replace(/\./g, '')),
    })
  }

  const formatAmount = (value) => {
    const num = value.toString().replace(/\./g, '')
    if (num === '' || isNaN(num)) return ''
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Expense' : 'Thêm chi tiêu'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Theo dõi chi tiêu của bạn</p>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition"
            onClick={onclose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Bạn đã mua gì?
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 
              rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tiền
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatAmount(formData.amount)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '')
                    if (!isNaN(raw)) {
                      setFormData({ ...formData, amount: raw })
                    }
                  }}
                  placeholder="0"
                  className="w-full pr-14 pl-4 py-3 bg-gray-50 border-2 border-gray-200 
                  rounded-xl focus:outline-none focus:border-indigo-500 text-right"
                />
                <span className="absolute right-3 top-3.5 text-gray-500 font-semibold text-sm">
                  VND
                </span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 
                rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Loại
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.category === cat
                      ? 'bg-indigo-600 text-white scale-105 shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              placeholder="Thêm 1 ghi chú..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 
              rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-800"
              onClick={handleSubmit}
            >
              {initialData ? 'Save Changes' : 'Lưu thay đổi'}
            </button>
            <button
              className="px-4 py-3 rounded-xl border font-semibold hover:bg-gray-50"
              onClick={onclose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Model
