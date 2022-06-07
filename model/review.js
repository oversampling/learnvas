const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {versionKey: false})

const Review = mongoose.model("Reviews", reviewSchema)

module.exports = Review;