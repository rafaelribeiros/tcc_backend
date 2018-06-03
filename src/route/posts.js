'use strict';

const express = require('express');
const router = express.Router();

const Post = require('model/Post');
const Vote = require('model/Vote');

const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

// Test
const User = require('model/User');

// CRUD methods
// Create Post //
router.post('/create', (req, res, next) => {
	console.log(req.body);
	let user = req.body.user
	let userId = req.body.userId;
	let title = req.body.title;
	let description = req.body.description;
	let type = req.body.type;
	let lat = req.body.lat;
	let lng = req.body.lng;
	let anonymus = req.body.anonymus;
	let placeDescription = req.body.placeDescription;
	let imgUrl = req.body.imgUrl;

	let post = new Post({
		user: userId,
		authorId: userId,
		title: title,
		description: description,
		type: type,
		loc: {
			type: 'Point',
			coordinates: [lat, lng]
		},
		anonymus: anonymus,
		placeDescription: placeDescription,
		imgUrl: imgUrl

	});
	post.save().then(payload => {
		payload.user = user
		res.status(200).json({ payload })
	})
		.catch(error => { throw res.status(404).json(error) });
});


// Update Post //
router.post('/update', (req, res, next) => {
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
router.post('/delete', (req, res, next) => {
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
		Post.status = "deleted";
		Post.save((err) => {
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
	return Post.aggregate([
		{
			$lookup: {
				from: 'users',
				localField: 'user',
				foreignField: '_id',
				as: 'user',
			},
		},
		{ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
		{
			$project: {
				'user._id': 1,
				'user.name': 1,
				'user.userImage': 1,
				'user.city': 1,
				'user.state': 1,
				'user.email': 1,
				title: 1,
				loc: 1,
				karma: 1,
				description: 1,
				imgUrl: 1,
				placeDescription: 1,
				createdAt: 1,
				voted: 1,
				status: 1,
				authorId: 1,
				type: 1,
				anonymous: 1,
			},
		}
	]).then(resp => {
		if (resp !== null) {
			return res.status(201).json(resp)
		}
		throw res.status(444).json('Erro')
	})
});

router.get('/all_close', (req, res, next) => {
	let lat = parseFloat(req.query.lat, 10);
	let lng = parseFloat(req.query.lng, 10);
	let $skip = parseInt(req.query.skip, 10);

	return Post.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lat, lng],
				},
				distanceField: "dist.calculated",
				maxDistance: 1000,
				maxDistance: 2000,
				spherical: true
			}
		},
		{ $skip },
		{ $limit: 10 },
		{
			$lookup: {
				from: 'users',
				localField: 'user',
				foreignField: '_id',
				as: 'user',
			},
		},
		{ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
		{
			$project: {
				'user._id': 1,
				'user.name': 1,
				'user.userImage': 1,
				'user.city': 1,
				'user.state': 1,
				'user.email': 1,
				title: 1,
				loc: 1,
				karma: 1,
				description: 1,
				imgUrl: 1,
				placeDescription: 1,
				createdAt: 1,
				voted: 1,
				status: 1,
				authorId: 1,
				type: 1,
				anonymous: 1,
			},
		}
	]).then(resp => {
		if (resp !== null) {
			return res.status(201).json({ payload: resp })
		}
		throw res.status(444).json('Erro')
	})
});

// Get by id
router.get('/id/:post_id', async (req, res, next) => {
	const { ObjectId } = mongoose.Types;
	let post_id = req.params.post_id;

	const [post] = await Post.aggregate([
		{
			$match: {
				_id: ObjectId(post_id)
			}
		},
		{
			$lookup: {
				from: 'users',
				localField: 'user',
				foreignField: '_id',
				as: 'user',
			},
		},
		{ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
		{
			$project: {
				'user._id': 1,
				'user.name': 1,
				'user.userImage': 1,
				'user.city': 1,
				'user.state': 1,
				'user.email': 1,
				title: 1,
				loc: 1,
				karma: 1,
				description: 1,
				imgUrl: 1,
				placeDescription: 1,
				createdAt: 1,
				voted: 1,
				status: 1,
				authorId: 1,
				type: 1,
				anonymous: 1,
			},
		}
	])
	if (post !== undefined) {
		return res.status(201).json(post)
	}
	throw res.status(444).json({ message: 'Postagem não encontrada' })
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
router.post('/all_delete', (req, res, next) => {
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