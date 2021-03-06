'use strict'
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    active: {
      type: Boolean,
      default: false
    }
});

//authenticate input against database
UserSchema.statics.authenticate = function(username, password, callback) {
    User.findOne({username: username})
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } else if (!user) {
                let err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            });
        });
    }

//hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
    let user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
