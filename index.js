const express = require('express');
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

const validateCampground = (req,res,next) =>{
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(l=>l.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

const validateReview= (req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(l=>l.message).join(',');
        throw new ExpressError(msg,400);
    }
    else {
        next();
    }
}

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

const morgan =  require('morgan');
app.use(morgan('dev'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'))
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"/views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/campgrounds',catchAsync(async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))
// CREATE
app.get('/campgrounds/addnew',(req,res)=>{
    res.render('campgrounds/addnew')
})

//Using Aysnc
app.post('/campgrounds',validateCampground,catchAsync( async(req,res,next)=>{
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect('/campgrounds');
}))
//Using TRYCATCH 
// app.post('/campgrounds',async(req,res,next)=>{
//     try{
//     const campground = new Campground(req.body);
//     await campground.save();
//     res.redirect('/campgrounds');
//     }catch(e){
//         next(e);
//     }
// })


//READ
app.get('/campgrounds/:id',catchAsync( async(req,res,next)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show',{campground});
}))

//UPDATE
app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
}))
app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
}))

//DELETE
app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//Post review
app.post('/campgrounds/:id/review',validateReview,catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));
app.delete('/campgrounds/:id/review/:rid',async(req,res)=>{
    const { rid , id} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: rid}})
    const review = await Review.findByIdAndDelete(rid);
    res.redirect(`/campgrounds/${id}`)
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
