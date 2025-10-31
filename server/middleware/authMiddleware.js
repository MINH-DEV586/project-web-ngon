const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // 👇 Lấy token từ header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 🚫 Nếu không có token
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, token missing' });
    }

    // ✅ Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Gắn user vào request (bỏ password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found for this token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
