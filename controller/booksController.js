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
    const {title, author, category, totalBooks} = req.body;

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
            totalBooks: totalBooks || 1,  // receive value from req.body or set default to 1
            availableBooks: totalBooks || 1, // set value availableBooks same as totalBooks
        })

        res.status(200).json({success: 'book create successfully', book})
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}


/*************************************   Update Book   ******************************************/
const updateBook = async (req, res) => {
    //  Grab the data from request body
    const {title, author, category, totalBooks } = req.body;

    // Check the fields are not empty
    if (!title || !author || !category || totalBooks === undefined) {
        return res.status(400).json({error: 'All fields are required'});
    }

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

        // Check totalBooks not less than borrowCount
        const borrowedBooks = book.totalBooks - book.availableBooks;
        if (totalBooks < borrowedBooks) {
            return res.status(400).json({
                error: `Cannot set totalBooks less than the number of borrowed books (${borrowedBooks}).`
            });
        }

        // Update book
        book.title = title || book.title;
        book.author = author || book.author;
        book.category = category || book.category;
        book.availableBooks += (totalBooks - book.totalBooks); // เพิ่ม/ลดความแตกต่าง
        book.totalBooks = totalBooks;

        await book.save();

        // Send response
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
    const { id  } = req.params;

    // Check the ID is valid type
    if (!mongoose.Types.ObjectId.isValid(id )) {
        return res.status(400).json({error: 'Invalid book id.'})
    }

    try {
        // Find book from DB
        const book = await Book.findById(id );
        if (!book) {
            return res.status(400).json({error: 'Book not found'})
        }

        // Check the book available for borrow ?
        if (book.availableBooks <= 0) {
            return res.status(400).json({error: 'No available book to borrow..'})
        }

        // Update borrow status
        book.availableBooks -= 1;
        book.borrowCount += 1;
        await book.save();

        // Send response
        res.status(200).json({success: 'book borrowed successfully', book})

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

/*************************************   Return Book   ******************************************/
const returnBook = async (req, res) => {
    const { id  } = req.params;

    // Check the ID is valid type
    if (!mongoose.Types.ObjectId.isValid(id )) {
        return res.status(400).json({error: 'Invalid book id.'})
    }
    
    try {
        const book = await Book.findById(id );
        if (!book) {
            return res.status(400).json({error: 'Book not found'})
        }
        
        // Check Book has borrowed ?
        if (book.availableBooks >= book.totalBooks) {
            return res.status(400).json({success: 'All book are already return'})
        }

        // Update borrow status
        book.availableBooks += 1;
        await book.save();

        // Send response
        res.status(200).json({success: 'book returned successfully', book})
    } catch (error) {
        res.status(500).json({error: error.message});
    }
    
}

/*************************************   Most Borrowed  Books   ******************************************/
const getMostBorrowedBooks = async (req, res) => {
    try {
        // Find books sorted by borrowCount in descending order, limit the number of results to 5
        const mostBorrowedBooks = await Book.find()
            .sort({ borrowCount: -1 }) // Sort by borrowCOunt in desc
            .limit(5); // Limit to top 5 most borrowed books

        if(mostBorrowedBooks.length === 0 ) {
            return res.status(200).json({error: 'No books found matching.'})
        }

        res.status(200).json({ mostBorrowedBooks})

    } catch (error) {
        res.status(500).json({error: error.message});
    }
}







/*************************************   Todo    ******************************************/
/*************************************

 - Have job with borrowCount When update
     - ไม่ต้องแล้วแก้แล้ว เพราะ borrowCount จะนับก็ต่อเมื่อ ถูกเรียกใช้ตอนฟังค์ชั่น ยืมหนังสือ คืนหนังสือเท่านั่น
     - ส่วนการแก้ไขหนังสือ อัพเดทหนังสือไม่เกี่ยวข้องกัน เพราะส่วนนั้น จะทำเฉพาะรายละเอียดของหนังสือเท่านั้น ไม่เกี่ยวกับการสถิติการยืมคืน
     - แต่ท้ายที่สุด ได้ทำให้เพิ่มการแก้ไข totalBook ได้ เพราะผู้ใช้อาจเกิดความผิดพลาดขณะกรอกข้อมูลตัวเลขได้ และควรจะแก้ไขส่วนนี้ได้
     - ในส่วนของ จำนวนคงเหลือในการยืม และ สถิติการยืมมากที่สุด ให้ Logic จัดการ เมื่อมีการเรียกใช้ API ยืม และ คืน โดย User ไม่ต้องไปวุ่นวาย
 - Have to check Delete method more after add some parameter in Book Model
 - Function about Borrow not done yet


 ******************************************/



export {getBooks, getUserBooks, addBook, deleteBook, updateBook, searchBook, borrowBook, returnBook, getMostBorrowedBooks};


