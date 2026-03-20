import './css/PatientsPage.css';
import {Link, useSearchParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useState} from "react";
import {RegPatientModal} from "../components/RegPatientModal";
import z from 'zod';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const patientsSchema = z.object({
    name: z.string().optional(),
    conclusions: (z.enum(['Disease', 'Recovery', 'Death'])).optional().or(z.literal('')),
    sorting: z.enum(['NameAsc', 'NameDesc', 'CreateAsc', 'CreateDesc', 'InspectionAsc', 'InspectionDesc']).optional(),
    scheduledVisits: z.boolean().optional(),
    onlyMine: z.boolean().optional(),
    page: z.string(),
    size: z.string()
})
type FormData = z.infer<typeof patientsSchema>;

export function PatientsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        register,
        handleSubmit
    } = useForm<FormData>({
        resolver: zodResolver(patientsSchema),
        defaultValues: {
            scheduledVisits: false,
            onlyMine: false,
            page: '1',
            size: '5'
        }
    });

    const { data } = useQuery({
        queryKey: ['patients', searchParams.toString()],
        queryFn: async () => {
            const response = await api.get(`/patient?${searchParams.toString()}`);
            return response.data;
        }
    });

    const onSubmit = (data: FormData) => {
        const parametrs = new URLSearchParams();
        if (data.name) {parametrs.set('name', data.name);}
        if (data.conclusions) {parametrs.set('conclusions', data.conclusions);}
        if (data.scheduledVisits) {parametrs.set('scheduledVisits', 'true');}
        if (data.onlyMine) {parametrs.set('onlyMine', 'true');}
        if (data.sorting) {parametrs.set('sorting', data.sorting);}
        if (data.size) {parametrs.set('size', String(data.size));}
        setSearchParams(parametrs);
    }

    const page = Number(searchParams.get('page')) || 1;
    const size = Number(searchParams.get('size')) || 5;

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
                        <input className="" placeholder="Иванов Иван Иванович" {...register("name")}></input>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Имеющиеся заключения</label>
                        <select className=""{...register("conclusions")}>
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
                            <input type="checkbox" {...register("scheduledVisits")}></input>
                            <span className="slider"></span>
                        </label>
                        <span>Есть запланированные визиты</span>
                    </div>
                    <div className="patients-filters-switch">
                        <label className="switch">
                            <input type="checkbox" {...register("onlyMine")}></input>
                            <span className="slider"></span>
                        </label>
                        <span>Мои пациенты</span>
                    </div>
                    <div className="patients-filters-cell">
                        <label>Сортировка пациентов</label>
                        <select {...register("sorting")}>
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
                        <select {...register("size")}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <div className="patients-filters-searchButton">
                        <button className="searchButton" onClick={handleSubmit(onSubmit)}>Поиск</button>
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