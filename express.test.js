const request = require('supertest');
const mongoose = require("mongoose");
const Course = require("./model/course");
const User = require("./model/user");
const Review = require("./model/review");
require("dotenv").config()
const app = require('./index');

describe("Check is page load correctly", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe('Test the addLike method', () => {
    beforeAll(() => {
        mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });
    test("It should has all courses in database", async () => {
        const response = await request(app).get("/course");
        expect(response.statusCode).toBe(200);
        const courses = await Course.find({});
        expect(courses.length).toBe(6);
    });
    test("It should display course with id in params", async () => {
        const course = await Course.findOne({ title: "Python Course" });
        const response = await request(app).get("/course/" + course._id);
        expect(response.statusCode).toBe(200);
    })
    test("Able to add new user", async () => {
        jest.setTimeout(100000);
        const response = await request(app).post("/user").send({
            name: "John",
            email: "john@gmail.com",
            photo: "https://lh3.googleusercontent.com/a/AATXAJxOTt0rWPu6UL4YBTHBzw2BoEPtsFZdmyUkT_wI=s96-c"
        });
        const user = await User.findOne({ email: "john@gmail.com" });
        expect(response.body.userID).toBe(user._id.toString());
        await User.deleteOne({ email: "john@gmail.com" });
    })
    test("Able to add new review", async () => {
        jest.setTimeout(100000);
        const user = await User({ email: "john@gmail.com", name: "John", photo: "https://lh3.googleusercontent.com/a/AATXAJxOTt0rWPu6UL4YBTHBzw2BoEPtsFZdmyUkT_wI=s96-c" });
        await user.save();
        const response = await request(app).post("/review").send({
            email: user.email,
            review: "Test Review #12345",
            course: "Python Course",
        });
        const review = await Review.findOne({ message: "Test Review #12345" });
        expect(review.message).toBe("Test Review #12345");
        expect(response.statusCode).toBe(200);
        await Review.deleteOne({ message: "Test Review #12345" });
        await User.deleteOne({ email: "john@gmail.com" });
    })
    afterAll((done) => {
        mongoose.connection.close();
        done();
    });
});