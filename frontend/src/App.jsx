import { useEffect, useState } from "react";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import DayCard from "../components/DayCard/DayCard";
import AuthModal from "../components/AuthModal/AuthModal";
import Toast from "../components/Toast/Toast";
import axios from "axios";

const App = () => {
  // === AUTH: состояния ===
  // Токен берём из localStorage, если он там есть
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  // Поля для формы логина/регистрации
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Ошибка авторизации
  const [authError, setAuthError] = useState("");
  // Открыта ли модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Режим модалки: 'signin' или 'signup'
  const [authMode, setAuthMode] = useState("signin");

  // === TOAST: состояния ===
  // Сообщение и видимость уведомления
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // === TOAST: показать уведомление ===
  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  // === AUTH: обработка формы ===
  // Принимает объект { username, password, mode } из AuthModal
  const handleAuth = async ({ username, password, mode }) => {
    try {
      if (mode === "signup") {
        // Регистрация, потом сразу логин
        await axios.post("https://api.plannercat.online/register", {
          username,
          password,
        });
        const response = await axios.post(
          "https://api.plannercat.online/login",
          { username, password },
        );
        const token = response.data.token;
        localStorage.setItem("token", token);
        setToken(token);
        setAuthError("");
        showToast("Аккаунт создан! 🎉");
      } else {
        // Вход
        const response = await axios.post(
          "https://api.plannercat.online/login",
          { username, password },
        );
        const token = response.data.token;
        localStorage.setItem("token", token);
        setToken(token);
        setAuthError("");
        showToast("Успешный вход! ✨");
      }
      closeModal(); // Закрываем модалку после успеха
    } catch (err) {
      setAuthError(err.response?.data?.error || "Ошибочка вышла!");
      showToast(
        "Ошибка: " + (err.response?.data?.error || "что-то пошло не так"),
      );
    }
  };

  // === AUTH: управление модалкой ===
  const openSignIn = () => {
    setAuthMode("signin");
    setIsModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode("signup");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const switchMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  // === TASKS: состояния ===
  // Данные недели (задачи по дням)
  const [week, setWeek] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  // Какой день выбран для добавления задачи
  const [activeDay, setActiveDay] = useState(null);
  // Текст новой задачи
  const [newTaskText, setNewTaskText] = useState("");
  // Тема оформления
  const [theme, setTheme] = useState("light");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Список дней недели
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Темы и иконки
  const themes = ["light", "dark", "gothic"];
  const themeIcons = { light: "☀️", dark: "🌙", gothic: "🦇" };

  // === TASKS: добавление ===
  const addTask = async (day) => {
    if (newTaskText.trim() === "") return;
    await axios.post(
      "https://api.plannercat.online/task",
      { day, text: newTaskText },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const response = await axios.get("https://api.plannercat.online/week", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWeek(response.data);
    setNewTaskText("");
    setActiveDay(null);
    showToast("Задача добавлена! 🐾");
  };

  // === TASKS: переключение выполнения ===
  const toggleTask = async (day, taskId) => {
    const task = week[day].find((t) => t.id === taskId);
    if (!task) return;
    await axios.put(
      `https://api.plannercat.online/task/${taskId}`,
      { completed: !task.completed },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const response = await axios.get("https://api.plannercat.online/week", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWeek(response.data);
  };

  // === TASKS: удаление ===
  const deleteTask = async (day, taskId) => {
    await axios.delete(`https://api.plannercat.online/task/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await axios.get("https://api.plannercat.online/week", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWeek(response.data);
    showToast("Задача удалена");
  };

  // === EFFECTS: загрузка недели при старте ===
  useEffect(() => {
    if (!token) return;
    const fetchWeek = async () => {
      const response = await axios.get("https://api.plannercat.online/week", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeek(response.data);
    };
    fetchWeek();
  }, [token]);

  // === EFFECTS: смена темы ===
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("gothic-theme");
    } else if (theme === "gothic") {
      document.body.classList.add("gothic-theme");
      document.body.classList.remove("dark-theme");
    } else {
      document.body.classList.remove("dark-theme", "gothic-theme");
    }
  }, [theme]);

  // === RENDER: если нет токена — показываем только модалку ===
  if (!token) {
    return (
      <div className="App">
        <h1>Plan Cat</h1>
        <p>Войдите или зарегистрируйтесь, чтобы начать</p>
        <button onClick={openSignIn}>Войти</button>
        <button onClick={openSignUp}>Регистрация</button>

        <AuthModal
          isOpen={isModalOpen}
          mode={authMode}
          onClose={closeModal}
          onSwitchMode={switchMode}
          onSubmit={handleAuth}
        />

        <Toast
          message={toastMessage}
          isVisible={isToastVisible}
          onClose={() => setIsToastVisible(false)}
        />
      </div>
    );
  }

  // === RENDER: основной интерфейс ===
  return (
    <div
      className={`App ${theme === "dark" ? "dark-theme" : theme === "gothic" ? "gothic-theme" : ""}`}
    >
      {/* Кнопка смены темы */}
      <div className={`theme-toggle ${isThemeMenuOpen ? "theme-toggle--open" : ""}`}>
        <button
          type="button"
          className="theme-toggle__current"
          onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          aria-label="Открыть выбор темы"
          aria-expanded={isThemeMenuOpen}
        >
          <span>{themeIcons[theme]}</span>
          <span className="theme-toggle__arrow">▼</span>
        </button>

        <div className="theme-toggle__menu">
          {themes.map((themeName) => (
            <button
              key={themeName}
              type="button"
              className={theme === themeName ? "theme-toggle__button theme-toggle__button--active" : "theme-toggle__button"}
              onClick={() => {
                setTheme(themeName);
                setIsThemeMenuOpen(false);
              }}
              aria-label={`Тема: ${themeName}`}
              title={themeName}
            >
              {themeIcons[themeName]}
            </button>
          ))}
        </div>
      </div>

      {/* Призрак для готической темы */}
      {theme === "gothic" && (
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

      {/* Шапка */}
      <Header onSignIn={openSignIn} onSignUp={openSignUp} />

      <main>
        <div className="page-header">
          <p>Организуй свои дни легко и стильно с пушистым помощником 🐾</p>
        </div>

        {/* Сетка дней */}
        <div className="week-grid">
          {days.map((day) => (
            <DayCard
              key={day}
              day={day}
              tasks={week[day]}
              onAddTask={() => setActiveDay(day)}
              onToggleTask={(index) => toggleTask(day, week[day][index].id)}
              onDeleteTask={(index) => deleteTask(day, week[day][index].id)}
            />
          ))}
        </div>

        {/* Форма добавления задачи (появляется при выборе дня) */}
        {activeDay && (
          <div className="add-task-form">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask(activeDay);
              }}
            >
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Новая задача"
                autoFocus
              />
              <button type="submit">Добавить</button>
              <button type="button" onClick={() => setActiveDay(null)}>
                Отмена
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />

      {/* Модалка входа/регистрации (для случая, когда токен есть, но пользователь хочет перелогиниться) */}
      <AuthModal
        isOpen={isModalOpen}
        mode={authMode}
        onClose={closeModal}
        onSwitchMode={switchMode}
        onSubmit={handleAuth}
      />

      {/* Уведомления */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
};

export default App;
