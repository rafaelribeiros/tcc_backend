'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'posts',
		require: false
	},
	comment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'comments',
		require: false
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		require: true
	},
	description: {
		type: String,
		require: true
	},
	karma: {
		type: Number,
		require: true,
		default: 0
	},
	status: {
		type: String,
		require: true,
		default: "ok"
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Comment = mongoose.model('comments', commentSchema);
module.exports = Comment;