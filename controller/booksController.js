import Book from "../models/BookModel.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";


/*************************************   Get All Book   ******************************************/
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({createdAt: "desc"})
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
        const userBooks = await Book.find({user: user._id}).sort({createdAt: "desc"})
        if (userBooks.length === 0) {
            return res.status(200).json({message: "No books found."})
        }
        res.status(200).json({email: user.email, userBooks})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}


/*************************************   Create New Book   ******************************************/
const addBook = async (req, res) => {

    //  Grab the data from request body
    const {title, author, category, totalCopies} = req.body;

    // Check the fields are not empty
    if (!title || !author || !category) {
        return res.status(400).json({error: 'Title, author, and category are required'});
    }

    // Grab the authenticated user from request body
    const user = await User.findById(req.user._id)

    try {
        const book = await Book.create({
            user: user._id,
            title,
            author,
            category,
            totalCopies: totalCopies || 1,  // receive value from req.body or set default to 1
            availableCopies: totalCopies || 1, // set value availableCopies same as totalCopies
        })

        res.status(200).json({success: 'book create successfully', book})
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}


/*************************************   Update Book   ******************************************/
const updateBook = async (req, res) => {
    //  Grab the data from request body
    const {title, author, category, totalCopies, availableCopies, } = req.body;

    // // Check the fields are not empty
    // if (!title || !author || !category) {
    //     return res.status(400).json({error: 'Title, author, and category are required'});
    // }

    // Check the ID is valid type
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({error: 'Invalid id.'})
    }

    try {
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

        // Verify value totalCopies and availableCopies
        if (totalCopies !== undefined) {
            if (totalCopies < (book.totalCopies - book.availableCopies)) {
                return res.status(400).json({
                    error: 'Total copies cannot be less than the number of borrowed copies.'
                });
            }
        }

        if (availableCopies !== undefined) {
            if (availableCopies < 0 || availableCopies > (totalCopies || book.totalCopies)) {
                return res.status(400).json({
                    error: 'Available copies must be between 0 and total copies.'
                })
            }
        }

        // Update book
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: title || book.title,
                author: author || book.author,
                category: category || book.category,
                totalCopies: totalCopies !== undefined ? totalCopies : book.totalCopies,
                availableCopies: availableCopies !== undefined ? availableCopies : book.availableCopies
            },
            { new: true } // return new data after update
        )
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

/*************************************   Search Book   ******************************************/
const searchBook = async (req, res) => {
    try {
        //  Grab the data from request body
        let {title, author, category} = req.query;

        // Trim whitespace หากมี
        title = title ? title.trim() : title;
        author = author ? author.trim() : author;
        category = category ? category.trim() : category;


        // Create dynamic filter and add any key that have value
        const filter = {};

        if (title) {
            filter.title = {$regex: title, $options: 'i'};
        }
        if (author) {
            filter.author = {$regex: author, $options: 'i'};
        }
        if (category) {
            filter.category = {$regex: category, $options: 'i'};
        }

        // Find book with filter that created and sort by created at
        const books = await Book.find(filter).sort({createdAt: "desc"});

        //  don't match any book will return res and msg
        if (books.length === 0) {
            return res.status(200).json({message: "No books found matching."})
        }

        res.status(200).json({books})

    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

/*************************************   Borrow Book   ******************************************/
const borrowBook = async (req, res) => {
    try {
        //  Check ID is ObjectID
        const {_id} = req.params;
        if (!_id || !mongoose.Types.ObjectId.isValid(req.params._id)) {
            return res.status(400).json({error: 'Invalid book id.'})
        }
        // Find book from DB
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(400).json({error: 'Book not found'})
        }

        // Check the book available for borrow ?

    } catch (error) {

    }
}



/*************************************   Todo    ******************************************/
/*************************************

 - Have job with borrowCount When update
 - Have to check Delete method more after add some parameter in Book Model
 - Function about Borrow not done yet


 ******************************************/



export {getBooks, getUserBooks, addBook, deleteBook, updateBook, searchBook};


