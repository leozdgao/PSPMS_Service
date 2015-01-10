var express = require('express');
var path = require('path');

var app = express();

app.use(require('morgan')('dev'));
// app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/user', require('./routes/user'));
app.use('/rest', require('./routes/rest'));

// error handler
app.use(function(err, req, res, next) {

    console.log(err);
    res.status(500).json(err);
});

var config = require('./config.json');
var port = process.env.PORT || config.port || 4000;

var Promise = require("bluebird");
var mongoose = require("mongoose");
Promise.promisifyAll(mongoose);

// set db connectiion config, timeout 5s
var dbConfig = {
    server: {
        socketOptions: { connectTimeoutMS: 5000 }
    }
};
mongoose.connectAsync(config.dbConnection, dbConfig)
    .then(function() {

        app.listen(port, function() {
            
            console.log('Express server listening on port ' + port);
        });
    })
    .catch(function(err) {

        console.log(err.err || err.message || "Connect failed.");
    });
    
mongoose.connection.on("error", function(err) {

    console.log(err.err || err.message || "Error occurred on connection.");
})
