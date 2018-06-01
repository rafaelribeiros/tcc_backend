'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

var Post = require('model/Post');
var Vote = require('model/Vote');

var bcrypt = require('bcrypt-nodejs');

// Test
var User = require('model/User');

// CRUD methods
// Create Post //
router.post('/create', function (req, res, next) {
	console.log(req.body);
	var user = req.body.user;
	var title = req.body.title;
	var description = req.body.description;
	var type = req.body.type;
	var lat = req.body.lat;
	var lng = req.body.lng;

	var post = new Post({
		user: user._id,
		title: title,
		description: description,
		type: type,
		loc: {
			type: 'Point',
			coordinates: [lat, lng]
		}
	});
	post.save(function (err) {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		} else {
			return res.json({
				action: 'New post created',
				post: post,
				status: 'ok',
				code: 200
			});
		}
	});
});

// Update Post //
router.put('/update', function (req, res, next) {
	// console.log(req.body);

	var updatedPost = req.body;

	console.log(updatedPost);

	Post.findById(updatedPost._id, function (err, data) {

		var post = data;

		console.log(data);

		var user = updatedPost.user;
		var title = updatedPost.title;
		var description = updatedPost.description;
		var type = updatedPost.type;
		var loc = updatedPost.loc;

		post.user = user;
		post.title = title;
		post.description = description;
		post.type = type;
		post.loc = loc;
		post.status = status;

		post.save(function (err) {
			if (err) {
				return res.json({
					action: "Error: " + err.message,
					status: 'error',
					code: 444
				});
			} else {
				return res.json({
					action: 'Post updated',
					post: post,
					status: 'ok',
					code: 200
				});
			}
		});
	});
});

// Delete User // 
router.delete('/delete', function (req, res, next) {
	var post_id = req.body.id;
	Post.findById(post_id, function (err, data) {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}
		var Post = data;

		Post.remove(function (err) {
			if (err) {
				return res.json({
					action: "Error: " + err.message,
					status: 'error',
					code: 444
				});
			} else {
				return res.json({
					action: 'Post deleted',
					status: 'ok',
					code: 200
				});
			}
		});
	});
});

// Vote
router.post('/vote', function (req, res, next) {
	var post = req.body.post;
	var value = req.body.value;
	var user = req.body.user;

	Vote.findOne({
		post: post,
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
				post: post,
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
					Post.findById(post, function (err, data) {
						data.karma += parseInt(value);
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
			// update vote
			var removedValue = vote.value;
			vote.remove();

			if (value != 0) {
				vote = new Vote({
					user: user,
					post: post,
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
						Post.findById(post, function (err, data) {
							if (err) {
								return res.json({
									action: "Error: " + err.message,
									status: 'error',
									code: 444
								});
							}

							data.karma += parseInt(value) - removedValue;
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

				Post.findById(post, function (err, data) {
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

// Get all post
router.get('/all', function (req, res, next) {
	Post.find({}, function (err, docs) {
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

router.get('/all_close', function (req, res, next) {
	var lat = req.query.lat;
	var lng = req.query.lng;

	var coords = {
		type: 'Point',
		coordinates: [lat, lng]
	};

	Post.find({
		loc: {
			$near: coords
		}
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

	Post.findById(post_id, function (err, docs) {
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
	User.findOne({}, function (err, data) {
		var user = data;

		var joe = new Post({
			user: user._id,
			title: "Joe is in danger",
			description: "I was there Joe was assaulted by 32 minions and one big dragon. Terrible!",
			type: "Assalto",
			loc: {
				type: 'Point',
				coordinates: [1.0, 1.0]
			}
		});
		joe.save();

		//   Post.findOne({}).
		//   populate('user_id').
		//   exec(function (err, story) {
		// 	if (err) return handleError(err);
		// 	console.log("ae", story);
		//   });

		console.log(joe);

		return res.json({
			action: 'Joe post created',
			post: joe,
			status: 'ok',
			code: 200
		});
	});
});

// Delete All
router.delete('/all_delete', function (req, res, next) {
	Post.find({}, function (err, data) {
		var posts = data;

		for (var i in posts) {
			if (posts.hasOwnProperty(i)) {
				var element = posts[i];
				element.remove();
			}
		}

		return res.json({
			action: 'All posts deleted',
			status: 'ok',
			code: 200
		});
	});
});

module.exports = router;
//# sourceMappingURL=posts.js.map