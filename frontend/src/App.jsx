import { useEffect, useState } from "react";
import Footer from './Footer'
import "./App.css";
import axios from "axios";

const App = () => {

const [token, setToken] = useState(localStorage.getItem('token') || '');
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [isRegister, setIsRegister] = useState(false);
const [authError, setAuthError] = useState('');

const handleAuth = async (e) => {
    e.preventDefault();
    try {
        if (isRegister) {
            await axios.post('https://plannercat.online/register', { username, password });
            // После регистрации сразу логиним
            const response = await axios.post('https://plannercat.online/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            setToken(token);
            setAuthError('');
        } else {
            const response = await axios.post('https://plannercat.online/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            setToken(token);
            setAuthError('');
        }
    } catch (err) {
        setAuthError(err.response?.data?.error || 'Ошибочка вышла!');
    }
    setUsername('');
    setPassword('');
};


const [week, setWeek] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
});
const [activeDay, setActiveDay] = useState(null);
const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

const [newTaskText, setNewTaskText] = useState("");
const [theme, setTheme] = useState('light');
const themes = ['light', 'dark', 'gothic'];
const themeIcons = { light: '☀️', dark: '🌙', gothic: '🦇' };

    //Добавление задачи
const addTask = async (day) => {
    if (newTaskText.trim() === '') return;
    await axios.post('https://plannercat.online/task', { day, text: newTaskText }, {
        headers:{ Authorization: `Bearer ${token}`}
    });
    const response = await axios.get('https://plannercat.online/week', {
        headers: { Authorization: `Bearer ${token}`}
});
    setWeek(response.data);
    setNewTaskText('');
    setActiveDay(null);
};

        //Переключение выполнения
const toggleTask = async (day, taskId) => {
    const task = week[day].find(t => t.id === taskId);
    if (!task) return;
    await axios.put(`https://plannercat.online/task/${taskId}`, { completed: !task.completed }, {
        headers: { Authorization: `Bearer ${token}`}
    });
    const response = await axios.get('https://plannercat.online/week', {
        headers: { Authorization: `Bearer ${token}`}
    });
    setWeek(response.data);
};

        //Удаление задачи
const deleteTask = async (day, taskId) => {
    await axios.delete(`https://plannercat.online/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}`}
    });
    const response = await axios.get('https://plannercat.online/week', {
        headers: { Authorization: `Bearer ${token}` }
    });
    setWeek(response.data);
};

useEffect(() => {
    const fetchWeek = async () => {
        const response = await axios.get('https://plannercat.online/week', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setWeek(response.data);
    };
    fetchWeek();
}, [token]);

    useEffect(() => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('gothic-theme');
    } else if (theme === 'gothic') {
        document.body.classList.add('gothic-theme');
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.remove('dark-theme', 'gothic-theme');
    }
}, [theme]);

//проверка подключения
if (!token) {

    return (
        <div className="App">
            <h1>Форма входа</h1>
            <form onSubmit={handleAuth}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Логин"
                required
                />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль"
                required
                />
                <button type="submit">
                    {isRegister ? 'Зарегестрироваться' : 'Войти'}
                </button>
            </form>
            <button className="switch-auth-btn" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
            {authError && <p className="auth-error">{authError}</p>}
        </div>
    );
}

return (
    
    <div className={`App ${theme === 'dark' ? 'dark-theme' : theme === 'gothic' ? 'gothic-theme' : ''}`}>
<button
    onClick={() => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    }}
    style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: 'none',
        color: theme === 'dark' ? '#e2e8f0' : theme === 'gothic' ? '#c0c0c0' : '#1f2937',
        zIndex: 10,
    }}
>
    {themeIcons[theme]}
</button>
    {theme === 'gothic' && (
    <div className="ghost-container">
        <div className="ghost-body">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
)}
        <h1>Task Planner</h1>

        <div className="week-grid">
            {days.map((day) => (
                <div key={day} className="day-column">
        <h2 className="day-header">{day}</h2>

<div>
    {/* Круговой прогресс-бар */}
    {(() => {
        const completedCount = week[day].filter(task => task.completed).length;
        const totalCount = week[day].length;
        const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (circumference * percent) / 100;

        return (
            <div style={{ width: '60px', height: '60px', position: 'relative', margin: '0 auto 10px' }}>
    <svg width="60" height="60" viewBox="0 0 60 60">
        <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="var(--progress-bg)"
            strokeWidth="6"
        />
        <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="var(--progress-fill)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
    </svg>
    <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'var(--text)',
    }}>
        {percent}%
    </div>
</div>
        );
    })()}
</div>

        <ul className="day-tasks">
            {week[day].map((task) => (
                <li
                    key={task.id}
                    className={task.completed ? "task-completed" : ""}
                    onClick={() => toggleTask(day, task.id)}
                >
                    {task.text}
                    <button
                        className="delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(day, task.id);
                        }}
                    >
                        ✕
                    </button>
                </li>
            ))}
        </ul>

        {activeDay === day ? (
            <div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        addTask(day);
                    }}
                >
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add Task"
                        autoFocus
                    />
                    <button type="submit">Add Task</button>
                </form>
            </div>
        ) : (
            <button className="add-btn" onClick={() => setActiveDay(day)}>
                + Add Task
            </button>
        )}
                </div>
            ))}
        </div>
        <Footer />
    </div>
);
};

export default App;