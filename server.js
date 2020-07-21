// imports
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/users');

// declarations

const server = express();
dotenv.config();
// connecting to database
mongoose.connect(
    process.env.DB_CONNECTION,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true},
    () => console.log("Connected to DB")
);

mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;



// Express body parser
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
    next();
});

server.use('/uploads', express.static('uploads'));

// members routes
server.use('/api/user', userRoutes);

// errors
server.use(function(req, res, next) {
    return res.status(404).send({ message: 'Route'+req.url+' Not found.' });
});

// 500 - Any server error
server.use(function(err, req, res, next) {
    console.log(err);
    return res.status(500).send({ message: err });
});


const PORT = process.env.PORT || 4000;

server.listen(PORT, console.log(`Server started on port ${PORT}`));