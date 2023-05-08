/*
TODO: block user to buy again course

FIXME use passport js to login.
*/

const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config()

//Mongoose model
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongo connected"))
  .catch((err) => console.log(err));

const User = require("./model/user");
const Course = require("./model/course");
const Question = require("./model/question.js");
const Reviews = require('./model/review.js');
const Review = require("./model/review.js");
const { estimatedDocumentCount } = require("./model/user");
const { type } = require("os");

//Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const { log } = console;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.get("/course/:courseID", async (req, res) => {
  const {courseID} = req.params;
  const course = await Course.findById(courseID).populate(
    {
    path: "review", 
    populate: {
    path: 'user',
    model: 'User'
  }});
  res.render("course", {course, atPage: "course", courseID})
})

app.get("/:userID", (req, res) => {
  const {userID} = req.params
  res.render("home", {userID, atPage: "home"})
})

app.get("/:userID/aboutUs", (req, res) => {
  const {userID} = req.params;
  res.render("aboutUs", {userID, atPage: "aboutUs"});
});

app.get("/:userID/course", async (req, res) => {
  const courses = await Course.find({});
  const {userID} = req.params
  res.render("courses", {courses,atPage: "course", userID})
})

app.get("/:userID/course/:courseID", async (req, res) => {
  const {courseID} = req.params;
  const course = await Course.findById(courseID).populate(
    {
    path: "review", 
    populate: {
    path: 'user',
    model: 'User'
  }});
  const {userID} = req.params
  res.render("course", {course, atPage: "course", courseID, userID})
})

app.get("/:userID/mycourses", async(req, res) =>{
  const {userID} = req.params;
  const userCourses = await User.findById(userID).populate({
    path: "courses"
  })
  let courses = userCourses.courses
  res.render("userCoursesList", {atPage: "mycourses", userID, courses})
})

app.get("/:userID/mycourses/:courseID/course", async (req, res) =>{
  const {courseID, userID} = req.params;
  const user = await User.findById(userID).populate({
    path: "courses",
  });
  //FIXME make insert course to user more secure
  const isCourseExist = user.courses.some(({_id}) => {
    return _id.toString() === courseID 
  })
  if (!isCourseExist){
    await user.courses.push(mongoose.Types.ObjectId(courseID));
    await user.save();
  }
  const course = await Course.findById(courseID).populate({
    path: "question",
    populate: {
      path: "user",
      model: "User"
    }
  });
  res.render("userCourse", {courseID, atPage: "mycourse", course, userID})
})

app.post("/user", async (req, res) => {
  const {email, name, photo} = req.body;
  const user = await User.find({email: {$eq: email}});
  if (user.length == 0){
    try {
      const newUser = await User({email, name, photo});
      newUser.save();
      return res.json({userID: newUser._id.toString()});
    } catch (error) {
      console.log(error.message)
    }
  }else{
    return res.json({userID: user[0]._id.toString()});
  }
})

app.post("/question", async(req, res) => {
  const {userID, question, courseID} = req.body;
  const user = await User.findById(userID);
  const questionData = await Question({question, answer: "No reply yet", user:user._id});
  const courseData = await Course.findById(courseID);
  courseData.question.push(questionData._id);
  await questionData.save();
  await courseData.save();
  return res.json({redirect: `/${userID}/mycourses/${courseData._id}/course`})
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

app.post("/create-checkout-session", async (req, res) => {
  const storeItem = await Course.findById(req.body.items.id);
  const otherDetail = req.body.otherDetail
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
      success_url: `${process.env.SERVER_URL}/${otherDetail.userID}/mycourses/${storeItem._id}/course`,
      cancel_url: `${process.env.SERVER_URL}/${otherDetail.userID}/course`,
    })
    return res.json({ url: session.url, otherDetail })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
})

module.exports = app;