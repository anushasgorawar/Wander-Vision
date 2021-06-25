const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateCampground,isAuthor }=require('../middleware.js')

router.get('/',catchAsync(async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))
// CREATE
router.get('/addnew',isLoggedIn,(req,res)=>{
        res.render('campgrounds/addnew')
})

//Using Aysnc
router.post('/',isLoggedIn,validateCampground,catchAsync( async(req,res,next)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    console.log(campground);
    await campground.save();
    req.flash('success','Successfully added a new campground');
    res.redirect('/campgrounds');
}))

//READ
router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    console.log(campground)
    res.render('campgrounds/show', { campground });
}));
//UPDATE
router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error',"Sorry, That campground doesn't exist");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}))
router.put('/:id',isLoggedIn,isAuthor,validateCampground,catchAsync(async(req,res)=>{
      const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground}); 
    req.flash('success','Updated your Campground');
    res.redirect(`/campgrounds/${id}`);
}))

//DELETE
router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Your campground is deleted');
    res.redirect('/campgrounds');
}))

module.exports = router;