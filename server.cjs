const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-me';

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY);
        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Регистрация
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Вход
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: '7d',
        });

        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /week
app.get('/week', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, day, text, completed FROM tasks WHERE user_id = $1',
            [req.userId]
        );

        const week = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
        };

        result.rows.forEach(task => {
            if (week[task.day]) {
                week[task.day].push(task);
            }
        });

        res.json(week);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /task
app.post('/task', authMiddleware, async (req, res) => {
    const { day, text } = req.body;

    if (!day || !text) {
        return res.status(400).json({ error: 'Day and text are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (user_id, day, text, completed) VALUES ($1, $2, $3, false) RETURNING id, day, text, completed',
            [req.userId, day, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /task/:id
app.put('/task/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING id, day, text, completed',
            [completed, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /task/:id
app.delete('/task/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});