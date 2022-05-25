require('dotenv').config();

const express = require('express');
const postgresRouter = express.Router();
const database = require('../database.js');

postgresRouter.get('/', (req, res) => {
    res.json({ status: 'success', error: 0 });
});

postgresRouter.get('/tables', (req, res) => {
    database.db_postgres.query(
        `SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='e_sports'
        AND table_type='BASE TABLE';
        `,
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

postgresRouter.get('/table/:table_name', (req, res) => {
    database.db_postgres.query(
        `SELECT *
        FROM e_sports.${req.params.table_name};
        `,
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

module.exports = postgresRouter;