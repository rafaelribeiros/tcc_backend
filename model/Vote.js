'use strict';

const mongoose = require('mongoose');

const votetSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		require: true
	},
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'posts',
	},
	comment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'comments',
	},
	value: {
		type: Number,
		min: -1,
		max: 1,
		require: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Vote = mongoose.model('votes', votetSchema);
module.exports = Vote;