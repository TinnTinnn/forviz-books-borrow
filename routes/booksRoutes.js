import express from 'express'

import {
    addBook,
    borrowBook,
    deleteBook,
    getBooks, getMostBorrowedBooks,
    getUserBooks,
    returnBook,
    searchBook,
    updateBook
} from "../controller/booksController.js";
import auth from "../middlewares/auth.js";

const router = express.Router()

// Get all books route
router.get('/', getBooks)

// Get user books route
router.get('/user',auth, getUserBooks)

// All new book route
router.post('/', auth, addBook)

// Update book route
router.put('/:id', auth,  updateBook)

// Delete book route
router.delete('/:id', auth, deleteBook)

// Search Book route
router.get('/search', searchBook)

// Borrow Book route
router.post('/borrow/:id', auth, borrowBook)

// Return Book route
router.post('/return/:id', auth, returnBook)

// Most Borrowed route
router.get('/most-borrowed', getMostBorrowedBooks);




export {router as booksRoutes}