const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/database');
var logger = require('morgan');


//defining routes
const users = require('./routes/users');
const upload = require('./routes/upload');
const properties = require('./routes/properties');
const rating = require('./routes/rating');
const admin = require('./routes/admin');


mongoose.connect(config.database, { useNewUrlParser: true });
mongoose.connection.on('connected', () => {
    console.log('Connected to database: ' + config.database);
});

mongoose.connection.on('error', (err) => {
    console.log('Error with connection to db: ' + err);
});

const app = express();
app.use(cors());

app.set('views', __dirname + '/public');
app.set('view engine', 'html');


app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));

app.use(bodyParser.json());


app.use(passport.initialize());


app.use(passport.session());
require('./config/passport')(passport);


//app Routes
app.use('/user', users);
app.use('/admins', admin);
app.use('/uploads', upload);
app.use('/propertie', properties);
app.use('/ratings', rating);

//save route
app.get('**', (req, res) => {
    res.sendfile(__dirname + '/public/index.html');
});

//dynamic port allocation
const port = process.env.PORT || 8080;
//start server
app.listen(port, () => {
    console.log("server started on port: " + port);
});