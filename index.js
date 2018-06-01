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
});
