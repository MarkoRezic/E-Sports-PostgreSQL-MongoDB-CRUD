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

postgresRouter.get('/foreign_keys/:table_name', (req, res) => {
    database.db_postgres.query(
        `SELECT
            tc.table_schema, 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${req.params.table_name}'
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