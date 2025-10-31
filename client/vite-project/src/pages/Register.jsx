import React, { useState } from 'react';
import { registerUser } from '../auth';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await registerUser(form);
    if (res.success) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      setError(res.message || 'Lỗi đăng ký');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <div className='bg-white p-8 rounded-2xl shadow-md w-96'>
        <h2 className='text-2xl font-bold mb-6 text-center text-indigo-600'>Đăng ký</h2>
        {error && <p className='text-red-500 mb-3'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='text'
            name='name'
            placeholder='Họ tên'
            value={form.name}
            onChange={handleChange}
            className='w-full border p-3 rounded-lg'
            required
          />
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
            className='w-full border p-3 rounded-lg'
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Mật khẩu'
            value={form.password}
            onChange={handleChange}
            className='w-full border p-3 rounded-lg'
            required
          />
          <button
            type='submit'
            className='w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700'
          >
            Đăng ký
          </button>
          <p className='text-center text-sm mt-3'>
            Đã có tài khoản?{' '}
            <span
              className='text-indigo-600 font-semibold cursor-pointer'
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
