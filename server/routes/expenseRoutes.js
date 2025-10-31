const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, expenseController.getAllExpenses)
  .post(protect, expenseController.createExpense);

router
  .route('/:id')
  .put(protect, expenseController.updateExpense)
  .delete(protect, expenseController.delete);

module.exports = router;
