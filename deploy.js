'use strict';
const exec = require('child_process').exec;

const result = function(command, cb) {
    let child = exec(command, function(        
