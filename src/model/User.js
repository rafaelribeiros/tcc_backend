'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // username: { type: String, unique: true, require: true },
    email: { type: String, unique: true, require: true },
    password: { type: String, require: true },
    type: { type: String, require: false, default: "citizen" },
    status: { type: String, require: false, default: "UNVERIFIED" },

    // personal
    firstname: { type: String, require: true },
    lastname: { type: String, require: false },
    sex: { type: String, require: false },
    birth: { type: Date, require: false },

    // address
    street: { type: String, require: false },
    neighborhood: { type: String, require: false },
    city: { type: String, require: true },
    state: { type: String, require: true },
    postal_code: { type: String, require: false },
    
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);
module.exports = User;