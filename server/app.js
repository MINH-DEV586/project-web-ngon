const express = require('express');
const cors = require("cors")
const dotenv = require('dotenv');
const expenseRoute = require('./routes/expenseRoutes');
const app = express();
app.use(express.json());
app.use(cors());


app.use('/api/v2/expense', expenseRoute);




module.exports = app;