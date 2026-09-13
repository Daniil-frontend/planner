import { useEffect } from 'react';
import './Toast.scss';

const Toast = ({ message, isVisible, onClose }) => {
    // Автоматически скрываем через 3 секунды
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <div className={`toast ${isVisible ? 'toast--visible' : ''}`}>
            {message}
        </div>
    );
};

export default Toast;