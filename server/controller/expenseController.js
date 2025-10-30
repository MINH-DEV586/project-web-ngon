const Expense = require('../models/expenseModel');

// 📦 Lấy tất cả chi tiêu
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
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
    const { description, amount, category, date, notes } = req.body;
    const expense = new Expense({ description, amount, category, date, notes });
    const newExpense = await expense.save();
    res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
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
