'use strict';

const express = require('express');
const router = express.Router();

const Comment = require('model/Comment');
const Vote = require('model/Vote');

const bcrypt = require('bcrypt-nodejs');

// Test
const User = require('model/User');
const Post = require('model/Post');

const mongoose = require("mongoose");

// CRUD methods
// Create Comment //
router.post('/create', (req, res, next) => {
	console.log(req.body);
	let post = req.body.post;
	// let comment = req.body.comment;
	let user = req.body.user;
	let description = req.body.description;

	let newComment = new Comment({
		post: post,
		// comment: comment,
		user: user,
		description: description
	});
	newComment.save((err) => {
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

router.get("/all/:postId", (req, res, next) => {
  const { ObjectId } = mongoose.Types;
  let postId = req.params.postId;
  return Comment.aggregate([
    {
      $match: {
				deleted: false,
				post: ObjectId(postId)
      }
    },
    {
      $sort: { createdAt: -1, _id: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        "user._id": 1,
        "user.firstname": 1,
        "user.userImage": 1,
        "user.city": 1,
        "user.state": 1,
        "user.email": 1,
				description: 1,
				createdAt: 1,
				deleted:1,
        // votedNegative: {
        //   $cond: {
        //     if: { $setIsSubset: [[ObjectId(userId)], '$negativeVotes'] },
        //     then: true,
        //     else: false,
        //   },
        // },
        // votedPositive: {
        //   $cond: {
        //     if: { $setIsSubset: [[ObjectId(userId)], '$positiveVotes'] },
        //     then: true,
        //     else: false,
        //   },
        // },
      }
    }
  ]).then(resp => {
    if (resp !== null) {
      return res.status(201).json(resp);
    }
    throw res.status(444).json("Erro");
  });
});


// Update Comment //
router.put('/update', (req, res, next) => {
	let updatedComment = req.body;

	// console.log(updatedComment);

	// return res.json({
	// 	updatedComment
	// });

	Comment.findById(updatedComment._id, (err, comment) => {
		if (err) {
			return res.json({
				action: "Error: " + err.message,
				status: 'error',
				code: 444
			});
		}

		// console.log(comment);

		let post = updatedComment.post;
		let comment_id = updatedComment.comment;
		let user = updatedComment.user;
		let description = updatedComment.description;
		let status = updatedComment.status;

		comment.post = post;
		comment.comment = comment_id;
		comment.user = user;
		comment.description = description;
		comment.status = status;

		comment.save((err) => {
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
// Delete User //
router.post("/delete", (req, res, next) => {
  let commentId = req.body.id;
  Comment.findById(commentId, (err, data) => {
    if (err) {
      return res.json({
        action: "Error: " + err.message,
        status: "error",
        code: 444
      });
    }
    let Comment = data;
    Comment.deleted = true;
    Comment.save(err => {
      if (err) {
        return res.json({
          action: "Error: " + err.message,
          status: "error",
          code: 444
        });
      } else {
        return res.json({
          action: "Comment deleted",
          status: "ok",
          code: 200
        });
      }
    });
  });
});

// Vote
router.post('/vote', (req, res, next) => {
	let comment = req.body.comment;
	let value = req.body.value;
	let user = req.body.user;

	Vote.findOne({
		comment: comment,
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
				comment: comment,
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
					Comment.findById(comment, (err, data) => {
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

		} else { // update vote
			let removedValue = vote.value;
			vote.remove();

			if (value != 0) {
				vote = new Vote({
					user: user,
					comment: comment,
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
						Comment.findById(comment, (err, data) => {
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

				Comment.findById(comment, (err, data) => {
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

// Get all users
router.get('/all_from_post', (req, res, next) => {
	let post_id = req.query.id;

	console.log(post_id);

	Comment.find({
		post: post_id
	}, (err, docs) => {
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

	User.findById(post_id, (err, docs) => {
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

	var comment_user = null;
	var comment_post = null;
	User.findOne({}, (err, user) => {
		comment_user = user;

		Post.findOne({}, (err, post) => {
			comment_post = post;
			console.log(comment_post._id);

			let joeComment = new Comment({
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
router.delete('/all_delete', (req, res, next) => {
	Comment.find({}, (err, data) => {
		let coments = data;

		for (const i in coments) {
			if (coments.hasOwnProperty(i)) {
				const element = coments[i];
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