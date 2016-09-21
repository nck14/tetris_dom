var express = require('express');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session(
    {
        secret:'secret key',
        resave:true,
        saveUninitialized:true
}));
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.all('/', require("./routes/index.js"));
app.all('/signup', require("./routes/signup.js"));


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = http.createServer(app);
server.listen('3000', function(){
    console.log('Express server listening on port '+app.get('port'));
});
//require('./rooms.js')(server);
module.exports = app;
