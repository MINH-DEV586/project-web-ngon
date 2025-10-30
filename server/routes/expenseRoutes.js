const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController.js');
router
    .get('/', expenseController.getAllExpenses)
    .post('/', expenseController.createExpense);
router
    .put('/:id', expenseController.updateExpense)
    .delete('/:id', expenseController.delete);
module.exports = router;        