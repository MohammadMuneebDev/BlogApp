const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { checkForAuthentication } = require('./middleware/authentication');
const Blog = require("./models/blog");
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const PORT = 8000;
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogify', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'super123',  // Replace with a strong secret
    resave: false,            // Don't save session if unmodified
    saveUninitialized: true,  // Save uninitialized session
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(checkForAuthentication('token'));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure `user` is always available in views
app.use((req, res, next) => {
    res.locals.user = req.user; // Make `user` available in views
    next();
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`Request for ${req.url}`);
    next();
});

// Home route
app.get('/', async (req, res) => {
    if (!req.user) {
        return res.render('home', {
            user: null,
            blogs: [] // Passing an empty array if the user is not signed in
        });
    }

    const allBlogs = await Blog.find({});
    return res.render('home', {
        user: req.user,
        blogs: allBlogs
    });
});


// Additional routes
app.use('/user', userRoute);
app.use('/blog', blogRoute);

// Route for logout
app.get('/logout', (req, res) => {
    if (req.session) {
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error('Failed to destroy session:', err);
                return res.redirect('/error');
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid', { path: '/' });

            // If using a token, clear it (example: token stored in a cookie)
            res.clearCookie('token'); // Assuming the token is stored in a cookie named 'token'

            console.log('Session and token cleared, redirecting to home page.');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});




// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
