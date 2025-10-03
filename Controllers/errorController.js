const AppError = require('./../utils/appError');

const handleCastErrDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateErrDB = (err) => {
  const field = `${err.errmsg}`.match(/(name:\s*"([^"]+)")/)[2];
  const message = `Duplicate field value: "${field}". please use another value`;
  return new AppError(message, 404);
};

const handleValidatioErrDB = (err) => {
  return new AppError(err.message, 404);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const errorDev = (error, req, res) => {
  // API error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error,
      stack: error.stack,
    });
  }

  // For rendered website
  console.error('ERROR 🚨🚨', error);
  res.status(error.statusCode).render('error', {
    title: 'Something went wrong',
    msg: error.message,
  });
};

const errorProd = (error, req, res) => {
  // A. API
  if (req.originalUrl.startsWith('/api')) {
    // Operational error; Send error
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // programming or other unknown error, conceal error message from user
    console.error('ERROR 🚨🚨', error);

    // Send a user-friendly response to user
    return res.status(500).json({
      status: 'error',
      message: 'Something really went wrong',
    });
  }

  //B. RENDERED WEBSITE
  if (error.isOperational) {
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong',
      msg: error.message,
    });
  }
  // programming or other unknown error, conceal error message from user
  console.error('ERROR 🚨🚨', error);

  // Send a user-friendly response to user
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (error, req, res, next) => {
  error.status = error.status || 'error';
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    errorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (error.name === 'CastError') error = handleCastErrDB(error);
    if (error.code === 11000) error = handleDuplicateErrDB(error);
    if (error.name === 'ValidationError') error = handleValidatioErrDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired. Please log in again.', 401);
    }
    // Send error response to user
    errorProd(error, req, res);
  }
};
