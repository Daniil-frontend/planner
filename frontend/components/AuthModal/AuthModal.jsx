import { useState } from 'react';
import './AuthModal.scss';

const AuthModal = ({ isOpen, mode, onClose, onSwitchMode, onSubmit }) => {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

if (!isOpen) return null;

const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password, mode });
    setUsername('');
    setPassword('');
};

return (
    <div className="auth-modal" onClick={onClose}>
        <div className="auth-modal__window" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal__close" onClick={onClose}>
                ×
            </button>

            <h3 className="auth-modal__title">
                {mode === 'signin' ? 'Вход в Plan Cat' : 'Регистрация'}
            </h3>

            <form className="auth-modal__form" onSubmit={handleSubmit}>
                <div className="auth-modal__field">
                    <label className="auth-modal__label">
                        {mode === 'signup' ? 'Имя' : 'Логин'}
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={mode === 'signup' ? 'Кот Ученый' : 'cat@example.com'}
                        required
                    />
                </div>

                <div className="auth-modal__field">
                    <label className="auth-modal__label">Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="auth-modal__submit">
                    {mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
                </button>
            </form>

            <div className="auth-modal__switch">
                <p>
                    {mode === 'signin' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    <button onClick={onSwitchMode}>
                        {mode === 'signin' ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </p>
            </div>
        </div>
    </div>
);
};

export default AuthModal;