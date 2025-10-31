import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v2/expense';


// 🧠 Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 📦 Lấy tất cả chi tiêu
export const fetchData = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data.data;
};

// ➕ Thêm chi tiêu
export const createData = async (data) => {
  const res = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return res.data.data;
};

// ✏️ Cập nhật chi tiêu
export const updateData = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() });
  return res.data.data;
};

// 🗑️ Xóa chi tiêu
export const deleteData = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return res.data;
};