// external or 3rd party imports here
const express = require('express');
const morgan = require('morgan');


// internal imports here
const globalErrorHandler = require('./utils/error_handler');
const AppError = require('./utils/app_error');
const requestTimeMiddleware = require('./middlewares/request_time.middleware');
const lumaaiRouter = require('./routers/lumaai.routes');
const runwareRouter = require('./routers/runware.routes');

// constants and variables definitions here
const app = express();

// define and use middlewares here
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// body parser with input data limit
app.use(express.json({ limit: '10kb' }));
// adds the request time to the request object
app.use(requestTimeMiddleware);

app.use('/api/v1/lumaai', lumaaiRouter);
app.use('/api/v1/runware', runwareRouter);
app.use('/', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is active!!',
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Unable to find ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
