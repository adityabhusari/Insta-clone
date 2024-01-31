const express = require('express');
const userRouter = require('./api/routes/users');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const postsRouter = require('./api/routes/posts');

mongoose.connect('mongodb+srv://aduspandu:4cYXrrbxFSiQNrYR@node-rest.3emdisf.mongodb.net/insta?retryWrites=true&w=majority');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors(  
    { 
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
));
app.get('/', (req, res) => {
    res.json({
        message: "Hellp"
    })
});
app.use('/users', userRouter);
app.use('/', postsRouter);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;