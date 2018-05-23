'use strict'
const fs = require('fs');
const path = require('path');

const nedb = require('nedb');
const express = require('express');
const app = express();

var indexStart, indexEnd;

fs.readFile(path.join(__dirname, '/indexStart.html'), {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            indexStart = data;
        }
    });

fs.readFile(path.join(__dirname , '/indexEnd.html'), {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            indexEnd = data;
        }
    });

const port = process.env.PORT || 8080;

const db = new nedb({
	filename: 'messages.db',
	autoload: true,
	timestampData: true
});

app.use(express.urlencoded());

const htmlify = function(moods) {
    let newMoods = [];
    if (moods) {
        moods.forEach(function(mood) {
              newMoods.push('<li>' + mood.moodRating + '</li>');
        });  
    } else {
        console.log('Error: no values found in: ' + moods);
    }
    return newMoods;
}

app.get('/', function(req, res) {
        let moods = [];
        db.find({}, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Mood found: ' + data.mood);
                    moods.push('<li>' + data.moodRating + '</li>');
                }
            });
        let page = indexStart + moods.join('/n') + indexEnd;
        console.log(moods);
        console.log(page);
        res.send(page);
    });

app.post('/', function(req, res) {
        if (req.body.moodRating) {
            let moodRating = req.body.moodRating;
            db.insert({mood : moodRating}, function (err, data) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                });
        }
        res.redirect('/');
    });

app.listen(port, () => console.log(`Started on port ${port}!`));
