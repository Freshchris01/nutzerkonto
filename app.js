'use strict';
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const axios = require('axios');

const usersDB = require('./userDB');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.send(`
	<h1>Nutzerkonto Bund</h1>
	<h2>Stammdaten</h2>
	<p>TODO</p>
	<h2>Services</h2>
	<ul>
		<li><a href="/service-provider-1">service-provider-1</a></li>
	</ul>`);
});

app.get('/service-provider-1', (req, res) => {
	let html = `
	<form action="/service-provider-1/auth" method="post">
		<input type="text" name="username" placeholder="Benutzername">
		<input type="text" name="password" placeholder="Passwort">
		<input type="submit" value="submit">
	</form>`;

	res.send(html);
});

app.post('/service-provider-1/auth', (req, res) => {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

	axios.get('https://nutzerkonto-db.herokuapp.com/login', {
		params: {
			username: req.body.username,
			password: req.body.password
		}
	}).then(response => {
		console.log(response);
		let html = `
			<p>Hi ${req.body.username}! Please enter your 2FA Code:</p>
			<form action="/service-provider-1/welcome" method="post">
				<input type="text" name="code" placeholder="Code">
				<input style="display:none;" type="text" name="username" value="${req.body.username}">
				<input type="submit" value="submit">
			</form>`;

		res.send(html);
	}).catch(error => {
		console.log(error);

		if (error.status != 200) {
			res.send('Wrong username/password');
		} else {
			res.send('2FA service may be down!');
		}
	});
});

app.post('/service-provider-1/welcome', (req, res) => {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

	axios.get('https://13.80.108.55/validate/check', {
		params: {
			user: req.body.username,
			pass: req.body.code
		}
	}).then(response => {
		console.log(response);
		if (response.data.result.value) {
			res.send('Login successful!');
		} else {
			res.send('Wrong 2FA code!');
		}
	}).catch(error => {
		console.log(error);
		res.send('2FA service may be down!');
	});
});

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
