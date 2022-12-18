const express = require("express");
const mongoose = require("mongoose");
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//======================== How to Tell Express to Parse The Body or "req.body"
app.use(express.urlencoded({ extended: true }));
//============================================================================

app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// _1_ Add-New route
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

// _2_ Show route :
app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});

// _3_ Edit/Update route (so we need: 1=> "app.get()" to serve the form - 2=> "app.put")
app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
});
app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
  res.redirect(`/campgrounds/${campground._id}`);
});

// _4_ Delete route
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
