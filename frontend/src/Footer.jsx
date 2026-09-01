import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">⚔️ Task Planner</span>
                    <span className="footer-slogan">Сделай организацию дел приятнее</span>
                </div>
                <div className="footer-links">
                    <a href="https://github.com/Vin66613" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <a href="https://t.me/DaniilArsentev" target="_blank" rel="noopener noreferrer">
                        Telegram
                    </a>
                    <a href="mailto:daniilarsentev4056@mail.com">
                        Email
                    </a>
                </div>
                <div className="footer-copy">
                    © {new Date().getFullYear()} Все права защищены.
                </div>
            </div>
        </footer>
    );
};

export default Footer;