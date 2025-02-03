import express from 'express'

const router = express.Router()

router.get('/about', (req, res) => {
    res.status(200).json({ msg: 'Hello World!' });
})


router.post('/', (req, res) => {
    console.log(req.body);
    res.status(200).json({ msg: 'book request' })
})

export { router as booksRoutes }