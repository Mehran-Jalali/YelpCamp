const express = require("express");
const router = express.Router({ mergeParams: true });
//*************ERROR HANDLING****************
const catchAsync = require("../utility/catchAsync");
const ExpressError = require("../utility/ExpressError");
//--------------------------------------------
const Review = require("../models/review");
const Campground = require("../models/campground");
const { reviewSchema } = require("../schemas");

// AND FOR REVIEW
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(`,`);
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};
// _5_ Add Review
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// _6_ Remove a review
// { $pull: {x : y} }  ==> It's gonna pull y from x's ARRAY.
router.delete(
  "/:reviewId",
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);
module.exports = router;
