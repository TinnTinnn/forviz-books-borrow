import express from 'express';
import {booksRoutes} from './routes/booksRoutes.js';
import {usersRoutes} from './routes/usersRoutes.js';
import mongoose from 'mongoose';

const app = express()

app.use(express.json())

app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);

mongoose.connect('mongodb://localhost:27017/', {dbName: 'forvizBook_db'})
    .then(() => {
        console.log('Connected to MongoDB successfully.');
        app.listen(4000, 'localhost', () => console.log("Listening on port 4000"));
    })
    .catch(err => console.log(err));

