const app = require('./app');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

require('dotenv').config();
connectDB();

const port = process.env.PORT || 8001;
const server = app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  server.close(() => {
    console.log('🛑 Server stopped');
    process.exit(1);
  });
});
