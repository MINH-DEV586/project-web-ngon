const Expense = require('../models/expenseModel');

// 📦 Lấy tất cả chi tiêu
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }); // 👈 lọc theo user đăng nhập
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ➕ Thêm chi tiêu mới
exports.createExpense = async (req, res) => {
  try {
    console.log("📩 Body nhận được:", req.body);
    console.log("👤 User:", req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // ✅ Gộp dữ liệu body + userId
    const payload = {
      description: req.body.description,
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date || new Date(),
      notes: req.body.notes || '',
      userId: req.user._id,
    };

    console.log("🧾 Payload tạo expense:", payload);

    const expense = await Expense.create(payload);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("❌ Lỗi khi tạo expense:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// ✏️ Cập nhật chi tiêu
exports.updateExpense = async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log("Update Function: " + req.params.id);

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // ⚠️ Lỗi: dòng này bị đặt sai chỗ trong code gốc, nên không bao giờ chạy
    res.json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🗑️ Xóa chi tiêu
exports.delete = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    console.log("Delete Function: " + req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // ⚠️ Lỗi tương tự: res.json() phải nằm ngoài if
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📈 Báo cáo hàng tháng: tổng, top danh mục, chi theo ngày, tỉ lệ tiết kiệm
exports.getMonthlyReport = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1); // 1-12
    const monthlyLimit = req.query.monthlyLimit ? Number(req.query.monthlyLimit) : null;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const results = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lt: end } } },
      {
        $facet: {
          total: [ { $group: { _id: null, total: { $sum: '$amount' } } } ],
          byCategory: [ { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } } ],
          byDay: [ { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } }, { $sort: { '_id': 1 } } ]
        }
      }
    ]);

    const total = (results[0].total[0] && results[0].total[0].total) || 0;
    const topCategories = (results[0].byCategory || []).map((r) => ({ category: r._id, total: r.total }));
    const daily = (results[0].byDay || []).map((d) => ({ day: d._id, total: d.total }));

    let savingsRatio = null;
    if (monthlyLimit && monthlyLimit > 0) {
      const ratio = (monthlyLimit - total) / monthlyLimit;
      savingsRatio = Math.max(0, ratio); // không âm
    }

    res.json({ success: true, data: { total, topCategories, daily, savingsRatio, month, year } });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
