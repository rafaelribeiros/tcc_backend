'use strict';

const express = require('express');
const router = express.Router();

const User = require('model/User');
const bcrypt = require('bcrypt-nodejs');

router.post('/login', (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password

  User.findOne({
    'email': email,
    'password': password
  }, function (err, user) {
    if (err) return handleError(err);

    if (user) {
      user.password = ''
      return res.json({
        action: 'User Logged',
        user: user,
        status: 'ok',
        code: 200
      });
    } else {
      return res.json({
        action: 'Email/Senha incorretos',
        status: 'error',
        code: 401
      });
    }
  });
});

router.post('/approve', (req, res, next) => {
  let userId = req.body.userId;
  let verifyImage = req.body.verifyImage;

  User.findById(user_id, (err, user) => {
    if (err) return handleError(err);

    if (user) {
      user.status = "PENDING";
      user.verifyImage = verifyImage
      user.save((err) => {
        if (err) {
          return res.json({
            action: "Error: " + err.message,
            status: 'error',
            code: 444
          });
        } else {
          return res.json({
            action: 'User approved',
            user: user,
            status: 'ok',
            code: 200
          });
        }
      });
    } else {
      return res.json({
        action: 'User not approved',
        status: 'error',
        code: 401
      });
    }

  });
});


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
  // password = bcrypt.hashSync(password);

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
router.post('/update', async (req, res, next) => {

  let updatedUser = req.body;

  User.findOneAndUpdate(
    {
      _id: updatedUser._id,
    },
    {
      $set: {
        userImage: updatedUser.userImage,
        name: updatedUser.name,
        city: updatedUser.city,
        state: updatedUser.state,
      },
    },
    {
      new: true,
      projection: {
        password: 0,
        __v: 0,
      },
    },
  ).then(payload => res.status(200).json({ payload }))
  .catch(error => {throw res.status(404).json(error)});
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
    if (docs !== null) {
      return res.status(200).json(docs);
    } else {
      return res.status(444).json({
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