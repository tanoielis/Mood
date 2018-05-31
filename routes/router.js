'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/userSchema.js');

const authorize(req, res, next, cb)
    User.findById(req.session.userId);
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    let err = new Error('Not authorized!');
                    err.status = 400;
                    return next(err);
                } else {
                    return cb(req, res);
                }
            }
        });
    };

router.get('/', function(req, res) {
    return res.sendFile(path.join(__dirname + '/../authenticate.html'));
});


router.post('/', function(req, res, next) {
    // handle log ins
    if ('user' in req.body && 'password' in req.body) {
        User.authenticate(req.body.user, req.body.password, function(error, user) {
            if(error || !user) {
                let err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }            
});

router.get('/register', function(req, res) {
        return res.sendFile(path.join(__name + '/../register.html'));
    });

router.post('/register', function(req, res) {
        
    });

const mood = function(req, res) {    
            dbo.collection('moods').find().sort({createdAt: -1}).toArray(function (err, docs) {
                if (err) {
                        console.log(err);
                } else {
                    if (docs) {
                        let moods = [];
                        docs.forEach(function (mood) {
                            if ('createdAt' in mood === false) {
                                console.error('Depricated mood in database ' + JSON.stringify(mood));
                                return;
                            }
                            let date = mood.createdAt;
                            let start = new Date (date.getTime());
                            start.setHours(mood.start.substr(0, 2));
                            let end = new Date(start.getTime());
                            end.addHours(2);
                            moods.push('<li class="list-group-item d-flex justify-content-between align-items-center">Time: ' + start.getHours() + '-' + end.getHours() + ', ' + date.toDateString() + '<span class="badge badge-primary badge-pill">' + mood.mood + '</span></li>');
                        });
                        let page = indexStart + moods.join(' ') + indexEnd;
                        res.send(page);
                    }
                }
            });
            
        };
 
router.get('/mood', function(req, res, next) {
        authorize(req, res, next, mood);
   };

const addMood = function(req, res) {
    if ('moodRating' in req.body && 'startTime' in req.body) {
        let moodRating = req.body.moodRating;
        let startTime = req.body.startTime;
        let date = new Date();
        console.log(date);
        let options = {mood:moodRating,start:startTime,createdAt:date};
        dbo.collection('moods').insert(options, function (err) {
            if(err) {
                console.log(err);
            }
        });
    }
    res.redirect('/mood');
       });

router.post('/mood', function (req, res, next) {
        authorize(req, res, next, addMood);
    });

const deleteMoods = function (req, res) {
        let deletables = req.body.delete || {};
        dbo.collection('moods').remove(deletables, false);
        res.redirect('/mood');
    });

router.post('/mood/delete', function (req, res, next) {
        authorize(req, res, next, deleteMoods);
    });
