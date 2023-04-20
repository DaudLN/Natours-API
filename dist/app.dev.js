"use strict";

var _require = require('fs'),
    createWriteStream = _require.createWriteStream;

var cookieParser = require('cookie-parser');

var cors = require('cors');

var express = require('express');

var helmet = require('helmet');

var hpp = require('hpp');

var mongoSanitizer = require('express-mongo-sanitize');

var morgan = require('morgan');

var path = require('path');

var rateLimit = require('express-rate-limit');

var status = require('statuses');

var xss = require('xss-clean');

var AppError = require('./util/AppError');

var error = require('./middleware/error');

var loger = require('./logs/winstonLoger');

var reviewRouter = require('./routers/reviewRouter');

var tourRouter = require('./routers/tourRouter');

var userRouter = require('./routers/userRouter');

var viewRouter = require('./routers/viewRouter');

var app = express(); // MIDDLEWARES

app.use(helmet());
app.use(express.json({
  limit: '10kb'
}));
app.use(cookieParser());
app.use(mongoSanitizer());
app.use(xss());
app.use(hpp({
  whitelist: ['duration']
}));
app.use(express["static"](path.join(__dirname, 'public')));
app.use(loger);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(rateLimit({
    windowMS: 60 * 60 * 1000,
    max: 100,
    message: 'Too many request, please slow down'
  }));
  var accessLogStream = createWriteStream(path.join(__dirname, 'logs/access.log'), {
    flags: 'a'
  });
  app.use(morgan('common', {
    stream: accessLogStream
  }));
}

if (process.env.NODE_ENV === 'development') {
  app.use(rateLimit({
    windowMS: 60 * 60 * 1000,
    max: 10000
  }));
  app.use(morgan('dev'));
}

app.use(function (req, res, next) {
  console.log(req.cookies);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', function (req, res, next) {
  next(new AppError(status('Not Found'), "Can't find ".concat(req.url, " on this server")));
});
app.use(error);
module.exports = app;