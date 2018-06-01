'use strict';

const express = require('express');
const router = express.Router();

const Report = require('model/Report');

router.post('/create', (req, res, next) => {
	let user = req.body.user;
	let post = req.body.post;
	let comment = req.body.comment;
	let description = req.body.description;

	let report = new Report({
		user: user,
		post: post,
		comment: comment,
		description: description
	});

	report.save((err) => {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		} else {
			return res.json({
				action: 'New report created',
				report: report,
				status: 'ok',
				code: 200
			});
		}
	});
});

module.exports = router;