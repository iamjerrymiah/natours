const mongoose = require('mongoose');
const dotenv = require('dotenv');
 
process.on('uncaughtException', err => { //Error handler to catch any sychronous code
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    //console.log(err.stack)
    process.exit(1);
  });

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);//connecting to DB and replac password

mongoose.connect(DB, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=> console.log("DB was connected successfully"));


//Port number
const port = process.env.PORT || 3000;
//Starting the server
const server = app.listen(port, ()=> {
    console.log("App running at port " + port);
});

process.on('unhandledRejection', err => { //Error handling for database connection errors
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
    process.exit(1);
    });
}); 
  
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });


//Creating a document in the database
/*const testTour = new Tour({
    name: 'Forest Hikers',
    rating: 4.9,
    price: 497
});

testTour.save().then(doc=>{
    console.log(doc)
}).catch(err=> {
    console.log('ERROR: ', err)
});*/
