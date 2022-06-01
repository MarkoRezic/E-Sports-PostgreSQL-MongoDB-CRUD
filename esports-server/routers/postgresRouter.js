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

postgresRouter.post('/table/:table_name', (req, res) => {

    const fields = Object.keys(req.body).join(', ')
    const values = Object.values(req.body).map((value) => `'${value}'`).join(', ')
    console.log(fields, values)

    database.db_postgres.query(
        `INSERT
        INTO e_sports.${req.params.table_name}
        (${fields})
        VALUES (${values});
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

postgresRouter.put('/table/:table_name/:id_original', (req, res) => {

    console.log(req.body)
    let field_set_values = Object.keys(req.body)
    field_set_values.shift()
    field_set_values = field_set_values.map((key) => `${key} = '${req.body[key]}'`).join(', ')

    database.db_postgres.query(
        `UPDATE
        e_sports.${req.params.table_name}
        SET 
        ${field_set_values}
        WHERE id_${req.params.table_name} = ${req.params.id_original};
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

postgresRouter.delete('/table/:table_name/:id_original', (req, res) => {

    database.db_postgres.query(
        `DELETE
        FROM e_sports.${req.params.table_name}
        WHERE id_${req.params.table_name} = ${req.params.id_original};
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