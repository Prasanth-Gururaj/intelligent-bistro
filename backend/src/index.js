require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chatRouter = require('./routes/chat');
const menuRouter = require('./routes/menu');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/data', express.static(path.join(__dirname, '..', '..', 'data')));
app.use(rateLimit({ windowMs: 60000, max: 30, message: { error: 'Too many requests.' } }));

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api', menuRouter);
app.use('/api/chat', chatRouter);

app.listen(3001, () => console.log('Server running on port 3001'));
