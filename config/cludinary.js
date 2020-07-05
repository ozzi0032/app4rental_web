const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'TODO',
  api_key: 'TODO',
  api_secret: 'TODO'
});
module.exports = cloudinary;