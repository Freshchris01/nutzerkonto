'use strict';

const Keycloak = require('keycloak-connect');
const express = require('express');
const session = require('express-session');
const expressHbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');

const config = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Handlebars view engine

app.engine('hbs', expressHbs({
	extname: 'hbs',
	defaultLayout: 'layout.hbs',
	relativeTo: __dirname
}));
app.set('view engine', 'hbs');

// KeyCloak

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(session({
	secret: 'nutzerkonto-tech4germany',
	resave: false,
	saveUninitialized: true,
	store: memoryStore
}));

app.use(keycloak.middleware());

// routes

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/service-provider-1', keycloak.protect(), (req, res) => {
	res.render('serviceProvider');
});

app.get('/service-provider-2', keycloak.protect(), (req, res) => {
	res.render('serviceProvider');
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

app.use(keycloak.middleware({ logout: '/' }));

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
	console.log('Express server listening on port ' + server.address().port);
});
