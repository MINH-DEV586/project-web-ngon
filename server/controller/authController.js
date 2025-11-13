const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// 🎫 Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// 🧍‍♂️ Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user: { id: user._id, name, email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔑 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👤 Xem thông tin người dùng
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔐 Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide current password, new password and confirm password' 
      });
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New passwords do not match' 
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Lấy user với password
    const user = await User.findById(req.user.id).select('+password');
    
    // Kiểm tra mật khẩu hiện tại
    const isPasswordCorrect = await user.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Cập nhật thông tin người dùng (tên, avatar)
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    // Kiểm tra tên
    if (name && name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name cannot be empty' 
      });
    }

    // Cập nhật thông tin
    const user = await User.findById(req.user.id);
    
    if (name) {
      user.name = name;
    }
    
    // Chỉ cập nhật avatar nếu có giá trị
    if (avatar && avatar !== null && avatar.length > 0) {
      // Giới hạn kích thước base64 (max 1MB)
      if (avatar.length > 1 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Avatar quá lớn. Vui lòng chọn ảnh nhỏ hơn.'
        });
      }
      user.avatar = avatar;
    }

    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
