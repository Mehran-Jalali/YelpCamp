const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utility/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
// Router -  Router -  Router -  Router -  Router
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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
//======================================================================================
app.use(express.static(path.join(__dirname, "public")));
//======================================================================================
const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //1000 : Miliseconds in a second, 60 seconds in a minute, 60 minutes in an hour, 24 hours in a day, 7 days in a week
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
//============================================================================
app.use(flash());
//=====================Set up middleware for flash-message=======================================================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
//============================================================================
// Set The '/camogrounds' routes with campgrounds imported routes.
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

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
