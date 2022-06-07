const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
    },user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {versionKey: false})

const Question = mongoose.model("Questions", questionSchema)

module.exports = Question;