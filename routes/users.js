const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../config/database');

const User = require('../models/user');
const Rating = require('../models/rating');
const Property = require('../models/property');

const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

//online cloud services
const cloudinary = require('../config/cludinary');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/avatars')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            var ext = file.originalname.split('.').pop();
            cb(null, raw.toString('hex') + Date.now() + '.' + ext);
        });
    }
})

var upload = multer({ storage: storage });
router.post('/register', (req, res, next) => {
    let newUser = new User(req.body);
    User.addUser(newUser, (err) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000)//mongodb greska
                return res.status(409).send('User already exist!');
            else
                return res.status(500).send("Failed to register!");
        }
        return res.status(201).send("User created!");
    });
});

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByUserEmail(email, (err, user) => {
        if (err)
            return res.status(500).send("Server error!");
        if (!user)
            return res.status(422).send("User not found");
        if (user.banned == true)
            return res.status(400).send("You are banned!");
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err)
                return res.status(500).send("Server error!");
            if (isMatch) {
                const token = jwt.sign({ data: user }, config.secret, { expiresIn: 604800 });
                return res.status(200).json({ token: 'Bearer ' + token, user: { name: user.firstName, last: user.lastName, userName: user.userName, email: user.email } });
            } else
                return res.status(400).send("Wrong password");
        });
    });
});

router.get('/profile/:username', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    User.getUserByUserName(req.params.username, (err, user) => {
        if (err)
            return res.status(500).send("Server error!");
        if (!user)
            return res.status(422).send("User not found");
        if (user) {
            var cal = 0;
            Rating.findMine(user._id, (err, rating) => {
                if (err)
                    return res.status(500).send("Server error!");
                var sum = 0; var num = 0;
                for (var i = 0; i < rating.length; i++)
                    if (rating[i].rate != 0) { sum = sum + rating[i].rate; num = num + 1; }
                cal = sum / num;
                return res.status(200).json({
                    star: cal, user: {
                        firstName: user.firstName, lastName: user.lastName, userName: user.userName, email: user.email, phone: user.phone,
                        street: user.street, street2: user.street2, avatar: user.avatar
                    }, me: req.user.userName
                });
            });
        }
    });
}
);

router.get('/settings', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    user = req.user;
    return res.status(200).json({
        user: {
            id: user._id, name: user.firstName, last: user.lastName, userName: user.userName, email: user.email, phone: user.phone,
            street: user.street, street2: user.street2, avatar: user.avatar, admin: user.admin
        }
    });
});

router.post('/password', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    User.comparePassword(req.body.old.toString(), req.user.password.toString(), (err, isMatch) => {
        if (err)
            return res.status(500).json("Server error!");
        if (isMatch) {
            req.user.password = req.body.new;
            User.updatePass(req.user, (err, newData) => {
                if (err)
                    return res.status(500).send("Server error!");
            });
            return res.status(200).send("Password changed!");
        } else
            return res.status(400).send("Wrong password");
    });
});

router.post('/settings', upload.single('avatar'), passport.authenticate('jwt', { session: false }), (req, res, next) => {
    let newData = JSON.parse(req.body.thisUser);
    newData._id = req.user._id;
    User.comparePassword(newData.password.toString(), req.user.password.toString(), (err, isMatch) => {
        if (err)
            return res.status(500).send("Server error!");
        if (isMatch) {
            if (req.file != undefined) {
                newData.avatar = req.file.filename;
                cloudinary.v2.uploader.upload("./uploads/avatars/" + req.file.filename, { use_filename: true, unique_filename: false });
                if (req.user.avatar != 'no') {

                    if (fs.existsSync(path.join(__dirname, '../uploads/avatars/', req.user.avatar)))
                        fs.unlink('./uploads/avatars/' + req.user.avatar, (err) => {
                            if (err)
                                return res.status(500).send("Server error!");
                        });
                }
            }
            delete newData.password;
            User.updateOne(newData, (err, user) => {
                if (err)
                    if (err.name === 'MongoError' && err.code === 11000)//mongodb error
                        return res.status(409).send('User already exist!');
                    else return res.status(500).send("Server error!");
                return res.status(200).json({ user: newData.userName });
            });
        } else
            return res.status(400).send("Wrong password");
    });

});

router.get('/property', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Property.findUserPropertys(req.user._id.toString(), (err, properties) => {
        if (err)
            return res.status(500).send("Server error!");
        return res.status(200).json({ obj: properties });
    });
});

module.exports = router;