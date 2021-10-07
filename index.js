/*
TODO: update sucessfull and cancel payment page.
TODO: block user to buy again course

FIXME use passport js to login.
*/

const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config()

//Mongoose model
const mongoose = require("mongoose");
const User = require("./model/user");
const Course = require("./model/course");
const Question = require("./model/question.js");
const Reviews = require('./model/review.js');
const Review = require("./model/review.js");

//Stripe
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const { log } = console;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://localhost:27017/tuition-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongo connected"))
  .catch((err) => console.log(err));

app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

app.get("/", function (req, res) {
  res.render("home", {atPage: "home"});
});

app.get("/aboutUs", (req, res) => {
  res.render("aboutUs", {atPage: "aboutUs"});
});

app.get("/course", async (req, res) => {
  const courses = await Course.find({});
  res.render("courses", {courses,atPage: "course"})
})

app.get("/course/:id", async (req, res) => {
  const {id} = req.params;
  const course = await Course.findById(id).populate({
    path: "question",
    populate: {
      path: "user",
      model: "User"
    }
  }).populate({path: "review", populate: {
    path: 'user',
    model: 'User'
  }});
  res.render("course", {course, atPage: "course"})
})

app.post("/user", async (req, res) => {
  const {email, name, photo} = req.body;
  const user = await User.find({email: {$eq: email}});
  if (user.length == 0){
    try {
      const newUser = await User({email, name, photo});
      newUser.save();
    } catch (error) {
      console.log(error.message)
    }
  }
  res.redirect("/");
})

app.post("/question", async(req, res) => {
  const {email, question, course} = req.body;
  const user = await User.findOne({email: {$eq: email}});
  const questionData = await Question({question, answer: "No reply yet", user:user._id});
  const courseData = await Course.findOne({title: course});
  courseData.question.push(questionData._id);
  await questionData.save();
  await courseData.save();
  return res.json({redirect: `/course/${courseData._id}`})
})

app.post("/review", async (req, res) => {
  const {email, review, course} = req.body;
  const user = await User.findOne({email: {$eq: email}});
  const reviewData = await Review({message: review, user: user._id})
  const courseData = await Course.findOne({title: course});
  courseData.review.push(reviewData._id);
  await reviewData.save()
  await courseData.save();
  return res.json({redirect: `/course/${courseData._id}`});
})


const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Learn React Today" }],
  [2, { priceInCents: 20000, name: "Learn CSS Today" }],
])


app.post("/create-checkout-session", async (req, res) => {
  const storeItem = await Course.findById(req.body.items.id);
  const line_items = [{
    price_data: {
      currency: "myr",
      product_data: {
        name: storeItem.title,
      },
      unit_amount: storeItem.price * 100,
    },
    quantity: req.body.items.quantity,
  }]
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment", 
      line_items: line_items,
      success_url: `${process.env.SERVER_URL}/`,
      cancel_url: `${process.env.SERVER_URL}/course`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
