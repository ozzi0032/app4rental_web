
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Property = require('../models/property');

router.get('/properties', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.admin < 1)
        return res.status(403).send("You are not an admin!");
    Property.findAllProperties({}, (err, properties) => {
        if (err)
            return res.status(500).send("Server error!");
        return res.status(200).json({ obj: properties });
    });
});

router.get('/users', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.admin < 1)
        return res.status(403).send("You are not an admin!");
    User.findAllUsers((err, users) => {
        if (err)
            return res.status(500).send("Server error!");
        return res.status(200).json({ obj: users, status: req.user.admin });
    });
});

router.post('/delete', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.admin < 1)
        return res.status(403).send("You are not an admin!");
    var prop = new Property(req.body);
    prop.remove((err) => {
        if (err)
            return res.status(500).send("Server error!");
    });
    return res.status(204).send("Property removed!");
});

router.patch('/ban', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.admin < 1)
        return res.status(403).send("You are not admin!");
    User.updateOne(req.body, (err) => {
        if (err)
            return res.status(500).send("Server error!");
    });
    if (req.body.banned == true)
        Property.findUserPropertys(req.body._id, (err, prop) => {
            if (err)
                return res.status(500).send("Server error!");
            for (var i = 0; i < prop.length; i++)
                prop[i].remove((err) => {
                    if (err)
                        return res.status(500).send("Server error!");
                });
            return res.status(200).send("User is banned!");
        });
    else return res.status(200).send("User ban status is changed!");
});

router.patch('/admin', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.admin < 2)
        return res.status(403).send("You are not head admin!");
    User.updateOne(req.body, (err) => {
        if (err)
            return res.status(500).send("Server error!");
        return res.status(200).send("Admin status changed!");
    });
});
module.exports = router;