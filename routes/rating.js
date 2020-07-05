const express = require('express');
const router = express.Router();

const passport = require('passport');
const Rating = require('../models/rating');

router.get('/stared/:user', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Rating.getStar(req.user._id.toString(), req.params.user.toString(), (err, star) => {
        if (err)
            return res.status(500).send("Server error!");
        if (star) return res.status(200).json({ star: star.rate, id: req.user._id });
        else return res.status(200).json({ star: 0, id: req.user._id });
    });
});

router.post('/change', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Rating.setStar(req.user._id.toString(), req.body.id.toString(), req.body.num, (err) => {
        if (err)
            return res.status(500).send("Server error!");
        else return res.status(201).send("saved");
    });
});
module.exports = router;