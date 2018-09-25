'use strict';

const Keycloak = require('keycloak-connect');
const express = require('express');
const session = require('express-session');
const expressHbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require('axios');

require('dotenv').config();

const config = require('./config');

const app = express();

app.use('/css', express.static(__dirname + '/css'));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const serviceProviders = [{
	name: 'Bafög leistungsabhängiger Teilerlass',
	path: process.env.HOST_NUTZERKONTO_SP,
	dataKeys: ['anrede', 'titel', 'namensbestandteil', 'nachname', 'vorname', 'geburtsdatum', 'geburtsname', 'studiumAbschlussdatum', 'bemerkung'],
	keyCloakClientID: 'serviceProvider3',
}, {
	name: 'Baumfällen'
}, {
	name: 'Waffenschein'
}];

// Handlebars view engine

app.engine('hbs', expressHbs({
	extname: 'hbs',
	defaultLayout: 'layout.hbs',
	relativeTo: __dirname
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
	res.render('index', {
		serviceProviders: serviceProviders
	});
});

const memoryStore = new session.MemoryStore();

app.use(session({
	secret: 'nutzerkonto-tech4germany',
	resave: false,
	saveUninitialized: true,
	store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore }, {
	"realm": "nutzerkonto3",
	"auth-server-url": config.KEYCLOAK,
	"ssl-required": "external",
	"resource": serviceProviders[0].keyCloakClientID,
	"public-client": true,
	"confidential-port": 0
});

app.use(keycloak.middleware());

app.get('/nutzerkonto-login', keycloak.protect(), (req, res) => {
	const redirect = req.query.redirect;
	const wantedKeys = Object.keys(req.query).filter(key => req.query[key] == 'on');
	res.redirect(`${redirect}/?wantedKeys=${JSON.stringify(wantedKeys)}`);
});

app.get('/nutzerkonto-datenuebertragen', keycloak.protect(), (req, res) => {
	const dataKeys = JSON.parse(req.query.dataKeys);
	// TODO: talk to database, which is not accessible from "outside"

	res.json({
		anrede: dataKeys.includes('anrede') ? 'Herr' : '',
		titel: dataKeys.includes('titel') ? 'Doktor' : '',
		namensbestandteil: dataKeys.includes('namensbestandteil') ? 'van' : '',
		nachname: dataKeys.includes('nachname') ? 'Berg' : '',
		vorname: dataKeys.includes('vorname') ? 'Christiansen' : '',
		geburtsdatum: dataKeys.includes('geburtsdatum') ? '1980-07-25' : '',
		geburtsname: dataKeys.includes('geburtsname') ? 'Tal' : '',
		studiumAbschlussdatum: dataKeys.includes('studiumAbschlussdatum') ? '2009-04-01' : '',
		bemerkung: dataKeys.includes('bemerkung') ? 'Lorem ipsum' : ''
	});
});

app.use(keycloak.middleware({ logout: process.env.HOST_NUTZERKONTO }));

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