import './Header.scss';
import logo from '../../public/logo-autumn.jpg'

const Header = ({ onSignIn, onSignUp, showAuthActions = true }) => {
    return (
        <header className="header">
            <div className="header__inner">
                <div className="header__logo">
                    <div className="header__logo-circle">
                            <img
                            src='/logo-autumn.jpg'
                            alt='PlanCat'
                            className='header__logo-image'
                            />
                    </div>
                </div>

                <h1 className="header__title">PLAN CAT</h1>

                {showAuthActions && (
                    <div className="header__actions">
                        <button className="header__btn" onClick={onSignIn}>
                            Войти
                        </button>
                        <button className="header__btn header__btn--filled" onClick={onSignUp}>
                            Регистрация
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;