'use strict';

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'posts'
	},
	comment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'comments'
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
	status: {
		type: String,
		require: true,
		default: 'waiting'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Report = mongoose.model('reports', reportSchema);
module.exports = Report;