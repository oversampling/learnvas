const mongoose = require("mongoose");
require("dotenv").config()

// connect to mongoose
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //check database connection
db.once("open", function () {
    console.log("database connected");
});

const courseModel = require("../model/course.js");

const seedDB = async () => {
    await courseModel.deleteMany({});
    const course1 = new courseModel({ title: "Object Oriented Programming", price: 55, instructor: "Estefania Cassingena Navone", description: "Learn Object Oriented Programming in Python with Step-by-Step Video Lectures, Projects, Exercises, Diagrams and More.", photo: "/Assets/undraw_data_processing_yrrv.svg", material: "wN0x9eZLix4" });
    await course1.save();
    // Create course using data from courses.csv
    const course2 = new courseModel({ title: "Python Course", price: 45, instructor: "Jose Portilla", description: "Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games", photo: "/Assets/undraw_programmer_imem.svg", material: "rfscVS0vtbw" });
    await course2.save();
    const course3 = new courseModel({ title: "C++ Course", price: 55, instructor: "Sam Pattuzzi", description: "Created in collaboration with Epic Games. Learn C++ from basics while making your first 4 video games in Unreal", photo: "/Assets/undraw_Code_review_re_woeb.svg", material: "vLnPwxZdW4Y" });
    await course3.save();
    const course4 = new courseModel({ title: "Node Js Course", price: 45, instructor: "Andrew Mead", description: "Learn Node.js by building real-world applications with Node JS, Express, MongoDB, Jest, and more!", photo: "/Assets/undraw_programming_2svr.svg", material: "Oe421EPjeBE" });
    await course4.save();
    const course5 = new courseModel({ title: "Data Science Course with Python", price: 55, instructor: "Jose Portilla", description: "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more!", photo: "/Assets/undraw_Secure_server_re_8wsq.svg", material: "LHBE6Q9XlzI&t=35168s" });
    await course5.save();
    const course6 = new courseModel({ title: "Machine Learning Tensor Flow Course", price: 45, instructor: "Maven Analytics", description: "Demystify Machine Learning and build foundational Data Science skills like regression & forecasting, without any code!", photo: "/Assets/undraw_server_cluster_jwwq.svg", material: "tPYj3fFJGjk&t=9314s" });
    await course6.save();
}

seedDB().then(() => {
    mongoose.connection.close();
})