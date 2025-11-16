const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const { protect } = require('../middleware/authMiddleware');

// Báo cáo - PHẢI được định nghĩa TRƯỚC route /:id để tránh match sai
router.get('/reports/monthly', protect, expenseController.getMonthlyReport);

router
  .route('/')
  .get(protect, expenseController.getAllExpenses)
  .post(protect, expenseController.createExpense);

router
  .route('/:id')
  .put(protect, expenseController.updateExpense)
  .delete(protect, expenseController.delete);

module.exports = router;
