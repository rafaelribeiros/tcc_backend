'use strict';

var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		require: true
	},
	title: {
		type: String,
		require: true
	},
	description: {
		type: String,
		require: true
	},
	imgUrl: {
		type: String
	},
	videoUrl: {
		type: String
	},
	type: {
		type: String,
		require: true
	},
	loc: {
		type: {
			type: String,
			default: "Point"
		},
		coordinates: []
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

// define the index
postSchema.index({
	loc: '2dsphere'
});

var Post = mongoose.model('posts', postSchema);
module.exports = Post;
//# sourceMappingURL=Post.js.map