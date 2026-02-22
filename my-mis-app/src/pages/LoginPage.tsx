import './LoginPage.css';
export function LoginPage() {

    return (
        <div className="login-page">
            <form className="login-form">
                <h2>Вход</h2>
                <div className="form-input">
                    <label>Email</label>
                    <input type="email" placeholder="name@example.com"></input>
                </div>
                <div className="form-input">
                    <label>Пароль</label>
                    <input type="password"></input>
                </div>
                <button className="login-btn" onClick={() => {}}>Войти</button>
                <button className="reg-btn" onClick={() => {}}>Регистрация</button>
            </form>
        </div>
    )
}