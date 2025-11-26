const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');

// connect DB
connectToDb();

// core middlewares
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
const authRoutes = require('./routes/auth.routes');
const journalRoutes = require('./routes/journal.routes');
const cbtRoutes = require('./routes/cbt.routes');
const healthRoutes = require('./routes/health.routes');

// mount
app.use('/auth', authRoutes);
app.use('/journals', journalRoutes);
app.use('/cbt', cbtRoutes);
app.use('/health', healthRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});


const { errorHandler } = require('./middlewares/error.middleware');
app.use(errorHandler);

module.exports = app;
