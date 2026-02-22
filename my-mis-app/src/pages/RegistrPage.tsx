import './RegistrPage.css';
export function RegistrPage() {

    return (
        <div className="reg-page">
            <form className="reg-form">
                <h2>Регистрация</h2>
                <div className="form-input">
                    <label>Имя</label>
                    <input type="text" placeholder="Иванов Иван Иванович"></input>
                </div>
                <div className="form-input-row">
                    <div className="form-input">
                        <label>Пол</label>
                        <select defaultValue="male">
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div className="form-input">
                        <label>Дата рождения</label>
                        <input type="date" />
                    </div>
                </div>
                <div className="form-input">
                    <label>Телефон</label>
                    <input type="tel" placeholder="+7 (ххх) ххх хх-хх"></input>
                </div>
                <div className="form-input">
                    <label>Специальность</label>
                    <select defaultValue="doctor">
                        <option value="doctor">Акушер-гинеколог</option>
                    </select>
                </div>
                <div className="form-input">
                    <label>Email</label>
                    <input type="email" placeholder="name@example.com"></input>
                </div>
                <div className="form-input">
                    <label>Пароль</label>
                    <input type="password"></input>
                </div>
                <button className="login-btn" onClick={() => {}}>Зарегистрироваться</button>
            </form>
        </div>
    )
}