const { Router } = require('express');
const Blog = require('../models/blog');
const { checkForAuthentication } = require('../middleware/authentication');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = Router();
const Comment= require('../models/comment');




// Middleware to ensure user is authenticated
router.use(checkForAuthentication('token'));

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure req.user is defined
        if (!req.user || !req.user._id) {
            return cb(new Error('User not authenticated'), null);
        }

        const userDir = path.resolve(`./public/uploads/${req.user._id}`);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// Route to render the form for creating a new blog post
router.get('/create', (req, res) => {
    res.render('create-blog'); // Ensure this EJS template exists
});

router.get('/:id', async (req, res) => {
    try {
        // Fetch the blog post along with the creator's details
        const blog = await Blog.findById(req.params.id).populate('createdBy');

        // Fetch comments related to this blog post
        const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Render the blog page with blog and comments data
        res.render('blog', {
            user: req.user, // Assuming you have user information available
            blog,
            comments // Pass the comments to the view
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Server Error');
    }
});


// Route to handle the form submission for creating a new blog post
router.post('/create', upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;
    const createdBy = req.user._id; // Get the user ID from the request
    const coverImageURL = req.file ? `/uploads/${req.user._id}/${req.file.filename}` : '';

    if (!title || !body) {
        return res.status(400).send('Title and body are required.');
    }

    try {
        await Blog.create({
            title,
            body,
            coverImageURL,
            createdBy
        });
        res.redirect('/'); // Redirect to home page or blog list
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).send('Internal server error.');
    }
});


router.post('/comment/:blogId', async (req, res) => {
    const { content } = req.body;
    const { blogId } = req.params;
    const createdBy = req.user._id;

    if (!content) {
        return res.status(400).send('Content is required.');
    }

    try {
        await Comment.create({
            content,
            blogId,
            createdBy
        });

        res.redirect(`/blog/${blogId}`);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).send('Internal server error.');
    }
});





// Route to display all blogs


// Route to display a single blog


module.exports = router;
