
const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
var http = require('http');


const cloudinary = require('../config/cludinary');

router.get('/avatars', (req, res) => {
    res.status(400).sendFile(path.resolve(path.join(__dirname, '../uploads/avatar.png')));
});

router.get('/properties', (req, res) => {
    res.status(400).sendFile(path.resolve(path.join(__dirname, '../uploads/property.png')));
});

router.get('/avatars/:image', (req, res) => {
    if (req.params.image == 'no')
        res.status(200).sendFile(path.resolve(path.join(__dirname, '../uploads/avatar.png')));
    else if (fs.existsSync(path.join(__dirname, '../uploads/avatars/', req.params.image))) {
        res.status(200).sendFile(path.resolve(path.join(__dirname, '../uploads/avatars/', req.params.image)));
    } else {
        var url = goForBackup(path.join(__dirname, '../uploads/avatars/'), req.params.image);
        if (url != null) return res.redirect(url);
        else return res.status(200).sendFile(path.resolve(path.join(__dirname, '../uploads/avatar.png')));
    }
});


router.get('/properties/:image', (req, res) => {
    if (req.params.image == 'no')
        res.status(200).sendFile(path.resolve(path.join(__dirname, '../uploads/property.png')));
    else if (fs.existsSync(path.join(__dirname, '../uploads/properties/', req.params.image))) {
        res.status(200).sendFile(path.resolve(path.join(__dirname, '../uploads/properties/', req.params.image)));
    } else {
        var url = goForBackup(path.join(__dirname, '../uploads/properties/'), req.params.image);
        if (url != null) return res.redirect(url);
        else return res.status(200).sendFile(path.resolve(path.join(__dirname, '../uploads/property.png')));
    }
});

goForBackup = function (location, name) {
    var re = /<img[^>]+src="?([^"\s]+)"?[^>]*\/>/g;
    var results = re.exec(cloudinary.image(name));
    var img = results[1];
    var url = img.replace(/['\s]+|['\s]+/g, "").toString();
    var file = fs.createWriteStream(location + name);
    http.get(url, function (response) {
        if (response.statusCode == 200) response.pipe(file);
        else url = null;
    });
    return url;
}
module.exports = router;