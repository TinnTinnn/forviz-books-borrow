import Book from "../models/BookModel.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";


/*************************************   Get All Book   ******************************************/
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: "desc"})
        if (books.length === 0) {
            return res.status(200).json({message: "No books found."})
        }
        res.status(200).json({books})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

/*************************************   Get User Books   ******************************************/
const getUserBooks = async (req, res) => {
    // Grab the authenticated user from request body
    const user = await User.findById(req.user._id)

    try {
        const userBooks = await Book.find({ user: user._id}).sort({ createdAt: "desc"})
        if (userBooks.length === 0) {
            return res.status(200).json({message: "No books found."})
        }
        res.status(200).json({ email: user.email, userBooks })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}



/*************************************   Create New Book   ******************************************/
const addBook = async (req, res) => {

    //  Grab the data from request body
    const {title, author, category} = req.body;

    // Check the fields are not empty
    if (!title || !author || !category) {
        return res.status(400).json({error: 'All fields are required'});
    }

    // Grab the authenticated user from request body
    const user = await User.findById(req.user._id)

    try {
        const book = await Book.create({user: user._id, title, author, category})

        res.status(200).json({success: 'book create successfully', book})
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}


/*************************************   Update Book   ******************************************/
const updateBook = async (req, res) => {
    //  Grab the data from request body
    const {title, author, category} = req.body;

    // Check the fields are not empty
    if (!title || !author || !category) {
        return res.status(400).json({error: 'All fields are required'});
    }

    // Check the ID is valid type
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({error: 'Invalid id.'})
    }

    // Check the book exists
    const book = await Book.findById(req.params.id)
    if (!book) {
        return res.status(400).json({error: 'Book not found'})
    }

    // Check the user owns the book
    const user = await User.findById(req.user._id)
    if (!book.user.equals(user._id)) {
        return res.status(401).json({error: 'Not authorized'})
    }

    try {
        await book.updateOne({title, author, category})
        res.status(200).json({success: 'book updated successfully'})
    } catch (error) {
        return res.status(500).json({error: error.message});
    }

}


/*************************************   Delete Book   ******************************************/
const deleteBook = async (req, res) => {
    // Check the ID is valid type
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({error: 'Invalid id.'})
    }

    // Check the book exists
    const book = await Book.findById(req.params.id)
    if (!book) {
        return res.status(400).json({error: 'Book not found'})
    }

    // Check the user owns the book
    const user = await User.findById(req.user._id)
    if (!book.user.equals(user._id)) {
        return res.status(401).json({error: 'Not authorized'})
    }

    try {
        await book.deleteOne()
        res.status(200).json({success: 'book was deleted.'})
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}


export {getBooks, getUserBooks, addBook, deleteBook, updateBook};