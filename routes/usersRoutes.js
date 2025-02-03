import express from 'express';
import {loginUser, logoutUser, registerUser} from "../controller/userController.js";


const router = express.Router();

// Register user route
router.post('/', registerUser)

// Login user route
router.post('/login', loginUser)

// Logout user route
router.post('/logout', logoutUser)

export { router as usersRoutes }