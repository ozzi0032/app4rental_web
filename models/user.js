
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const config = require('../config/database');

const UserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    street: { type: String, required: true },
    street2: { type: String },
    avatar: { type: String, default: 'no' },
    admin: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUserEmail = function (email, callback) {
    const query = { email: email };
    User.findOne(query, callback);
}

module.exports.getUserByUserName = function (userName, callback) {
    const query = { userName: userName };
    User.findOne(query, callback);
}

module.exports.updatePass = function (newUserData, callback) {
    User.findOne({ _id: newUserData._id }, function (err, user) {
        user.password = newUserData.password;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                user.save(callback);
            });
        });
    });
}

module.exports.updateOne = function (newUserData, callback) {
    User.findOneAndUpdate({ _id: newUserData._id }, newUserData, callback);
}

module.exports.findAllUsers = function (callback) {
    User.find().populate().exec(callback);
}

module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function (candidatePass, hash, callback) {
    bcrypt.compare(candidatePass, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}