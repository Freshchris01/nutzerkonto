'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
let usersDB = require('./routes/userDB');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/exemplary-anbieter-service', function (req, res) {
	let html = ''
	html += "<body>"
	html += "<form action='/exemplary-anbieter-service/submit'  method='post' name='form1'>"
	html += "<p>Username:</p><input type= 'text' name='username'>"
	html += "<p>Password:</p><input type='text' name='password'>"
	html += "<p><input type='submit' value='submit'></p>"
	html += "</form>"
	html += "</body>"
	res.send(html)
})

app.post('/exemplary-anbieter-service/submit', function (req, res) {

	let dbResult = usersDB.find((user) => {
		return (user.username === req.body.username && user.password === req.body.password);
	})

	let reply = ''
	if (dbResult !== undefined) {
		reply += "<p>Welcome back " + req.body.username + "! Nice to see you!</p>"
		// reply += "<p>Your E-mail is " + req.body.password + "</p>"
	} else {
		reply += "Wrong username/password"
	}
	res.send(reply)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
	debug('Express server listening on port ' + server.address().port);
});
