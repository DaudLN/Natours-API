const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(`💥 ERROR 📢  ${err.name}: ${err.message}. Shutting down...`);

  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

// Connection to database
const PASSWORD = process.env.ALTAS_PASSWORD;
const DB_LOCAL = process.env.DATABASE_URL;
const DATABASE = process.env.DATABASE_ATLAS.replace('<PASSWORD>', PASSWORD);

mongoose
  .connect(DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB Connected');
  });
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`💥 ERROR 📢  ${err.name}: ${err.message}. Shutting down...`);
  server.close(() => {
    process.exit(1);
  });
});
