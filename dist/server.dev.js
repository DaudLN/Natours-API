"use strict";

var dotenv = require('dotenv');

var mongoose = require('mongoose');

process.on('uncaughtException', function (err) {
  console.log("\uD83D\uDCA5 ERROR \uD83D\uDCE2  ".concat(err.name, ": ").concat(err.message, ". Shutting down..."));
  process.exit(1);
});

var app = require('./app');

dotenv.config({
  path: './config.env'
}); // Connection to database

var PASSWORD = process.env.ALTAS_PASSWORD;
var DB_LOCAL = process.env.DATABASE_URL;
var DATABASE = process.env.DATABASE_ATLAS.replace('<PASSWORD>', PASSWORD);
mongoose.connect(DB_LOCAL, {
  useNewUrlParser: true
}).then(function () {
  console.log('DB Connected');
});
var PORT = process.env.PORT || 8000;
var server = app.listen(PORT, function () {
  console.log("App is running on http://localhost:".concat(PORT));
});
process.on('unhandledRejection', function (err) {
  console.log("\uD83D\uDCA5 ERROR \uD83D\uDCE2  ".concat(err.name, ": ").concat(err.message, ". Shutting down..."));
  server.close(function () {
    process.exit(1);
  });
});