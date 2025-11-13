import React, { useState, useEffect } from 'react'
import { X, User, Image } from 'lucide-react'
import { getUserProfile, updateProfile } from '../api'

export default function EditProfile({ isOpen, onClose, onProfileUpdated }) {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile()
    }
  }, [isOpen])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const userData = await getUserProfile()
      setUser(userData)
      setName(userData.name)
      setPreviewAvatar(userData.avatar || '')
      setAvatarFile(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Compress image before converting to base64
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const imageElement = document.createElement('img')
        imageElement.src = event.target.result
        imageElement.onload = () => {
          const canvas = document.createElement('canvas')
          let width = imageElement.width
          let height = imageElement.height

          // Giữ tỷ lệ, max 400x400
          const maxSize = 400
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(imageElement, 0, 0, width, height)

          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        imageElement.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB')
        return
      }

      try {
        setError('')
        const compressedBase64 = await compressImage(file)
        setAvatarFile(compressedBase64)
        setPreviewAvatar(compressedBase64)
      } catch (err) {
        setError('Lỗi khi xử lý ảnh. Vui lòng thử lại.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!name || name.trim().length === 0) {
      setError('Tên không thể để trống')
      return
    }

    try {
      setLoading(true)
      
      // Gửi avatar nếu có, nếu không thì gửi null
      const updatedUser = await updateProfile(name, avatarFile || null)
      
      // Update localStorage
      const userInStorage = JSON.parse(localStorage.getItem('user'))
      userInStorage.name = updatedUser.name
      if (updatedUser.avatar) {
        userInStorage.avatar = updatedUser.avatar
      }
      localStorage.setItem('user', JSON.stringify(userInStorage))

      setSuccess(true)
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser)
      }
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Error:', err)
      setError(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa hồ sơ</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Cập nhật hồ sơ thành công!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !user && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Form */}
        {user && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-blue-200">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-blue-400" />
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors">
                <Image size={18} />
                <span>Chọn ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên của bạn
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
