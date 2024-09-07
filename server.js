const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const connectDB = require('./connectDB'); // Mongoose connection

const allowedUsername = 'Logic Gamer'; // Only Logic Gamer can upload vouches

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
    secret: 'SWEARILLGOTOBEESS', // Replace with your session secret
    resave: false,
    saveUninitialized: true,
}));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Vouch Schema
const VouchSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true }
});
const Vouch = mongoose.model('Vouch', VouchSchema);

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        req.session.username = username; // Log the user in by storing username in session
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Route
app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        req.session.username = username; // Log the user in by storing username in session
        res.status(200).json({ message: 'Login successful', redirect: '/vouches' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload Vouch Route (restricted to Logic Gamer)
app.post('/api/upload-vouch', upload.single('vouchImage'), async (req, res) => {
    if (req.session.username !== allowedUsername) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    const vouchImageUrl = `/uploads/${req.file.filename}`;
    const newVouch = new Vouch({ imageUrl: vouchImageUrl });
    await newVouch.save();
    res.status(200).json({ message: 'Vouch uploaded successfully!', imageUrl: vouchImageUrl });
});

// Get Vouches (publicly accessible)
app.get('/api/vouches', async (req, res) => {
    try {
        const vouches = await Vouch.find({}).exec();
        res.json({ vouches: vouches.map(vouch => vouch.imageUrl) });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check Session Route
app.get('/api/check-session', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/vouches', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vouches.html'));
});

app.get('/uploads', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploads'));
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }
        res.redirect('/signin');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
