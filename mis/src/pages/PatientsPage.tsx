import './css/PatientsPage.css';
import { useSearchParams } from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";

export function PatientsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const size = Number(searchParams.get('size')) || 5;

    const { data } = useQuery({
        queryKey: ['patients', page, size],
        queryFn: async () => {
            const response = await api.get(`/patient?page=${page}&size=${size}`);
            return response.data;
        }
    });

    const changePage = (newPage: number) => {
        setSearchParams({
            page: String(newPage),
            size: String(size)
        });
    };

    const totalPages = data?Math.ceil(data.pagination.count / data.pagination.size) : 1;
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 5 - 1);
    if (end - start < 5 - 1) {
        start = Math.max(1, end - 5 + 1);
    }
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    type Patient = {
        id: string
        name: string
        email: string
        gender: string
        birthday: string
    }

    return (
        <div className="patients">
            <div className="patients-header">
                <h2>Пациенты</h2>
                <div>

                    <button>Регистрация нового пациента</button>
                </div>
            </div>
            <div className="patients-filters">
                <h3>Фильтры и сортировка</h3>
                <div className="patients-filters-row1">
                    <div className="patients-filters-cell">
                        <label>Имя</label>
                        <input className="" placeholder="Иванов Иван Иванович"></input>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Имеющиеся заключения</label>
                        <select className=""></select>
                    </div>
                </div>
                <div className="patients-filters-row">
                    <div className="patients-filters-switch">
                        <label className="switch">
                            <input type="checkbox"></input>
                            <span className="slider"></span>
                        </label>
                        <span>Есть запланированные визиты</span>
                    </div>
                    <div className="patients-filters-switch">
                        <label className="switch">
                            <input type="checkbox"></input>
                            <span className="slider"></span>
                        </label>
                        <span>Мои пациенты</span>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Сортировка пациентов</label>
                        <select></select>
                    </div>
                </div>
                <div className="patients-filters-row">
                    <div className="patients-filters-cell">
                        <label>Число пациентов на странице</label>
                        <select></select>
                    </div>
                    <div className="patients-filters-searchButton">
                        <button className="searchButton">Поиск</button>
                    </div>
                </div>
            </div>
            <div className="patients-list">
                {data?.patients.map((item: Patient) => (
                <div className="patient" key={item.id}>
                    <strong >{item.name}</strong>
                    <span><span className="patientText">Email — </span>{item.email}</span>
                    <span><span className="patientText">Пол — </span>{item.gender}</span>
                    <span><span className="patientText">Дата рождения — </span>{new Date(item.birthday).toLocaleDateString()}</span>
                </div>
                ))}
            </div>
            <div className="pages">
                <button className="buttonsPage" onClick={() => changePage(page - 1)}>&lt;</button>
                {pages.map((p) => (<button className="buttonsPage" key={p} onClick={() => changePage(p)}>{p}</button>))}
                <button className="buttonsPage" onClick={() => changePage(page + 1)}>&gt;</button>
            </div>
        </div>
    )
}