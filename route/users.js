'use strict';

const express = require('express');
const router = express.Router();

const User = require('model/User');
const bcrypt = require('bcrypt-nodejs');

// CRUD methods
// Create User //
router.post('/create', (req, res, next) => {
  console.log(req.body);
  // let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let birth = req.body.birth;

  let street = req.body.street;
  let neighborhood = req.body.neighborhood;
  let city = req.body.city;
  let state = req.body.state;
  let postal_code = req.body.postal_code

  // Hashing password
  password = bcrypt.hashSync(password);

  // Date convert
  birth = new Date(birth);

  let newUser = new User({
    // username: username,
    email: email,
    password: password,
    firstname: firstname,
    lastname: lastname,
    // birth: birth,
    city: city,
    state: state,
  });
  newUser.save((err) => {
    if (err) {
      return res.json({
        action: "Error: " + err.message,
        status: 'error',
        code: 444
      });
    } else {
      return res.json({
        action: 'New User created',
        user: newUser,
        status: 'ok',
        code: 200
      });
    }
  });
});


// Update User //
router.put('/update', (req, res, next) => {
  // console.log(req.body);

  let updatedUser = req.body;

  console.log(updatedUser);

  User.findById(updatedUser._id, (err, data) => {
    if (err) {
      return res.json({
        action: "Error: " + err.message,
        status: 'error',
        code: 444
      });
    }

    let user = data;

    console.log(user);

    let username = updatedUser.username;
    let email = updatedUser.email;
    let password = updatedUser.password;

    let firstname = updatedUser.firstname;
    let lastname = updatedUser.lastname;
    let sex = updatedUser.sex;
    let birth = updatedUser.birth;

    let street = updatedUser.street;
    let neighborhood = updatedUser.neighborhood;
    let city = updatedUser.city;
    let postal_code = updatedUser.postal_code;

    let type = updatedUser.type;
    let status = updatedUser.status;

    // Birth
    birth = new Date(birth);

    user.username = username;
    user.email = email;
    user.password = password;

    user.firstname = firstname;
    user.lastname = lastname;
    user.sex = sex;
    user.birth = birth;

    user.street = street;
    user.neighborhood = neighborhood;
    user.city = city;
    user.postal_code = postal_code;

    user.type = type;
    user.status = status;

    user.save((err) => {
      if (err) {
        return res.json({
          action: "Error: " + err.message,
          status: 'error',
          code: 444
        });
      } else {
        return res.json({
          action: 'User updated',
          user: user,
          status: 'ok',
          code: 200
        });
      }
    });
  });
});

// Delete User // 
router.delete('/delete', (req, res, next) => {
  let user_id = req.body.id;
  User.findById(user_id, (err, data) => {
    if (err) {
      return res.json({
        action: "Error: " + err.message,
        status: 'error',
        code: 444
      });
    }
    let user = data;

    user.remove((err) => {
      if (err) {
        return res.json({
          action: "Error: " + err.message,
          status: 'error',
          code: 444
        });
      } else {
        return res.json({
          action: 'User deleted',
          status: 'ok',
          code: 200
        });
      }
    });
  });
});

// Search methods

// Get all users
router.get('/all', (req, res, next) => {
  User.find({}, (err, docs) => {
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
router.get('/id/:user_id', (req, res, next) => {
  let user_id = req.params.user_id;

  User.findById(user_id, (err, docs) => {
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
  let joe = new User({
    username: "Joe" + Math.round(Math.random() * 10000),
    email: "Joe" + Math.round(Math.random() * 10000) + "@gmail.com",
    password: Math.round(Math.random() * 10000),

    firstname: "Joe",
    lastname: "Dumpson",
    sex: "male",
    birth: Math.round(Math.random() * 10) % 28 + "/" + Math.round(Math.random() * 10) % 12 + "/" + Math.round(Math.random() * 1000) % 2018,

    street: "Joe's Street",
    neighborhood: "Joe's neighborhood",
    city: "Joe's City",
    postal_code: "29101105" // Praia da Costa
  });
  joe.save();

  return res.json({
    action: 'Joe Dumpson created',
    status: 'ok',
    code: 200
  });
});

// Delete All
router.delete('/all_delete', (req, res, next) => {
  User.find({}, (err, data) => {
    let users = data;

    for (const i in users) {
      if (users.hasOwnProperty(i)) {
        const element = users[i];
        element.remove();
      }
    }

    return res.json({
      action: 'All Users deleted',
      status: 'ok',
      code: 200
    });
  });
});

module.exports = router;