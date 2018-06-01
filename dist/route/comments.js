'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

var Comment = require('model/Comment');
var Vote = require('model/Vote');

var bcrypt = require('bcrypt-nodejs');

// Test
var User = require('model/User');
var Post = require('model/Post');

// CRUD methods
// Create Comment //
router.post('/create', function (req, res, next) {
	console.log(req.body);
	var post = req.body.post;
	var comment = req.body.comment;
	var user = req.body.user;
	var description = req.body.description;

	var newComment = new Comment({
		post: post,
		comment: comment,
		user: user,
		description: description
	});
	newComment.save(function (err) {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		} else {
			return res.json({
				action: 'New comment created',
				comment: newComment,
				status: 'ok',
				code: 200
			});
		}
	});
});

// Update Comment //
router.put('/update', function (req, res, next) {
	var updatedComment = req.body;

	// console.log(updatedComment);

	// return res.json({
	// 	updatedComment
	// });

	Comment.findById(updatedComment._id, function (err, comment) {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}

		// console.log(comment);

		var post = updatedComment.post;
		var comment_id = updatedComment.comment;
		var user = updatedComment.user;
		var description = updatedComment.description;
		var status = updatedComment.status;

		comment.post = post;
		comment.comment = comment_id;
		comment.user = user;
		comment.description = description;
		comment.status = status;

		comment.save(function (err) {
			if (err) {
				return res.json({
					action: "Error: " + err.message,
					status: 'error',
					code: 444
				});
			} else {
				return res.json({
					action: 'Comment updated',
					comment: comment,
					status: 'ok',
					code: 200
				});
			}
		});
	});
});

// Delete User // 
router.delete('/delete', function (req, res, next) {
	var comment_id = req.body.id;
	Comment.findById(comment_id, function (err, comment) {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}

		comment.remove(function (err) {
			if (err) {
				return res.json({
					action: "Error: " + err.message,
					status: 'error',
					code: 444
				});
			} else {
				return res.json({
					action: 'Comment deleted',
					status: 'ok',
					code: 200
				});
			}
		});
	});
});

// Vote
router.post('/vote', function (req, res, next) {
	var comment = req.body.comment;
	var value = req.body.value;
	var user = req.body.user;

	Vote.findOne({
		comment: comment,
		user: user
	}, function (err, vote) {
		if (!vote) {
			// Vote doesn't exist

			if (value == 0) {
				return res.json({
					action: "Error: Vote doesn't exist, value can't be zero",
					status: 'error',
					code: 444
				});
			}

			// Create vote
			vote = new Vote({
				user: user,
				comment: comment,
				value: value
			});
			vote.save(function (err) {
				if (err) {
					return res.json({
						action: "Error: " + err.message,
						status: 'error',
						code: 444
					});
				} else {
					// Karma Change
					Comment.findById(comment, function (err, data) {
						if (err) {
							return res.json({
								action: "Error: " + err.message,
								status: 'error',
								code: 444
							});
						}
						console.log(data);

						data.karma += parseInt(value);
						data.save();
						return res.json({
							action: 'Vote created',
							vote: vote,
							status: 'ok',
							code: 200
						});
					});
				}
			});
		} else {
			// update vote
			var removedValue = vote.value;
			vote.remove();

			if (value != 0) {
				vote = new Vote({
					user: user,
					comment: comment,
					value: value
				});
				vote.save(function (err) {
					if (err) {
						return res.json({
							action: "Error: " + err.message,
							status: 'error',
							code: 444
						});
					} else {
						// Karma Change
						Comment.findById(comment, function (err, data) {
							data.karma += parseInt(value) - removedValue;
							data.save();
						});

						return res.json({
							action: 'Vote created',
							vote: vote,
							status: 'ok',
							code: 200
						});
					}
				});
			} else {

				Comment.findById(comment, function (err, data) {
					if (err) {
						return res.json({
							action: "Error: " + err.message,
							status: 'error',
							code: 444
						});
					}

					data.karma -= removedValue;
					data.save();

					return res.json({
						action: 'Vote deleted',
						status: 'ok',
						code: 200
					});
				});
			}
		}
	});
});

// Search methods

// Get all users
router.get('/all_from_post', function (req, res, next) {
	var post_id = req.query.id;

	console.log(post_id);

	Comment.find({
		post: post_id
	}, function (err, docs) {
		if (!err) {
			return res.json((0, _stringify2.default)(docs));
		} else {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}
	});
});

// Get by id
router.get('/id/:post_id', function (req, res, next) {
	var post_id = req.params.post_id;

	User.findById(post_id, function (err, docs) {
		if (!err) {
			return res.json((0, _stringify2.default)(docs));
		} else {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}
	});
});

// Test vars

// Create dump for test
router.get('/create_dump', function (req, res, next) {

	var comment_user = null;
	var comment_post = null;
	User.findOne({}, function (err, user) {
		comment_user = user;

		Post.findOne({}, function (err, post) {
			comment_post = post;
			console.log(comment_post._id);

			var joeComment = new Comment({
				post: comment_post._id,
				user: comment_user._id,
				description: "Um elefante incomoda muita gente porém 2 elefantes incomoda incomoda muito mais"
			});
			joeComment.save();
			console.log(joeComment);

			return res.json({
				action: 'Joe comment created',
				comment: joeComment,
				status: 'ok',
				code: 200
			});
		});
	});
});

// Delete All
router.delete('/all_delete', function (req, res, next) {
	Comment.find({}, function (err, data) {
		var coments = data;

		for (var i in coments) {
			if (coments.hasOwnProperty(i)) {
				var element = coments[i];
				element.remove();
			}
		}

		return res.json({
			action: 'All comments deleted',
			status: 'ok',
			code: 200
		});
	});
});

module.exports = router;
//# sourceMappingURL=comments.js.map