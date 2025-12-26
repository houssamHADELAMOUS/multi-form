const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/forms', require('./routes/forms'));

// Fake users endpoint
app.get('/api/users', (req, res) => {
  res.json([
    { id: 'EMP001', name: 'أحمد محمد', role: 'employee' },
    { id: 'EMP002', name: 'فاطمة علي', role: 'employee' },
    { id: 'EMP003', name: 'محمود سعيد', role: 'employee' }
  ]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
