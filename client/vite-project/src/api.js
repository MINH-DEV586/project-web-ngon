import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v2/expense';

// 🔐 Lấy header có token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

// 📦 Lấy tất cả chi tiêu (theo user)
export const fetchData = async () => {
  try {
    const res = await axios.get(API_URL, getAuthHeader());
    return res.data.data || [];
  } catch (error) {
    console.error('❌ Fetch expenses failed:', error.response?.data || error.message);
    throw error;
  }
};

// ➕ Tạo chi tiêu mới
export const createData = async (data) => {
  try {
    const res = await axios.post(API_URL, data, getAuthHeader());
    return res.data.data;
  } catch (error) {
    console.error('❌ Create expense failed:', error.response?.data || error.message);
    throw error;
  }
};

// ✏️ Cập nhật chi tiêu
export const updateData = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    return res.data.data;
  } catch (error) {
    console.error('❌ Update expense failed:', error.response?.data || error.message);
    throw error;
  }
};

// 🗑️ Xóa chi tiêu
export const deleteData = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error('❌ Delete expense failed:', error.response?.data || error.message);
    throw error;
  }
};
