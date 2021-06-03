const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const mongoose= require('mongoose');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema} = require('./schemas.js')

mongoose.connect('mongodb://localhost:27017/camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});
const db=mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected");
})

const app = express();

app.use(methodOverride('_method'))
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"/views"));

const morgan = require('morgan');
app.use(morgan('common'));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const validateCampground=(req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg= error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}

app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));
// CREATE
app.get('/campgrounds/addnew',(req,res)=>{
    res.render('campgrounds/addnew')
})
app.post('/campgrounds',validateCampground, catchAsync(async(req,res,next)=>{
    // if(!req.body.campground)  throw new ExpressError(400,'Invalid data');
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
//READ
app.get('/campgrounds/:id',catchAsync(async(req,res)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show',{campground});
    
}))

//EDIT
app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
}))
app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id,{...req.body.Campground},{runValidators:true,new:true});
        res.redirect(`/campgrounds/${campground._id}`);
}))

//DELETE
app.delete('/campgrounds/:id',catchAsync(async(req,res,next)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*',(req,res,next)=>{
    next(new ExpressError("Error Not Found",404))
})
app.use((err,req,res,next)=>{
    const {statusCode = 300} = err;
    if(!err.message) err.message = "Not Found";  
    console.log(err);
    // err.message = "Not Found"; 
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})