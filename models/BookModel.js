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
    }
}, { timestamps: true });

const Book = mongoose.model("Book", BookSchema);


export default Book;