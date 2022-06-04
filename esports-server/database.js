require('dotenv').config();
const {
    MYSQL_DB_HOST,
    MYSQL_DB_USER,
    MYSQL_DB_PASSWORD,
    MYSQL_DB_DATABASE,
    POSTGRESQL_DB_HOST,
    POSTGRESQL_DB_USER,
    POSTGRESQL_DB_PASSWORD,
    POSTGRESQL_DB_DATABASE,
    POSTGRESQL_DB_SCHEMA,
    MONGO_DB_HOST,
    MONGO_DB_USER,
    MONGO_DB_PASSWORD,
    MONGO_DB_DATABASE,
    MONGO_DB_PORT
} = process.env;

const mysql = require("mysql");
const pg = require("pg");
const MongoClient = require('mongodb').MongoClient

const db_mysql = mysql.createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    user: MYSQL_DB_USER,
    host: MYSQL_DB_HOST,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_DATABASE,
    charset: 'utf8mb4_unicode_ci',
});

const db_mysql_parallel = mysql.createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    user: MYSQL_DB_USER,
    host: MYSQL_DB_HOST,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_DATABASE,
    charset: 'utf8mb4_unicode_ci',
    multipleStatements: true,
});

const db_postgres = new pg.Pool({
    user: POSTGRESQL_DB_USER,
    host: POSTGRESQL_DB_HOST,
    password: POSTGRESQL_DB_PASSWORD,
    database: POSTGRESQL_DB_DATABASE,
    port: 5432,
})

const mongoConenctionString = `mongodb://${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DATABASE}`

module.exports = {
    mysql,
    db_mysql,
    db_mysql_parallel,
    db_postgres,
    MongoClient,
    mongoConenctionString
};