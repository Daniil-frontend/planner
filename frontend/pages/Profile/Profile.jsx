import { useEffect, useState } from "react";
import api from "../../utils/api";

const Profile = ({ onBack, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/me");
        setProfile(response.data);
        setForm((current) => ({
          ...current,
          username: response.data.username || "",
        }));
      } catch (err) {
        setError(err.response?.data?.error || "Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.username.trim()) {
      setError("Логин не может быть пустым");
      return;
    }

    if (form.newPassword && !form.currentPassword) {
      setError("Введите текущий пароль");
      return;
    }

    try {
      setSaving(true);
      const response = await api.put("/me", {
        username: form.username.trim(),
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setProfile(response.data);
      setForm((current) => ({
        ...current,
        username: response.data.username,
        currentPassword: "",
        newPassword: "",
      }));
      setIsEditing(false);
      setSuccess("Профиль обновлён");
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось сохранить профиль");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="profile-page">Загрузка профиля...</main>;
  }

  if (!profile) {
    return (
      <main className="profile-page">
        <p className="error">{error || "Профиль не найден"}</p>
        <button type="button" onClick={onBack}>Вернуться к планеру</button>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card">
        <button type="button" onClick={onBack}>← К планеру</button>
        <h2>Личный кабинет</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {!isEditing ? (
          <>
            <div className="profile-row">
              <span>Логин:</span>
              <strong>{profile.username}</strong>
            </div>
            <div className="profile-actions">
              <button type="button" onClick={() => setIsEditing(true)}>
                Изменить профиль
              </button>
              <button type="button" onClick={onLogout} className="danger">
                Выйти
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="profile-username">Логин</label>
              <input
                id="profile-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label htmlFor="profile-current-password">Текущий пароль</label>
              <input
                id="profile-current-password"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label htmlFor="profile-new-password">Новый пароль</label>
              <input
                id="profile-new-password"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            <div className="profile-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="secondary"
                disabled={saving}
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default Profile;
