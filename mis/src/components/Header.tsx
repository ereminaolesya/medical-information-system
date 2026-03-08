import './Header.css';
import {Link, useNavigate} from 'react-router-dom';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useState} from "react";
export default function Header() {

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();
    const { data: data } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get("/doctor/profile");
            return response.data;
        },
        enabled: !!token,
    });

    const logout = () => {
        localStorage.removeItem("token");
        queryClient.removeQueries({queryKey: ['profile']});
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="logo">
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5C27.9 5 10 22.9 10 45C10 54.4 13.2 63 18.7 69.8L18.7 85C18.7 90.5 23.2 95 28.7 95H71.2C76.8 95 81.2 90.5 81.2 85V69.8C86.7 63 90 54.4 90 45C90 22.9 72.1 5 50 5ZM50 12.5C68 12.5 82.5 27 82.5 45C82.5 52.3 80.1 59.1 75.9 64.5C74.6 66.2 73.7 68.3 73.7 70.5V87.5H26.2V70.5C26.2 68.3 25.4 66.2 24.1 64.5C19.9 59.1 17.5 52.3 17.5 45C17.5 27 32 12.5 50 12.5Z" fill="currentColor"/>
                    <circle cx="32.5" cy="47.5" r="10" stroke="white" stroke-width="6"/>
                    <circle cx="67.5" cy="47.5" r="10" stroke="white" stroke-width="6"/>
                    <path d="M50 63L42 72H58L50 63Z" fill="white"/>
                    <rect x="36" y="80" width="6" height="15" rx="3" fill="white"/>
                    <rect x="47" y="80" width="6" height="15" rx="3" fill="white"/>
                    <rect x="58" y="80" width="6" height="15" rx="3" fill="white"/>
                </svg>
                <span>Try not to <br/><strong>DIE</strong></span>
                {data && (
                    <div className="actionsLogin">
                        <Link to="/patients" className="actionsVar">Пациенты</Link>
                        <Link to="/consultations" className="actionsVar">Консультации</Link>
                        <Link to="/reports" className="actionsVar">Отчеты и статистика</Link>
                    </div>
                )
                }
            </div>
            <div className="actions">
                {!data ? (
                    <Link to="/login" className="loginBtn">
                    Вход
                    </Link>) : (
                        data && (
                        <div className="dropdown-menu">
                            <div className="dropdown" onClick={() => setOpen(!open)}>
                                <div className="profName">{data.name}</div> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9 L12 15 L18 9"
                                      stroke="white"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"/>
                            </svg>
                            </div>
                            {open && (
                            <div className="dropdown-content">
                                <Link to="/profile" className="profile">Профиль</Link>
                                <button onClick={logout} className="logoutBtn">Выход</button>
                            </div>)}
                        </div>
                    )
                )}
            </div>
        </header>
    )
}