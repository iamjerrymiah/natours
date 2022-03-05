const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema({//used to describe the type of data used
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,  //to cut out white space from the front/back of an input 
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 //used to roundup decimals
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount:{
        type: Number,
        validate: {
          validator: function(val) {
            // this only points to current doc on NEW document creation
            return val < this.price;
          },
          message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    duration:{
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'difficulty is either: easy, medium or difficult'
        }
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    summary:{
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description:{
        type: String,
        trim: true 
    },
    imageCover:{
        type: String,  //name of the image
        required: [true, 'A tour must have a cover image']
    },
    image: [String],
    createdAt:{  //Time when the user created a tour
        type: Date,
        default: Date.now(),
        select:false 
    }, 
    secretTour: {
        type: Boolean,
        default: false
      },
    startDates: [Date],
    startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      locations: [ //embedding the location document
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ],
      guides: [  //referencing the user 
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ]
}, {
    toJSON: { virtuals:true },
    toObject: { virtuals:true }
});

//querying with indexes to increase reading performance
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1 is for ascending order //-1 is for descending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function(){  //calculating for amountofweeks
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //name of where the tour is stored in the reviewModel
  localField: '_id'         
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });


// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
  
    this.start = Date.now();
    next();
  });

  tourSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });
  
    next();
  });
  
  tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
  });
  


const Tour = mongoose.model('Tour', tourSchema);//mongoose model

module.exports = Tour;




/*tourSchema.pre('save', async function(next) { //embedding the guide to the tour collection with userID
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});*/

  // tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });


  /*// AGGREGATION MIDDLEWARE
  tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  
    console.log(this.pipeline());
    next();
  });*/
