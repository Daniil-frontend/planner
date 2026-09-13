import { useEffect, useState } from "react";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import DayCard from "../components/DayCard/DayCard";
import AuthModal from "../components/AuthModal/AuthModal";
import Toast from "../components/Toast/Toast";
import axios from "axios";

const API_URL = "https://api.plannercat.online";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
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
  const [newTaskText, setNewTaskText] = useState("");
  const [theme, setTheme] = useState("light");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const themes = ["light", "dark", "gothic"];
  const themeIcons = { light: "☀️", dark: "🌙", gothic: "🦇" };
  const authHeaders = { Authorization: "Bearer " + token };

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const openSignIn = () => {
    setAuthMode("signin");
    setIsModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode("signup");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const switchMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  const handleAuth = async ({ username, password, mode }) => {
    try {
      if (mode === "signup") {
        await axios.post(`${API_URL}/register`, { username, password });
      }

      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });
      const nextToken = response.data.token;
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
      setAuthError("");
      showToast(mode === "signup" ? "Аккаунт создан! 🎉" : "Успешный вход! ✨");
      closeModal();
    } catch (err) {
      const message = err.response?.data?.error || "Ошибочка вышла!";
      setAuthError(message);
      showToast("Ошибка: " + message);
    }
  };

  const fetchWeek = async () => {
    const response = await axios.get(`${API_URL}/week`, {
      headers: authHeaders,
    });
    setWeek(response.data);
  };

  const addTask = async (day) => {
    const text = newTaskText.trim();
    if (!text) return;

    await axios.post(
      `${API_URL}/task`,
      { day, text },
      { headers: authHeaders },
    );
    await fetchWeek();
    setNewTaskText("");
    setActiveDay(null);
    showToast("Задача добавлена! 🐾");
  };

  const toggleTask = async (day, taskId) => {
    const task = week[day].find((item) => item.id === taskId);
    if (!task) return;

    await axios.put(
      `${API_URL}/task/${taskId}`,
      { completed: !task.completed },
      { headers: authHeaders },
    );
    await fetchWeek();
  };

  const deleteTask = async (day, taskId) => {
    await axios.delete(`${API_URL}/task/${taskId}`, {
      headers: authHeaders,
    });
    await fetchWeek();
    showToast("Задача удалена");
  };

  useEffect(() => {
    if (!token) return;
    fetchWeek();
  }, [token]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
    document.body.classList.toggle("gothic-theme", theme === "gothic");
  }, [theme]);

  if (!token) {
    return (
      <div className="App login-page">
        <div className="login-page__content">
          <h1>Plan Cat</h1>
          <p>Войдите или зарегистрируйтесь, чтобы начать</p>
          <div className="login-page__actions">
            <button className="login-page__button" onClick={openSignIn}>
              Войти
            </button>
            <button
              className="login-page__button login-page__button--filled"
              onClick={openSignUp}
            >
              Регистрация
            </button>
          </div>
        </div>
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

  return (
    <div
      className={`App ${theme === "dark" ? "dark-theme" : theme === "gothic" ? "gothic-theme" : ""}`}
    >
      <div className={`theme-toggle ${isThemeMenuOpen ? "theme-toggle--open" : ""}`}>
        <button
          type="button"
          className="theme-toggle__current"
          onClick={() => setIsThemeMenuOpen((open) => !open)}
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
              className={
                theme === themeName
                  ? "theme-toggle__button theme-toggle__button--active"
                  : "theme-toggle__button"
              }
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

      <Header showAuthActions={false} />

      <main>
        <div className="page-header">
          <p>Организуй свои дни легко и стильно с пушистым помощником 🐾</p>
        </div>
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
        {activeDay && (
          <div className="add-task-form">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                addTask(activeDay);
              }}
            >
              <input
                type="text"
                value={newTaskText}
                onChange={(event) => setNewTaskText(event.target.value)}
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
};

export default App;
