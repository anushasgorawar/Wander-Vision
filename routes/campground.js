const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema}=require('../Schemas.js') 


const validateCampground = (req,res,next) =>{
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(l=>l.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

router.get('/',catchAsync(async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))
// CREATE
router.get('/addnew',(req,res)=>{
    res.render('campgrounds/addnew')
})

//Using Aysnc
router.post('/',validateCampground,catchAsync( async(req,res,next)=>{
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully added a new campground');
    res.redirect('/campgrounds');
}))
//Using TRYCATCH 
// router.post('/',async(req,res,next)=>{
//     try{
//     const campground = new Campground(req.body);
//     await campground.save();
//     res.redirect('/');
//     }catch(e){
//         next(e);
//     }
// })


//READ
router.get('/:id',catchAsync( async(req,res,next)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show',{campground});
}))

//UPDATE
router.get('/:id/edit',catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
}))
router.put('/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id,{...req.body.campground}); 
    req.flash('success','Updated your Campground');
    res.redirect(`/campgrounds/${id}`);
}))

//DELETE
router.delete('/:id',catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Your campground is deleted');
    res.redirect('/campgrounds');
}))


module.exports = router;