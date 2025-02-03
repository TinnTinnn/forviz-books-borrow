import express from 'express'

import {addBook, deleteBook, getBooks, getUserBooks, updateBook} from "../controller/booksController.js";
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



export {router as booksRoutes}