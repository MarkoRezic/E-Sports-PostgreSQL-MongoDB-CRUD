require('dotenv').config();
const {
    POSTGRESQL_DB_SCHEMA
} = process.env;

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
        WHERE table_schema='${POSTGRESQL_DB_SCHEMA}'
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

postgresRouter.get('/foreign_values/:table_name', (req, res) => {
    const foreign_query_map = req.app.get('foreign_query_map')
    if (foreign_query_map[req.params.table_name] != null) {
        database.db_postgres.query(
            `SELECT ${foreign_query_map[req.params.table_name]['foreign_select']}
        ${foreign_query_map[req.params.table_name]['foreign_join']}
        `,
            (error, result) => {
                if (error) {
                    console.log(error.message);
                    res.json({ status: 'an sql error occurred', error: 1 });
                }
                else {
                    console.log(result.rows[0])
                    if (result.rows.length > 0) {
                        console.log(req.params.table_name)
                        for (let key of Object.keys(result.rows[0])) {
                            result.rows[0][key] = result.rows[0][key] != null ? result.rows[0][key].map((value) => {
                                let valueObj = {}
                                if (key !== 'partija') {
                                    valueObj[value.replace(/^\(/, '').replace(/\)$/, '').split(',')[0]] = value.replace(/^\(/, '').replace(/\)$/, '').replace(/"/g, '').split(',')[1]
                                }
                                else {
                                    let val = value.replace(/^\(/, '').replace(/\)$/, '')
                                    valueObj[val] = val
                                }
                                return valueObj
                            }) : []
                        }
                    }
                    console.log(result.rows[0])
                    res.json({ status: 'success', error: 0, result: result });
                }
            });
    }
    else {
        res.json({ status: 'success', error: 0, result: { rows: [] } });
    }
});

postgresRouter.get('/table/:table_name', (req, res) => {
    const table_foreign_columns = req.app.get('table_foreign_columns')
    const foreign_query_map = req.app.get('foreign_query_map')
    database.db_postgres.query(
        `SELECT ${POSTGRESQL_DB_SCHEMA}.${req.params.table_name}.*${foreign_query_map[req.params.table_name] != null ? foreign_query_map[req.params.table_name]['select'] : ''}
        FROM ${POSTGRESQL_DB_SCHEMA}.${req.params.table_name}
        ${foreign_query_map[req.params.table_name] != null ? foreign_query_map[req.params.table_name]['join'] : ''};
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
    const values = Object.values(req.body).map((value) => value === null ? `NULL` : `'${value}'`).join(', ')
    console.log(fields, values)

    database.db_postgres.query(
        `INSERT
        INTO ${POSTGRESQL_DB_SCHEMA}.${req.params.table_name}
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
        ${POSTGRESQL_DB_SCHEMA}.${req.params.table_name}
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
        FROM ${POSTGRESQL_DB_SCHEMA}.${req.params.table_name}
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