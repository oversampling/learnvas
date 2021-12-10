const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },instructor:{
        type: String,
        required: true
    },description: {
        type: String,
    },photo:{
        type: String,
        required: true
    },question: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Questions"
        }
    ],review: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Reviews"
        }
    ],material:{
        type: String, 
        require:true
    }
})

const Course = mongoose.model("Course", courseSchema)

module.exports = Course;