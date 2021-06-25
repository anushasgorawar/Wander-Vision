const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const {reviewSchema} = require('../Schemas.js')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {validateReview,isLoggedIn,isReviewAuthor} =require('../middleware')

//Post review
router.post('/',isLoggedIn,validateReview,catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author=req.user.id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success',"Added new review");
    res.redirect(`/campgrounds/${campground._id}`);

}));

router.delete('/:rid',isLoggedIn,async(req,res)=>{
    const { rid , id} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: rid}})
    await Review.findByIdAndDelete(rid);
    req.flash('success','Your review is deleted');
    res.redirect(`/campgrounds/${id}`)
})

module.exports = router;