'use strict'
const fs = require('fs');
const path = require('path');

const nedb = require('nedb');
const express = require('express');
const app = express();

let indexStart, indexEnd;

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
	filename: 'moods.db',
	autoload: true,
	timestampData: true
});

app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
        db.find({}).sort({createdAt: -1}).exec(function (err, docs) {
            if (err) {
                    console.log(err);
            } else {
                if (docs) {
                    let moods = [];
                    docs.forEach(function (mood) {
                        let date = mood.createdAt;
                        let end = date.getHours();
                        let start = end - 2 < 0 ? 24 + (end - 2):(end - 2);
                        date = date.toDateString();
                        moods.push('<li class="list-group-item d-flex justify-content-between align-items-center">Time: ' + start + ':00-' + end + ':00, ' + mood.createdAt.toDateString() + '<span class="badge badge-primary badge-pill">' + mood.mood + '</span></li>');
                    });
                    let page = indexStart + moods.join(' ') + indexEnd;
                    res.send(page);
                }
            }
        });
        
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

app.post('/delete', function (req, res) {
        db.remove({}, {multi: true});
        res.redirect('/');
    });

app.listen(port, () => console.log(`Started on port ${port}!`));
