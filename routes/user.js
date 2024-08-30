const fs = require('fs');
const path = require('path');
const { Router } = require('express');
const User = require('../models/user'); 
const multer = require('multer');

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Use the uploadDir variable
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/signin', (req, res) => {
    res.render('signin', { user: req.user });
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', upload.single('profileImage'), async (req, res) => {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const profileImageURL = req.file ? `/uploads/${req.file.filename}` : undefined;

        await User.create({
            fullName,
            email,
            password,
            profileImageURL,
            role: role.toUpperCase(),
        });

        res.redirect('/user/signin');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error.');
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await User.matchPasswordAndGenerateToken(email, password);
        console.log("User Token:", token);
        res.cookie("token", token).redirect("/");
    } catch (error) {
        console.error('Error signing in:', error);
        res.render("signin", { error: "Incorrect Email or Password" });
    }
});

module.exports = router;
