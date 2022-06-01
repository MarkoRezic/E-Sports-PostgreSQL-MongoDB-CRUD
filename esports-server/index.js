const express = require('express');
const userRouter = require('./routers/userRouter.js');
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

app.use('/users', userRouter);
app.use('/postgres', postgresRouter);
app.use('/mongo', mongoRouter);

app.listen(process.env.PORT || 3001, () => {
    console.log("server running");
});

