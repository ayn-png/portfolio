const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} received from ${req.headers.origin}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Log raw body for debugging
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('Raw POST body:', req.body);
  }
  next();
});

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/portfolio';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define schema for contact form submissions
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// API endpoint to handle form submissions
app.post('/api/contact', async (req, res) => {
  try {
    console.log('POST /api/contact body:', req.body);
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      console.log('Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log('Message saved successfully');
    res.status(200).json({ message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint to verify server
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Fallback for unmatched routes
app.use((req, res) => {
  console.log('Unmatched route:', req.method, req.url);
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));