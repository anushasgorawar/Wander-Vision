const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const {validateReview,isLoggedIn,isReviewAuthor} =require('../middleware')


const review = require('../controllers/reviews')

router.post('/',isLoggedIn,validateReview,catchAsync(review.postReview));

router.delete('/:rid',isLoggedIn,catchAsync(review.deleteReview))

module.exports = router;