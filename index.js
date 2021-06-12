const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose= require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {campgroundSchema}=require('./Schemas.js')
const {reviewSchema} = require('./Schemas.js')
const morgan =  require('morgan');
const methodOverride = require('method-override');
const campgroundRouter = require('./routes/campground');
const reviewRouter = require('./routes/review');
const session = require('express-session')

const config = {
    secret:"Our secret",
    resave:false ,
    saveUninitialised : true,
    cookie : {
        httpOnly: true,
        expires: Date.now()+ (1000*60*60*24),
        maxAge : 1000*60*60*24
    }
}
app.use(session(config));

mongoose.connect('mongodb://localhost:27017/camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false 
});
const db=mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected");
})

app.use(morgan('dev'));

app.use(methodOverride('_method'))
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"/views"));

app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

 
app.use('/campgrounds',campgroundRouter)
app.use('/campgrounds/:id/review',reviewRouter)

app.get('/',(req,res)=>{
    res.render('home');
})


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500 }= err;
    if(!err.message ) err.message = "Something Went Wrong";
    res.status(statusCode).render('error',{err});

})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})
