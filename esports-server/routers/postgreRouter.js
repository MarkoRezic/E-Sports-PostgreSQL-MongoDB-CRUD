require('dotenv').config();

const express = require('express');
const postgreRouter = express.Router();
const database = require('../database.js');

postgreRouter.get('/', (req, res) => {
    database.db_postgre.query(
        `SELECT id_turnir, id_igra, id_lokacija, id_server, id_tip_turnira, id_organizator, pocetak, kraj, naziv
        FROM e_sports.turnir;
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

module.exports = postgreRouter;