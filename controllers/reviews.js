const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.postReview = async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success',"Added new review");
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteReview = async(req,res)=>{
    const { rid , id} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: rid}})
    await Review.findByIdAndDelete(rid);
    req.flash('success','Your review is deleted');
    res.redirect(`/campgrounds/${id}`)
}