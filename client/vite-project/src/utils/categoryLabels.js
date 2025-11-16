export const categories = [
  { value: 'Food', label: 'Ăn uống' },
  { value: 'Transport', label: 'Đi lại' },
  { value: 'Entertaiment', label: 'Giải trí' },
  { value: 'Shopping', label: 'Mua sắm' },
  { value: 'Bills', label: 'Hóa đơn' },
  { value: 'Others', label: 'Khác' },
]

const enToVn = categories.reduce((acc, c) => {
  acc[c.value] = c.label
  return acc
}, {})

enToVn['All'] = 'Tất cả'
enToVn['Uncategorized'] = 'Không phân loại'

export const toVN = (key) => enToVn[key] || key

export const values = categories.map((c) => c.value)
