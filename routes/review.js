const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {reviewSchema} = require('../Schemas.js')

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

//Post review
router.post('/',validateReview,catchAsync(async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));

router.delete('/:rid',async(req,res)=>{
    const { rid , id} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: rid}})
    await Review.findByIdAndDelete(rid);
    res.redirect(`/campgrounds/${id}`)
})

module.exports = router;