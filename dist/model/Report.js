'use strict';

var mongoose = require('mongoose');

var reportSchema = new mongoose.Schema({
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

var Report = mongoose.model('reports', reportSchema);
module.exports = Report;
//# sourceMappingURL=Report.js.map