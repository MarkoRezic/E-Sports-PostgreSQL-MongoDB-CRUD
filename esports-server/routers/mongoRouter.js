require('dotenv').config();

const express = require('express');
const mongoRouter = express.Router();
const database = require('../database.js');

mongoRouter.use((req, res, next) => {

    database.MongoClient.connect(database.mongoConenctionString, (err, client) => {
        if (err) return console.error(err)
        else {
            const db = client.db('e_sports')

            req.db = db;
            next();

        }
    })
})


mongoRouter.get('/collections', (req, res) => {

    req.db.listCollections().toArray((error, result) => {
        if (error) {
            console.log(error.message);
            res.json({ status: 'an sql error occurred', error: 1 });
        }
        else {
            res.json({ status: 'success', error: 0, result: result });
        }
    });


});

mongoRouter.get('/collection/:collection_name', (req, res) => {

    req.db.collection(req.params.collection_name).find().toArray()
        .then(results => {
            res.json({ results: results });
        })

});



module.exports = mongoRouter;