const { createWriteStream } = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitizer = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const status = require('statuses');
const xss = require('xss-clean');

const AppError = require('./util/AppError');
const error = require('./middleware/error');
const loger = require('./logs/winstonLoger');
const reviewRouter = require('./routers/reviewRouter');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const viewRouter = require('./routers/viewRouter');

const app = express();
// MIDDLEWARES
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitizer());
app.use(xss());
app.use(hpp({ whitelist: ['duration'] }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(loger);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(
    rateLimit({
      windowMS: 60 * 60 * 1000,
      max: 100,
      message: 'Too many request, please slow down',
    })
  );
  const accessLogStream = createWriteStream(
    path.join(__dirname, 'logs/access.log'),
    { flags: 'a' }
  );
  app.use(morgan('common', { stream: accessLogStream }));
}
if (process.env.NODE_ENV === 'development') {
  app.use(rateLimit({ windowMS: 60 * 60 * 1000, max: 10000 }));
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(status('Not Found'), `Can't find ${req.url} on this server`)
  );
});

app.use(error);

module.exports = app;
