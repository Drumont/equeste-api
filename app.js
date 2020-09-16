const express = require('express')
const app = express();
const morgan = require('morgan');

// Morgan
app.use(morgan('dev'));

// Middleware
app.use(((req, res, next) => {
    next();
}))

app.get('/api/v1', (req, res) => {
    res.json(success('API version 1'));
})

app.listen(8080, ()=> {
    console.log('Started on port 8080');
})



