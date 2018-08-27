'use strict';
var express = require('express');
var router = express.Router();

let users = require('./userDB');

// Login User
router.post('/', function (req, res) {

	let dbResult = users.find((user) => {
		return (user.username === req.body.username && user.password === req.body.password);
	})

	res.send({
		success: dbResult ? true : false
	});
});

module.exports = router;