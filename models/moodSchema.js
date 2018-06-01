'use strict'
const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
    mood: {
        type: Number,
        require: true
    },
    start: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        require: true
    },
    comment: String
});

const Mood = mongoose.model('Mood', MoodSchema);
module.exports = Mood;
