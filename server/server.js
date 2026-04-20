const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Compression middleware
app.use(compression());

// Trust proxy — required when behind Vercel / ngrok / any reverse proxy
// Fixes: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR from express-rate-limit
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  },
  hsts: { maxAge: 31536000 },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS — allow Vercel frontend + local dev
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// Routes
// app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/generate', require('./routes/ideaRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

app.get('/', (req, res) => {
    res.send('Planora API is running');
});

app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
