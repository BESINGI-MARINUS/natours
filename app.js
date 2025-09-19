const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const app = express();

// MIDDLEWARES
// app.use(helmet()); // Set security HTTP headers

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
        'style-src': [
          "'self'",
          'https://fonts.googleapis.com',
          "'unsafe-inline'",
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
      },
    },
  }),
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serving static files
app.use(express.static(`${path.join(__dirname, 'public')}`));
app.set('view engine', 'pug');
app.set('views', `${path.join(__dirname, 'view')}`);

// Limiting the number of api requests per hour. helps prvent DoS and Brute force attacks
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per `window` (here, per hour)
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. please try again in 1 hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit the size of the request body to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // Remove any characters that can be used to query the database

// Data sanitization against XSS (Cross-Site Scripting) attacks
app.use(xss()); // Remove any HTML tags from the request body

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // Whitelist of query parameters that are allowed to be duplicated
  }),
);

// Middleware to add a request time property to the request object
app.use((req, res, next) => {
  req.requestTime = `0${new Date().getDate()}-0${
    new Date().getMonth() + 1
  }-${new Date().getFullYear()}`;
  console.log(req.cookies);
  next();
});

// ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
