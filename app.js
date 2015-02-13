var express = require('express');
var path = require('path');

var app = express();

var Promise = require("bluebird");
var mongoose = require("mongoose");
Promise.promisifyAll(mongoose);

// load config
var config = require('./config.json');

app.use(require('morgan')('dev'));

if(config.auth) app.use(require('./middlewares/auth')());
// routes
app.use('/user', require('./routes/user'));
app.use('/rest', require('./routes/rest'));
// serve static files
var serveStatic = require('serve-static');
var contentDesposition = require('content-disposition');
app.use('/download', serveStatic(config.staticFolder, {
    setHeaders: function(res, path) {
        //set header for downloading
        res.setHeader('Content-Disposition', contentDesposition(path));
    }
}));

// handle 404
app.use(function(req, res, next) {

    var err = new Error("Not found.");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {

    console.log(err);
    res.status(err.status || 500).json(err);
});

var port = process.env.PORT || config.port || 4000;
var connected = false;

// set db connectiion config, timeout 5s
var dbConfig = {
    server: {
        socketOptions: { connectTimeoutMS: 5000 }
    }
};

mongoose.connect(config.dbConnection, dbConfig);

mongoose.connection.on("connected", function() {

    console.log("Connected to DB...");
    connected = true;
});

mongoose.connection.on("disconnected", function() {

    // after a successful connecting, 
    // mongoose will reconnect automatically if connection disconnected.
    if(!connected) {

        console.log("DBConnection closed. Try to reconnect.");

        setTimeout(function() {

            mongoose.connection.open(config.dbConnection, dbConfig);
        }, 5000);   
    }
});

mongoose.connection.on("error", function(err) {

    console.log("Error occurred: " + err.message);
});

app.listen(port, function() {

    console.log("Server listening on port " + port);
});
