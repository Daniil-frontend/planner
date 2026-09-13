import './Footer.scss';

const Footer = () => {
return (
    <footer className="footer">
        <div className="footer__inner">

            <p className="footer__tagline">Сделай организацию дел приятнее</p>

            <div className="footer__links">
                <a
                    href="https://github.com/Daniil-frontend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__link"
                >
                    GITHUB
                </a>
                <a
                    href="https://t.me/planner_update"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__link"
                >
                    TELEGRAM
                </a>
                <a href="mailto:daniilarsentev@mail.com" className="footer__link">
                    EMAIL
                </a>
            </div>

            <div className="footer__copy">
                © 2026 Все права защищены. Plan Cat.
            </div>
        </div>
    </footer>
);
};

export default Footer;