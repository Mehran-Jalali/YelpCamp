const mongoose = require("mongoose");
const Campground = require("../models/campground");

const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      image: "http://source.unsplash.com/collection/484351",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia corrupti necessitatibus sequi explicabo aperiam aspernatur tempore adipisci fuga est. Aliquam?",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
