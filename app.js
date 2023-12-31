const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const appointmentRouter = require('./routes/appointment-routes');
const adminRoutes = require('./routes/admin-routes');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    next();
});

app.use('/', appointmentRouter);
app.use('/api/users', usersRoutes);
app.use('/', adminRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
}); 

mongoose
    .connect(
        `mongodb+srv://poc:poc@cluster1.47zqfjq.mongodb.net/POC?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,             // Use the new URL parser
            useUnifiedTopology: true,          // Use the new Server Discovery and Monitoring engine
            useCreateIndex: true,
            useFindAndModify: false,               // Use createIndexes instead of ensureIndex
        }
    )
    .then(() => {
        console.log("Database connected!")
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });

