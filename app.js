const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utility/ExpressError");
const methodOverride = require("method-override");
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
