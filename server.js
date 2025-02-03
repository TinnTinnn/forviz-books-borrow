import express from 'express';
import {booksRoutes} from './routes/booksRoutes.js';
import mongoose from 'mongoose';

const app = express()

app.use(express.json())

app.use('/api/books', booksRoutes);

mongoose.connect('mongodb://localhost:27017').then(() => {
    console.log('Connected to MongoDB successfully.');
    app.listen(4000, 'localhost', () => console.log("Listening on port 4000"));
})
    .catch(err => console.log(err));

 