const app = require('./app');
require('dotenv').config();
const connectDB = require('./config/db');
connectDB();
const port =  process.env.PORT || 8001;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    server.close(() => {
        console.log("Server Stopped");
        process.exit(1);
    });

}
);