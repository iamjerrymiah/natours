const path = require('path');
const express = require('express');
const { json } = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); 
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController'); 
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');  //setting template engine(pug)
app.set('views', path.join(__dirname, 'views')); 

// GLOBAL MIDDLEWARES
//middleWare for serving static files like HTML
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API or IP
const limiter = rateLimit({
  max: 100,  //Be flexible with the max, according to what you are building
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); //works on any req with /api in route


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); 
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);//Middleware for Routing
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req,res,next)=> { //Error handling for routes //means for everything{routes in this case}
   /* res.status(404).json({
        status: 'fail',
        message: `can't find ${req.originalUrl} on this server`
      });*/

        /*const err = new Error(`can't find ${req.originalUrl} on this server`);
        err.status = 'fail';
        err.statusCode = 404;*/


    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;




//creating API for tours using Get 
//app.get('/api/v1/tours', getAllTours);
//identifying each request with an ID
//app.get('/api/v1/tours/:id', getOneTour);
//creatng Api for new request using Post
//app.post('/api/v1/tours', createNewTour);