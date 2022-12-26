const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
//*************ERROR HANDLING****************
const catchAsync = require("./utility/catchAsync");
const ExpressError = require("./utility/ExpressError");
//--------------------------------------------
const path = require("path");
const methodOverride = require("method-override");
const Campground = require("./models/campground");

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Mongo connection open!!`);
  })
  .catch((err) => {
    console.log("Mongo connection ERROR!!");
    console.log(err);
  });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//   console.log("Database connected");
// });

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//======================== How to Tell Express to Parse The Body or "req.body"
app.use(express.urlencoded({ extended: true }));
//============================================================================

app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// _1_ Add-New route
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
app.post(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    if (!req.body.campground)
      throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// _2_ Show route :
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
  })
);

// _3_ Edit/Update route (so we need: 1=> "app.get()" to serve the form - 2=> "app.put")
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  })
);
app.put(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// _4_ Delete route
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

//-----------------------------Basic Error Handling
app.all("*", (req, res, next) => {
  next(new ExpressError("page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "OH NO, SOMETHING WENT WRONG!";

  res.status(statusCode).render("error", { err });
});
//--------------------------------------------------
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
