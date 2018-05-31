'use strict';

const express = require('express');
const router = express.Router();

const Post = require('model/Post');
const Vote = require('model/Vote');

const bcrypt = require('bcrypt-nodejs');

// Test
const User = require('model/User');

// CRUD methods
// Create Post //
router.post('/create', (req, res, next) => {
	console.log(req.body);
	let user = req.body.user;
	let title = req.body.title;
	let description = req.body.description;
	let type = req.body.type;
	let lat = req.body.lat;
	let lng = req.body.lng;

	let post = new Post({
		user: user._id,
		title: title,
		description: description,
		type: type,
		loc: {
			type: 'Point',
			coordinates: [lat, lng]
		}
	});
	post.save((err) => {
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
router.put('/update', (req, res, next) => {
	// console.log(req.body);

	let updatedPost = req.body;

	console.log(updatedPost);

	Post.findById(updatedPost._id, (err, data) => {

		let post = data;

		console.log(data);

		let user = updatedPost.user;
		let title = updatedPost.title;
		let description = updatedPost.description;
		let type = updatedPost.type;
		let loc = updatedPost.loc;


		post.user = user;
		post.title = title;
		post.description = description;
		post.type = type;
		post.loc = loc;
		post.status = status;

		post.save((err) => {
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
router.delete('/delete', (req, res, next) => {
	let post_id = req.body.id;
	Post.findById(post_id, (err, data) => {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}
		let Post = data;

		Post.remove((err) => {
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
router.post('/vote', (req, res, next) => {
	let post = req.body.post;
	let value = req.body.value;
	let user = req.body.user;

	Vote.findOne({
		post: post,
		user: user
	}, (err, vote) => {
		if (!vote) { // Vote doesn't exist

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
			vote.save((err) => {
				if (err) {
					return res.json({
						action: "Error: " + err.message,
						status: 'error',
						code: 444
					});
				} else {
					// Karma Change
					Post.findById(post, (err, data) => {
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

		} else { // update vote
			let removedValue = vote.value;
			vote.remove();

			if (value != 0) {
				vote = new Vote({
					user: user,
					post: post,
					value: value
				});
				vote.save((err) => {
					if (err) {
						return res.json({
							action: "Error: " + err.message,
							status: 'error',
							code: 444
						});
					} else {
						// Karma Change
						Post.findById(post, (err, data) => {
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

				Post.findById(post, (err, data) => {
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
	})
});

// Search methods

// Get all post
router.get('/all', (req, res, next) => {
	Post.find({}, (err, docs) => {
		if (!err) {
			return res.json(JSON.stringify(docs));
		} else {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}
	});
});

router.get('/all_close', (req, res, next) => {
	let lat = req.query.lat;
	let lng = req.query.lng;

	let coords = {
		type: 'Point',
		coordinates: [lat, lng]
	};

	Post.find({
			loc: {
				$near: coords
			}
		},
		(err, docs) => {
			if (!err) {
				return res.json(JSON.stringify(docs));
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
router.get('/id/:post_id', (req, res, next) => {
	let post_id = req.params.post_id;

	Post.findById(post_id, (err, docs) => {
		if (!err) {
			return res.json(JSON.stringify(docs));
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
router.get('/create_dump', (req, res, next) => {
	User.findOne({}, (err, data) => {
		let user = data;

		let joe = new Post({
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
router.delete('/all_delete', (req, res, next) => {
	Post.find({}, (err, data) => {
		let posts = data;

		for (const i in posts) {
			if (posts.hasOwnProperty(i)) {
				const element = posts[i];
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