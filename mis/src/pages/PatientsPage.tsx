import './css/PatientsPage.css';
import { useSearchParams } from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";

export function PatientsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const name = searchParams.get('name') || '';
    const conclusions = searchParams.getAll('conclusions');
    const sorting = searchParams.get('sorting') || '';
    const scheduledVisits = searchParams.get('scheduledVisits') === 'true';
    const onlyMine = searchParams.get('onlyMine') === 'true';
    const page = Number(searchParams.get('page')) || 1;
    const size = Number(searchParams.get('size')) || 5;

    const { data } = useQuery({
        queryKey: ['patients', name, conclusions, scheduledVisits, onlyMine, sorting, page, size],
        queryFn: async () => {
            const parametrs = new URLSearchParams();
            parametrs.set('name', name);
            conclusions.forEach(conclusions => parametrs.append('conclusions', conclusions));
            parametrs.set('sorting', sorting);
            if (scheduledVisits) {parametrs.set('scheduledVisits', 'true')}
            if (onlyMine) {parametrs.set('onlyMine', 'true')}
            parametrs.set('page', String(page));
            parametrs.set('size', String(size));
            const response = await api.get(`/patient?${parametrs.toString()}`);
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
                        <input className="" placeholder="Иванов Иван Иванович" value={name} onChange={(e) =>
                        {const parametrs = new URLSearchParams(searchParams);
                            parametrs.set('name', e.target.value);
                            setSearchParams(parametrs);
                        }}></input>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Имеющиеся заключения</label>
                        <select className="" onChange={(e) =>
                        {const parametrs = new URLSearchParams(searchParams);
                            parametrs.delete('conclusions');
                            parametrs.append('conclusions', e.target.value);
                            setSearchParams(parametrs);
                        }}>
                            <option value="">Выберите заключение</option>
                            <option value="Disease">Болезнь</option>
                            <option value="Recovery">Выздоровление</option>
                            <option value="Death">Смерть</option>
                        </select>
                    </div>
                </div>
                <div className="patients-filters-row">
                    <div className="patients-filters-switch">
                        <label className="switch">
                            <input type="checkbox" onChange={(e) =>
                            {const parametrs = new URLSearchParams(searchParams);
                                if (e.target.checked) {parametrs.set('scheduledVisits', 'true');}
                                else {parametrs.set('scheduledVisits', 'false');}
                                setSearchParams(parametrs);
                            }}></input>
                            <span className="slider"></span>
                        </label>
                        <span>Есть запланированные визиты</span>
                    </div>
                    <div className="patients-filters-switch">
                        <label className="switch">
                            <input type="checkbox" onChange={(e) =>
                            {const parametrs = new URLSearchParams(searchParams);
                                if (e.target.checked) {parametrs.set('onlyMine', 'true');}
                                else {parametrs.set('onlyMine', 'false');}
                                setSearchParams(parametrs);
                            }}></input>
                            <span className="slider"></span>
                        </label>
                        <span>Мои пациенты</span>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Сортировка пациентов</label>
                        <select onChange={(e) => {
                            const parametrs = new URLSearchParams(searchParams);
                            parametrs.set('sorting', e.target.value);
                            setSearchParams(parametrs);
                        }}>
                            <option value="NameAsc">По имени (А-Я)</option>
                            <option value="NameDesc">По имени (Я-А)</option>
                            <option value="CreateAsc">Сначала старые</option>
                            <option value="CreateDesc">Сначала новые</option>
                            <option value="InspectionAsc">Сначала старые осмотры</option>
                            <option value="InspectionDesc">Сначала новые осмотры</option>
                        </select>
                    </div>
                </div>
                <div className="patients-filters-row">
                    <div className="patients-filters-cell">
                        <label>Число пациентов на странице</label>
                        <select onChange={(e) => {
                            const parametrs = new URLSearchParams(searchParams);
                            parametrs.set('size', e.target.value);
                            setSearchParams(parametrs);
                        }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
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