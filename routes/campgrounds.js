const express = require("express");
const router = express.Router();
//*************ERROR HANDLING****************
const catchAsync = require("../utility/catchAsync");
const ExpressError = require("../utility/ExpressError");
//--------------------------------------------
const { campgroundSchema } = require("../schemas.js");

const Campground = require("../models/campground");

//==========[Define my Middleware with a Joi Fanction : validateCampground]=============
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(`,`);
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// _1_ Add-New route
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// _2_ Show route :
router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    } else {
      res.render("campgrounds/show", { campground });
    }
  })
);

// _3_ Edit/Update route (so we need: 1=> "app.get()" to serve the form - 2=> "app.put")
router.get(
  "/:id/edit",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);
router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated the campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// _4_ Delete route
router.delete(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  })
);
module.exports = router;
