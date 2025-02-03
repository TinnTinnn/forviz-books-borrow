import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config.js'

/*************************************   Json Web Token (JWT)   ******************************************/
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: "1D"});
}

/*************************************   Register User   ******************************************/
const registerUser = async (req, res) => {
    // Grab data from request body
    const { email, password } = req.body

    // Check the fields are not empty
    if (!email || !password) {
        return res.status(400).json({error: "All fields are required"})
    }

    // XCheck if email already exist
    const exist = await User.findOne({ email })
    if (exist) {
        return res.status(400).json({error: "Email already exists"})
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt)

    try {
        // Register the user
        const user = await User.create({email, password : hashed})

        // Create teh JsonWebToken
        const token = createToken(user._id)

        // Send the response
        res.status(200).json({ email, token })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}



/*************************************   Login User   ******************************************/

const loginUser = async (req, res) => {
    // Grab data from request body
    const { email, password } = req.body

    // Check the fields are not empty
    if (!email || !password) {
        return res.status(400).json({error: "All fields are required"})
    }

    // XCheck if email already exist
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json({error: "Incorrect email"})
    }

    // Check password
    const  match = await bcrypt.compare(password, user.password)
    if (!match) {
        return res.status(400).json({error: "Incorrect password"})
    }

    try {
        // Create teh JsonWebToken
        const token = createToken(user._id)

        // Send the response
        res.status(200).json({email, token })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}



/************************  Logout User *************************/
const logoutUser = async (req, res) => {
    try {
        res.status(200).json({ message: "User logged out successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { registerUser, loginUser, logoutUser }