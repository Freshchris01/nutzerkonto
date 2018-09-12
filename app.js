'use strict';

const Keycloak = require('keycloak-connect');
const express = require('express');
const session = require('express-session');
const expressHbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

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


app.get('/', (req, res) => {
	res.render('index');
});

// service providers

const serviceProviders = [{
	name: 'Service Provider 3',
	path: 'service-provider-3',
	dataAttributes: ['name'],
	keyCloakClientID: 'serviceProvider3'
}, {
	name: 'Service Provider 2',
	path: 'service-provider-2',
	dataAttributes: ['name', 'birthdate'],
	keyCloakClientID: 'serviceProvider2'
}];

const memoryStore = new session.MemoryStore();

app.use(session({
	secret: 'nutzerkonto-tech4germany',
	resave: false,
	saveUninitialized: true,
	store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore }, {
	"realm": "nutzerkonto2",
	"auth-server-url": "https://13.80.41.117:8443/auth",
	"ssl-required": "external",
	"resource": serviceProviders[0].keyCloakClientID,
	"public-client": true,
	"confidential-port": 0
});

app.use(keycloak.middleware());

app.get('/nutzerkonto-login', keycloak.protect(), (req, res) => {
	const redirect = req.query.redirect;
	res.redirect(`/${redirect}?flag=true`);
});

app.get('/nutzerkonto-datenuebertragen', keycloak.protect(), (req, res) => {
	const dataAttributes = req.query.dataAttributes.split(',');
	// TODO: talk to database, which is not accessible from "outside"

	res.json({
		name: 'chris'
	});
});

app.use(keycloak.middleware({ logout: '/' }));

app.get(`/${serviceProviders[0].path}`, (req, res) => {
	const flag = req.query.flag;

	if (flag) {
		axios.get('http://localhost:3000/nutzerkonto-datenuebertragen', {
			params: {
				dataAttributes: serviceProviders[0].dataAttributes.join(',')
			}
		}).then(response => {
			console.log(response.data);
			res.render('serviceProvider', {
				redirect: '',
				name: response.data.name
			});
		}).catch(error => {
			console.log(error);
		})
	} else {
		res.render('serviceProvider', {
			redirect: serviceProviders[0].path,
			name: ''
		});
	}
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