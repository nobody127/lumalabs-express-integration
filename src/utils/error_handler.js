const AppError = require('./app_error');

const handleMongoCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}!!`;
  return new AppError(message, 400);
};

const handleMongoValidationError = (err) => {
  const message = Object.values(err.errors)[0].message;
  return new AppError(message, 400);
};

const handleMongoDuplicateKeyError = (err) => {
  // Extracting the field and value that caused the duplicate key error
  const field = Object.keys(err.errorResponse.keyValue)[0];
  const value = err.errorResponse.keyValue[field];

  const message = `Duplicate field value: '${field}' with value: '${value}'`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) => {
  return new AppError('Invalid Auth Token!! Please Login Again.', 401);
};
const handleTokenExpiredError = (err) => {
  return new AppError('Auth Token Expried!! Please Login Again.', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // use this to send only operational error to client and not programming error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error:', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = {
      ...err,
      message: err.message, // Ensure message is copied
      name: err.name,
      statusCode: err.statusCode,
    };

    if (err.errors) {
      console.error('Error:', Object.values(err.errors)[0].name);

      if (Object.values(err.errors)[0].name === 'CastError') {
        error = handleMongoCastError(error);
      }
      if (Object.values(err.errors)[0].name === 'ValidatorError') {
        error = handleMongoValidationError(error);
      }
    }

    if (err.name) {
      if (err.name === 'JsonWebTokenError') {
        error = handleJsonWebTokenError(error);
      }
      if (err.name === 'TokenExpiredError') {
        error = handleTokenExpiredError(error);
      }
    }

    if (err.errorResponse)
      if (err.errorResponse.code === 11000) {
        error = handleMongoDuplicateKeyError(error);
      }

    sendErrorProd(error, res);

    // Decide if error is critical
    const isCritical = error.statusCode >= 500;

    if (isCritical) {
      // TODO: Mail critical errors to dev team
    }
  }
};
