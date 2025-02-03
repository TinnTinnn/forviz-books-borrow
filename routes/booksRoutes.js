import express from 'express'
import Book from "../models/BookModel.js";
import {addBook, deleteBook, getBooks, updateBook} from "../controller/booksController.js";

const router = express.Router()

// Get all books route
router.get('/', getBooks)

// All new book route
router.post('/', addBook)

// Update book route
router.put('/:id', updateBook)

// Delete book route
router.delete('/:id', deleteBook)



export {router as booksRoutes}