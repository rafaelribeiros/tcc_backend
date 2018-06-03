'use strict';

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	anonymus: {
		type: Boolean,
		default: false
	},
	placeDescription: {
		type: String,
		require: false
	},
	authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'users', },
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

const Post = mongoose.model('posts', postSchema);
module.exports = Post;