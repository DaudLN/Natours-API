const status = require('statuses');
const AppError = require('../util/AppError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(status('Bad Request'), message);
};

const handleDuplicateField = (err) => {
  const message = `${err.keyValue.name} already exist`;
  return new AppError(status('Bad Request'), message);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(status('Bad Request'), message);
};

const handleJsonWebTokenError = () =>
  new AppError(status('Unauthorized'), 'Invalid token. Please login again');

const handleTokenExpiredError = () =>
  new AppError(
    status('Unauthorized'),
    'Login token expired. Please signin again'
  );

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Catch an unhandled errors
    console.error('ERROR 💣 ', err);
    res.status(status('Internal Server Error')).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || status('Internal Server Error');
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name };
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateField(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, res);
  }
};
