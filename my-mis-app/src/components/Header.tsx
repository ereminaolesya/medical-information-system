import './Header.css';
export default function Header() {
    return (
        <header className="header">
            <div className="logo">
                <svg></svg>
                <span>Try not to <br/><strong>DIE</strong></span>
            </div>
            <div className="actions">
                <div className="loginBtn">
                    Вход
                </div>
            </div>
        </header>
    )
}