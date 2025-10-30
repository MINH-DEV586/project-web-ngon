// api.js
import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api/v2'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
})

// ✅ Lấy danh sách chi tiêu
export const fetchData = async () => {
  const res = await api.get('/expense')
  return (res.data && res.data.data) || []
}

// ✅ Tạo mới chi tiêu
export const createData = async (payload) => {
  const res = await api.post('/expense', payload)
  return (res.data && res.data.data) || []
}

// ✅ Cập nhật chi tiêu
export const updateData = async (id, payload) => {
  const res = await api.put(`/expense/${id}`, payload)
  return (res.data && res.data.data) || []
}

// ✅ Xóa chi tiêu
export const deleteData = async (id) => {
  const res = await api.delete(`/expense/${id}`)
  return res.data || null
}
