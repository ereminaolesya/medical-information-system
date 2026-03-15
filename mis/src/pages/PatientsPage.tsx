import './css/PatientsPage.css';
import {Link, useSearchParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useEffect, useState} from "react";
import {RegPatientModal} from "../components/RegPatientModal";

export function PatientsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const name = searchParams.get('name') || '';
    const conclusions = searchParams.getAll('conclusions');
    const sorting = searchParams.get('sorting') || '';
    const scheduledVisits = searchParams.get('scheduledVisits') === 'true';
    const onlyMine = searchParams.get('onlyMine') === 'true';
    const page = Number(searchParams.get('page')) || 1;
    const size = Number(searchParams.get('size')) || 5;

    const [formFilters, setFormFilters] = useState({
        name,
        conclusions: conclusions[0] || '',
        scheduledVisits,
        onlyMine,
        sorting,
        size
    });

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
        if (newPage > totalPages || newPage < 1) {return;}
        const parametrs = new URLSearchParams(searchParams);
        parametrs.set('page', String(newPage));
        parametrs.set('size', String(size));
        setSearchParams(parametrs);
    };


    const totalPages = data?.pagination.count;
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);
    if (end === totalPages) {
        start = Math.max(1, end - 4);
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

    useEffect(() => {
        setFormFilters({
            name,
            conclusions: conclusions[0] || '',
            scheduledVisits,
            onlyMine,
            sorting,
            size
        });
    }, [searchParams]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="patients">
            <div className="patients-header">
                <h2>Пациенты</h2>
                <div>
                    <button onClick={() => setIsModalOpen(true)}>Регистрация нового пациента</button>
                </div>
            </div>
            <div className="patients-filters">
                <h3>Фильтры и сортировка</h3>
                <div className="patients-filters-row1">
                    <div className="patients-filters-cell">
                        <label>Имя</label>
                        <input className="" placeholder="Иванов Иван Иванович" value={formFilters.name} onChange={(e) =>
                        {setFormFilters({...formFilters, name: e.target.value})
                        }}></input>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Имеющиеся заключения</label>
                        <select className="" value={formFilters.conclusions} onChange={(e) =>
                        {setFormFilters({...formFilters, conclusions: e.target.value})
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
                            <input type="checkbox" checked={formFilters.scheduledVisits} onChange={(e) =>
                            {setFormFilters({...formFilters, scheduledVisits: e.target.checked})
                            }}></input>
                            <span className="slider"></span>
                        </label>
                        <span>Есть запланированные визиты</span>
                    </div>
                    <div className="patients-filters-switch">
                        <label className="switch">
                            <input type="checkbox" checked={formFilters.onlyMine} onChange={(e) =>
                            {setFormFilters({...formFilters, onlyMine: e.target.checked})
                            }}></input>
                            <span className="slider"></span>
                        </label>
                        <span>Мои пациенты</span>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Сортировка пациентов</label>
                        <select value={formFilters.sorting} onChange={(e) => {
                            setFormFilters({...formFilters, sorting: e.target.value})
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
                        <select value={formFilters.size} onChange={(e) => {
                            setFormFilters({...formFilters, size: Number(e.target.value)});
                        }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <div className="patients-filters-searchButton">
                        <button className="searchButton" onClick={() => {
                            const parametrs = new URLSearchParams();
                            if (formFilters.name) {parametrs.set('name', formFilters.name);}
                            if (formFilters.conclusions) {parametrs.set('conclusions', formFilters.conclusions);}
                            if (formFilters.scheduledVisits) {parametrs.set('scheduledVisits', 'true');}
                            if (formFilters.onlyMine) {parametrs.set('onlyMine', 'true');}
                            if (formFilters.sorting) {parametrs.set('sorting', formFilters.sorting);}
                            if (formFilters.size) {parametrs.set('size', String(formFilters.size));}
                            setSearchParams(parametrs);
                        }}>Поиск</button>
                    </div>
                </div>
            </div>
            <div className="patients-list">
                {data?.patients.map((item: Patient) => (
                <Link to={`/patient/${item.id}`} className="patient" key={item.id}>
                    <strong >{item.name}</strong>
                    <span><span className="patientText">Email — </span>{item.email}</span>
                    <span><span className="patientText">Пол — </span>{item.gender === "Male" ? "Мужчина" : "Женщина"}</span>
                    <span><span className="patientText">Дата рождения — </span>{new Date(item.birthday).toLocaleDateString()}</span>
                </Link>
                ))}
            </div>
            <div className="pages">
                <button className="buttonsPage" onClick={() => changePage(page - 1)}>&lt;</button>
                {pages.map((p) => (<button className="buttonsPage" key={p} onClick={() => changePage(p)}>{p}</button>))}
                <button className="buttonsPage" onClick={() => changePage(page + 1)}>&gt;</button>
            </div>
            {isModalOpen && (<RegPatientModal onClose={() => setIsModalOpen(false)} />)}
        </div>
    )
}