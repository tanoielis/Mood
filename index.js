'use strict'
// nodejs
const path = require('path');
// app
const express = require('express');
const session = require('express-session');
const app = express();
// database
const nconf = require('nconf');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
// config
nconf.argv()
    .env()
    .file('keys.json');

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const mPort = nconf.get('mongoPort');
const port = process.env.port || 8080;
const secret = nconf.get('secret');


Date.prototype.addHours=function(h){
    this.setTime(this.getTime()+(h*3600000));
    return this;
};

let uri = `mongodb://${user}:${pass}@${host}:${mPort}`;
if (nconf.get('mongoDatabase')) {
  uri = `${uri}/${nconf.get('mongoDatabase')}`;
}
console.log('Connecting to db: ' + uri);

mongoose.connect(uri);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', function () {

    // Hold session info
    app.use(session({
        secret: secret,
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db
        })
    }));
    // Parse form info
    app.use(express.urlencoded({extended: true}));
<<<<<<< HEAD
    app.use(express.json());
    // Serve static files from static folder
    app.use(express.static(__dirname + '/static'));
    // Add router
    const routes = require('./routes/router');
    routes.loadIndexModel();
    app.use('/', routes);

    // Catch 404
    app.use(function(req, res, next) {
        let err = new Error('File Not Found');
        err.status = 404;
        next(err);
    });

    // Error handler
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });

    app.listen(port, () => console.log(`Started server on port ${port}!`));
=======
    
    app.get('/', function(req, res) {
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
            
        });
    
    app.post('/', function(req, res) {
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
            res.redirect('/');
        });
    
    app.post('/delete', function (req, res) {
            let deletables = req.body.delete || {};
            dbo.collection('moods').remove(deletables, false);
            res.redirect('/');
        });
    
        app.listen(port, () => console.log(`Started server on port ${port}!`));
>>>>>>> master
});
