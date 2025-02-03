import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    totalCopies: {
        type: Number,
        required: true,
        default: '1',
    },
    availableCopies: {
        type: Number,
        required: true,
        default: '1',
    },
    borrowCount: {
        type: Number,
        required: true,
        default: '0',
    },
}, { timestamps: true });

const Book = mongoose.model("Book", BookSchema);


export default Book;