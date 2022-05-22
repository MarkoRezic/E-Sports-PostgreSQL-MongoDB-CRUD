require('dotenv').config();

const express = require('express');
const userRouter = express.Router();
const database = require('../database.js');

userRouter.get('/', (req, res) => {
    database.db_mysql.query("SELECT * FROM users",
        (error, result) => {
            if (error) {
                console.log(error.message);
                res.json({ status: 'an sql error occurred', error: 1 });
            }
            else {
                res.json({ status: 'success', error: 0, result: result });
            }
        });
});

module.exports = userRouter;