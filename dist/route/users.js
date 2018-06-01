'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

var User = require('model/User');
var bcrypt = require('bcrypt-nodejs');

// CRUD methods
// Create User //
router.post('/create', function (req, res, next) {
  console.log(req.body);
  // let username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var birth = req.body.birth;

  var street = req.body.street;
  var neighborhood = req.body.neighborhood;
  var city = req.body.city;
  var state = req.body.state;
  var postal_code = req.body.postal_code;

  // Hashing password
  password = bcrypt.hashSync(password);

  // Date convert
  birth = new Date(birth);

  var newUser = new User({
    // username: username,
    email: email,
    password: password,
    firstname: firstname,
    lastname: lastname,
    // birth: birth,
    city: city,
    state: state
  });
  newUser.save(function (err) {
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
router.put('/update', function (req, res, next) {
  // console.log(req.body);

  var updatedUser = req.body;

  console.log(updatedUser);

  User.findById(updatedUser._id, function (err, data) {
    if (err) {
      return res.json({
        action: "Error: " + err.message,
        status: 'error',
        code: 444
      });
    }

    var user = data;

    console.log(user);

    var username = updatedUser.username;
    var email = updatedUser.email;
    var password = updatedUser.password;

    var firstname = updatedUser.firstname;
    var lastname = updatedUser.lastname;
    var sex = updatedUser.sex;
    var birth = updatedUser.birth;

    var street = updatedUser.street;
    var neighborhood = updatedUser.neighborhood;
    var city = updatedUser.city;
    var postal_code = updatedUser.postal_code;

    var type = updatedUser.type;
    var status = updatedUser.status;

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

    user.save(function (err) {
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
router.delete('/delete', function (req, res, next) {
  var user_id = req.body.id;
  User.findById(user_id, function (err, data) {
    if (err) {
      return res.json({
        action: "Error: " + err.message,
        status: 'error',
        code: 444
      });
    }
    var user = data;

    user.remove(function (err) {
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
router.get('/all', function (req, res, next) {
  User.find({}, function (err, docs) {
    if (!err) {
      return res.json((0, _stringify2.default)(docs));
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
router.get('/id/:user_id', function (req, res, next) {
  var user_id = req.params.user_id;

  User.findById(user_id, function (err, docs) {
    if (!err) {
      return res.json((0, _stringify2.default)(docs));
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
router.get('/create_dump', function (req, res, next) {
  var joe = new User({
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
router.delete('/all_delete', function (req, res, next) {
  User.find({}, function (err, data) {
    var users = data;

    for (var i in users) {
      if (users.hasOwnProperty(i)) {
        var element = users[i];
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
//# sourceMappingURL=users.js.map