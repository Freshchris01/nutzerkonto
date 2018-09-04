'use strict';
const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const axios = require('axios');

const config = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.get('/', (req, res) => {
	let html = `
	<h1>Nutzerkonto Bund</h1>

	<h2>🔐 Datensafe</h2>`

	html += `<h2>🚀 Services</h2>
	<ul>
		<li><a href="/service-provider-1">service-provider-1</a></li>
	</ul>`

	res.send(html);
});

app.get('/service-provider-1', (req, res) => {
	let html = `
		<a href="/login/service-provider-1">Login with Nutzerkonto</a>`;
	res.send(html);
});

app.get('/login/:serviceURL', (req, res) => {
	let html = `
	<p>Du loggst dich mit deinem Nutzerkonto für den Service <b>${req.params.serviceURL}</b> ein:</p>
	<form action="/login/${req.params.serviceURL}" method="post">
		<input type="text" name="username" placeholder="Benutzername">
		<input type="text" name="password" placeholder="Passwort">
		<input type="submit" value="submit">
	</form>`;
	res.send(html);
});

app.post('/login/:serviceURL', (req, res) => {
	validateLogin(req.body.username, req.body.password).then(result => {
		res.redirect(result ? `/login-2fa/${req.params.serviceURL}?username=${req.body.username}` : `/login`);
	})
});

app.get('/login-2fa/:serviceURL', (req, res) => {
	let html = `
	<p>Hi ${req.query.username}! Please enter your 2FA Code:</p>
	<form action="/login-2fa/${req.params.serviceURL}" method="post">
		<input type="text" name="code" placeholder="Code">
		<input style="display:none;" type="text" name="username" value="${req.query.username}">
		<input type="submit" value="submit">
	</form>`;
	res.send(html);
});

app.post('/login-2fa/:serviceURL', (req, res) => {
	validate2FA(req.body.username, req.body.code).then(result => {
		res.redirect(result ? `/${req.params.serviceURL}` : `/login-2fa/${req.params.serviceURL}?username=${req.body.username}`);
	});
});

function validateLogin(username, password) {
	return axios.get(`${config.DATABASE}/login`, {
		params: {
			username: username,
			password: password
		}
	}).then(response => {
		return true;
	}).catch(error => {
		console.log(error);
		return false;
	});
}

function validate2FA(username, password) {
	return axios.get(`${config.LINOTP}/validate/check`, {
		params: {
			user: username,
			pass: password
		}
	}).then(response => {
		console.log(response);
		return response.data.result.value;
	}).catch(error => {
		console.log(error);
		return false;
	});
}


// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.send(err.message);
	});
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.send(err.message);
});

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
	console.log('Express server listening on port ' + server.address().port);
});
