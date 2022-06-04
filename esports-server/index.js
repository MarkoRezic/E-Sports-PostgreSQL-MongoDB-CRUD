require('dotenv').config();
const {
    POSTGRESQL_DB_DATABASE,
    POSTGRESQL_DB_SCHEMA
} = process.env;

const express = require('express');
const postgresRouter = require('./routers/postgresRouter.js');
const mongoRouter = require('./routers/mongoRouter.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const database = require('./database.js');

const app = express();

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.set('trust proxy', true);

app.use('/close-connections', (req, res) => {
    database.db_mysql.end()
    database.db_mysql_parallel.end()
    database.db_postgres.end()
    res.json({ message: 'connections closed' });
})

app.use('/postgres', postgresRouter);
app.use('/mongo', mongoRouter);

app.listen(process.env.PORT || 3001, () => {
    console.log("server running");
    database.db_postgres.query(
        `SELECT
            r.table_name,
            u.table_name AS foreign_table,
            array_agg(DISTINCT c1.column_name:: text) AS table_columns,
            array_agg(DISTINCT c2.column_name:: text) AS foreign_columns
        FROM
            information_schema.constraint_column_usage u
            INNER JOIN information_schema.referential_constraints fk ON u.constraint_catalog = fk.unique_constraint_catalog
            AND u.constraint_schema = fk.unique_constraint_schema
            AND u.constraint_name = fk.unique_constraint_name
            INNER JOIN information_schema.key_column_usage r ON r.constraint_catalog = fk.constraint_catalog
            AND r.constraint_schema = fk.constraint_schema
            AND r.constraint_name = fk.constraint_name
            INNER JOIN information_schema.tables t1 ON t1.table_name = r.table_name
            INNER JOIN information_schema.columns c1 ON t1.table_name = c1.table_name
            INNER JOIN information_schema.tables t2 ON t2.table_name = u.table_name
            INNER JOIN information_schema.columns c2 ON t2.table_name = c2.table_name
        WHERE
            u.table_catalog = '${POSTGRESQL_DB_DATABASE}'
            AND u.table_schema = '${POSTGRESQL_DB_SCHEMA}'
        GROUP BY
            r.table_name,
            u.table_name
        `,
        (error, result) => {
            if (error) {
                console.log(error.message);
            }
            else {
                console.log(result)
                app.set('table_foreign_columns', result.rows)
                let foreign_query_map = {}
                for (let row of result.rows) {
                    if (row.table_name !== 'partija') {
                        if (foreign_query_map[row.table_name] == null) {
                            foreign_query_map[row.table_name] = {
                                select: row.foreign_columns.includes('naziv') ? `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.naziv AS ${row.foreign_table}_naziv`
                                    : row.foreign_columns.includes('ime') ? (
                                        row.foreign_columns.includes('prezime') ? `, CONCAT(${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime,' ',${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.prezime) AS ${row.foreign_table}_ime_prezime`
                                            : `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime AS ${row.foreign_table}_ime`
                                    )
                                        : ``,
                                join:
                                    `
                            JOIN ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table} ON ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.id_${row.foreign_table} = ${POSTGRESQL_DB_SCHEMA}.${row.table_name}.id_${row.foreign_table}
                            `,
                                foreign_select: `array_agg(DISTINCT array_${row.foreign_table}::text) AS ${row.foreign_table}`,
                                foreign_join:
                                    (`
                            FROM (
                                SELECT ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.id_${row.foreign_table}` + (row.foreign_columns.includes('naziv') ? `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.naziv AS ${row.foreign_table}_naziv`
                                            : row.foreign_columns.includes('ime') ? (
                                                row.foreign_columns.includes('prezime') ? `, CONCAT(${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime,' ',${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.prezime) AS ${row.foreign_table}_ime_prezime`
                                                    : `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime AS ${row.foreign_table}_ime`
                                            )
                                                : ``)) +
                                    `
                                FROM ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}
                            ) as array_${row.foreign_table}
                            `
                            }
                        }
                        else {
                            foreign_query_map[row.table_name]['select'] += row.foreign_columns.includes('naziv') ? `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.naziv AS ${row.foreign_table}_naziv`
                                : row.foreign_columns.includes('ime') ? (
                                    row.foreign_columns.includes('prezime') ? `, CONCAT(${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime,' ',${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.prezime) AS ${row.foreign_table}_ime_prezime`
                                        : `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime AS ${row.foreign_table}_ime`
                                )
                                    : ``
                            foreign_query_map[row.table_name]['join'] +=
                                `
                        JOIN ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table} ON ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.id_${row.foreign_table} = ${POSTGRESQL_DB_SCHEMA}.${row.table_name}.id_${row.foreign_table}
                        `
                            foreign_query_map[row.table_name]['foreign_select'] += `, array_agg(DISTINCT array_${row.foreign_table}::text) AS ${row.foreign_table}`,
                                foreign_query_map[row.table_name]['foreign_join'] +=
                                (`
                    CROSS JOIN (
                        SELECT ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.id_${row.foreign_table}` + (row.foreign_columns.includes('naziv') ? `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.naziv AS ${row.foreign_table}_naziv`
                                        : row.foreign_columns.includes('ime') ? (
                                            row.foreign_columns.includes('prezime') ? `, CONCAT(${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime,' ',${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.prezime) AS ${row.foreign_table}_ime_prezime`
                                                : `, ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}.ime AS ${row.foreign_table}_ime`
                                        )
                                            : ``)) +
                                `
                        FROM ${POSTGRESQL_DB_SCHEMA}.${row.foreign_table}
                    ) as array_${row.foreign_table}
                    `
                        }

                    }
                    else {
                        foreign_query_map[row.table_name] = {
                            select: `, tim1.naziv AS tim1_naziv, tim2.naziv AS tim2_naziv, timp.naziv AS tim_pobjednik_naziv, ${POSTGRESQL_DB_SCHEMA}.turnir.naziv AS turnir_naziv`,
                            join:
                                `
                    JOIN ${POSTGRESQL_DB_SCHEMA}.tim tim1 ON tim1.id_tim = ${POSTGRESQL_DB_SCHEMA}.partija.id_tim1
                    JOIN ${POSTGRESQL_DB_SCHEMA}.tim tim2 ON tim2.id_tim = ${POSTGRESQL_DB_SCHEMA}.partija.id_tim2
                    JOIN ${POSTGRESQL_DB_SCHEMA}.tim timp ON timp.id_tim = ${POSTGRESQL_DB_SCHEMA}.partija.id_tim_pobjednik
                    JOIN ${POSTGRESQL_DB_SCHEMA}.turnir ON turnir.id_turnir = ${POSTGRESQL_DB_SCHEMA}.partija.id_turnir
                    `,
                            foreign_select: `array_agg(DISTINCT array_tim1::text) AS tim1, array_agg(DISTINCT array_tim2::text) AS tim2, array_agg(DISTINCT array_timp::text) AS tim_pobjednik, array_agg(DISTINCT array_turnir::text) AS turnir`,
                            foreign_join:
                                `
                            FROM (
                                SELECT ${POSTGRESQL_DB_SCHEMA}.tim.id_tim, ${POSTGRESQL_DB_SCHEMA}.tim.naziv AS tim1_naziv
                                FROM ${POSTGRESQL_DB_SCHEMA}.tim
                            ) as array_tim1
                            CROSS JOIN (
                                SELECT ${POSTGRESQL_DB_SCHEMA}.tim.id_tim, ${POSTGRESQL_DB_SCHEMA}.tim.naziv AS tim2_naziv
                                FROM ${POSTGRESQL_DB_SCHEMA}.tim
                            ) as array_tim2
                            CROSS JOIN (
                                SELECT ${POSTGRESQL_DB_SCHEMA}.tim.id_tim, ${POSTGRESQL_DB_SCHEMA}.tim.naziv AS timp_naziv
                                FROM ${POSTGRESQL_DB_SCHEMA}.tim
                            ) as array_timp
                            CROSS JOIN (
                                SELECT ${POSTGRESQL_DB_SCHEMA}.turnir.id_turnir, ${POSTGRESQL_DB_SCHEMA}.turnir.naziv AS turnir_naziv
                                FROM ${POSTGRESQL_DB_SCHEMA}.turnir
                            ) as array_turnir
                            `
                        }
                    }
                }
                console.log(foreign_query_map)
                app.set('foreign_query_map', foreign_query_map)
            }
        });
});

