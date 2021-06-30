// if(process.env.NODE_ENV!=="production"){
//     require('dotenv').config();
// }
    require('dotenv').config();
// console.log(process.env.CLOUDINARY_CLOUD_NAME)

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose= require('mongoose');
const ExpressError = require('./utils/ExpressError');
const morgan =  require('morgan');
const methodOverride = require('method-override');
const campgroundRouter = require('./routes/campground');
const reviewRouter = require('./routes/review');
const userRouter = require('./routes/user')
const session = require('express-session')
const flash= require('connect-flash')
const localStrategy = require('passport-local')
const passport = require('passport');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize({
    replaceWith: '_',
  }));

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

const config = {
    name: "Wanderer",
    secret:"Our secret",
    resave:false ,
    saveUninitialized : true,
    cookie : {
        httpOnly: true,
        // secure:true,
        expires: Date.now()+ (1000*60*60*24),
        maxAge : 1000*60*60*24
    }
}
app.use(session(config));
app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next(); 
})


app.use('/',userRouter)
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
    if(err.kind == 'ObjectId'){
        req.flash('error',"Campground not found");
        return res.redirect('/campgrounds')
    }
    if(!err.message ) err.message = "Something Went Wrong";
    res.status(statusCode).render('error',{err});

})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})
