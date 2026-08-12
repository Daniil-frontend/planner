const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

// Подключение к базе данных
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// GET /week — получить все задачи, сгруппированные по дням
app.get('/week', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id');
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

// POST /task — добавить новую задачу
app.post('/task', async (req, res) => {
    const { day, text } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (day, text, completed) VALUES ($1, $2, false) RETURNING *',
            [day, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /task/:id — обновить задачу
app.put('/task/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /task/:id — удалить задачу
app.delete('/task/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Задача не найдена' });
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