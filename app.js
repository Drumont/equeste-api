const express = require('express')
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;
const response = require('./apiRouter');

// Morgan
app.use(morgan('dev'));

// Body Parser Configuration
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


// Middleware
app.use(((req, res, next) => {
    next();
}))

app.get('/api/v1', (req, res) => {
    res.json(response.success('API version 1'));
})

app.use('/api/', apiRouter);

//Launch server
app.listen(8080, ()=> {
    console.log('Started on port 8080');
})



