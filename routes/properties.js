const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');
const Property = require('../models/property');

const multer = require('multer')
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const cloudinary = require('../config/cludinary');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/properties')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            var ext = file.originalname.split('.').pop();
            cb(null, raw.toString('hex') + Date.now() + '.' + ext);
        });
    }
});

var upload = multer({ storage: storage });

router.get('/all', (req, res, next) => {
    Property.findAllProperties(req.query, (err, prop) => {
        if (err)
            return res.status(500).send("Server error!");
        return res.status(200).json({ obj: prop });
    });
});

router.post('/add', upload.array('photo', 4), passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var itsMe = JSON.parse(req.body.thisProp);
    let prop = new Property(itsMe);
    prop.user = req.user._id;
    if (req.files[0] != undefined) {
        prop.image1 = req.files[0].filename;
        cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[0].filename, { use_filename: true, unique_filename: false });
    }
    if (req.files[1] != undefined) {
        prop.image2 = req.files[1].filename;
        cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[1].filename, { use_filename: true, unique_filename: false });
    }
    if (req.files[2] != undefined) {
        prop.image3 = req.files[2].filename;
        cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[2].filename, { use_filename: true, unique_filename: false });
    }
    if (req.files[3] != undefined) {
        prop.image4 = req.files[3].filename;
        cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[3].filename, { use_filename: true, unique_filename: false });
    }

    Property.addPropery(prop, (err) => {
        if (err)
            return res.status(500).send("Server error!");
        return res.status(201).send("Apartment saved!");
    });
});

router.get('/view/:id', (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), (err, prop) => {
        if (err)
            return res.status(500).send("Server error!");
        if (!prop)
            return res.status(422).send("Property not found");
        User.getUserById(prop.user, (err, user) => {
            if (err)
                return res.status(500).send("Server error!");
            if (user)
                return res.status(200).json({ user: user, prop: prop });
            else return res.status(422).send("Owner not found");
        });
    });
});

router.get('/edit/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), (err, prop) => {
        if (err)
            return res.status(500).send("Server error!");
        if (!prop)
            return res.status(422).send("Property not found");
        if (prop.user.toString() != req.user._id.toString())
            return res.status(403).send("You dont own the property");
        else return res.status(200).json({ prop: prop });
    });
});

router.patch('/edit/:id', upload.array('photo', 4), passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), (err, prop) => {
        if (err)
            return res.status(500).send("Server error!");
        else if (!prop)
            return res.status(422).send("Property not found");
        else {
            if (prop.user.toString() != req.user._id.toString())
                return res.status(403).send("You dont own the property");
            else {
                var itsMe = JSON.parse(req.body.thisProp);
                if (itsMe.image1 != prop.image1 && itsMe.image1 == "no") deleteFile(prop.image1);
                if (itsMe.image2 != prop.image2 && itsMe.image2 == "no") deleteFile(prop.image2);
                if (itsMe.image3 != prop.image3 && itsMe.image3 == "no") deleteFile(prop.image3);
                if (itsMe.image4 != prop.image4 && itsMe.image4 == "no") deleteFile(prop.image4);
                for (i = 0; i < 5; i++) {
                    if (req.files[i] != undefined)
                        if (itsMe.image1 == "no") {
                            itsMe.image1 = req.files[i].filename;
                            cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[i].filename, { use_filename: true, unique_filename: false });
                        }
                        else if (itsMe.image2 == "no") {
                            itsMe.image2 = req.files[i].filename;
                            cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[i].filename, { use_filename: true, unique_filename: false });
                        }
                        else if (itsMe.image3 == "no") {
                            itsMe.image3 = req.files[i].filename;
                            cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[i].filename, { use_filename: true, unique_filename: false });
                        }
                        else if (itsMe.image4 == "no") {
                            itsMe.image4 = req.files[i].filename;
                            cloudinary.v2.uploader.upload("./uploads/properties/" + req.files[i].filename, { use_filename: true, unique_filename: false });
                        }
                    Property.saveModPropery(req.params.id.toString(), itsMe, (err) => {
                        if (err)
                            return res.status(500).send("Server error!");
                    });
                    return res.status(200).send("Apartment saved!");
                }
            }
        }
    });
});

router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), (err, prop) => {
        if (err)
            return res.status(500).send("Server error!");
        if (!prop)
            return res.status(422).send("Property not found");
        if (prop.user.toString() != req.user._id.toString())
            return res.status(403).send("You dont own the property");
        prop.remove((err) => {
            if (err)
                return res.status(500).send("Server error!");
            return res.status(204).send("Property removed!");
        });
    });
});


deleteFile = (image) => {
    if (image != "no")
        if (fs.existsSync(path.join(__dirname, '../uploads/properties/', image)))
            fs.unlink('./uploads/properties/' + image, (err) => {
                if (err) throw err;
            });
};
module.exports = router;