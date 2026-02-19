const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
// app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/generate', require('./routes/ideaRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('Planora API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
