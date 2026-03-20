import './css/PatientCardPage.css';
import z from "zod";
import {useParams, useSearchParams} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";


const inspSchema = z.object({
    grouped: z.boolean().optional(),
    icdRoots: z.string().optional(),
    page: z.string(),
    size: z.string()
})
type FormData = z.infer<typeof inspSchema>;
export function PatientCardPage() {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        register,
        handleSubmit
    } = useForm<FormData>({
        resolver: zodResolver(inspSchema),
        mode: 'onChange',
        defaultValues: {
            page: '1',
            size: '5'
        }
    });

    const { data } = useQuery({
        queryKey: ['inspections', id, searchParams.toString()],
        queryFn: async () => {
            const response = await api.get(`/patient/${id}/inspections?${searchParams.toString()}`);
            return response.data;
        }
    });
    const { data: patientData } = useQuery({
        queryKey: ['patient', id],
        queryFn: async () => {
            const patresponse = await api.get(`/patient/${id}`);
            return patresponse.data;
        }
    });
    const { data: icdData, isLoading } = useQuery({
        queryKey: ['icdRoots'],
        queryFn: async () => {
            const res = await api.get('/dictionary/icd10/roots');
            return res.data;
        }
    });

    const onSubmit = (data: FormData) => {
        const parametrs = new URLSearchParams();
        if (data.grouped) {parametrs.set('grouped', 'true');}
        if (data.icdRoots) {parametrs.append('icdRoots', data.icdRoots)}
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

    // @ts-ignore
    return (
        <div className="patient-card">
            <div className="patient-header">
                <h2>Медицинская карта пациента</h2>
                <div>
                    <button>Добавить осмотр</button>
                </div>
            </div>
            <div className="patient-info">
                <div className="patient-name">
                    <h3>{patientData?.name}</h3>
                    <span>{patientData?.gender === "Male" ? <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="14" r="6" stroke="blue" stroke-width="2" fill="none" />
                        <line x1="15" y1="9" x2="22" y2="2" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                        <line x1="17" y1="2" x2="22" y2="2" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                        <line x1="22" y1="2" x2="22" y2="7" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                    </svg> : <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="9" r="6" stroke="blue" stroke-width="2" fill="none" />
                        <line x1="12" y1="15" x2="12" y2="23" stroke="blue" stroke-width="2" />
                        <line x1="8" y1="19" x2="16" y2="19" stroke="blue" stroke-width="2" />
                    </svg>}</span>
                </div>
                <span>Дата рождения: {new Date(patientData?.birthday).toLocaleDateString()}</span>
            </div>
            <div className="patient-filters">
                <div className="patient-filters-row1">
                    <div className="patient-filters-cell">
                        <label>МКБ-10</label>
                        <select className="" {...register('icdRoots')}>
                            <option value="">Выбрать</option>
                            {isLoading && <option>Загрузка...</option>}
                            {icdData?.map((icd: any) => (
                                <option key={icd.id} value={icd.id}>
                                    {icd.code} - {icd.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="patient-filters-radio">
                        <label className="radio">
                            <input type="checkbox" {...register('grouped')}></input>
                            <span className="radio-made"></span>
                        </label>
                        <span>Сгруппировать по <br/>повторным</span>
                    </div>
                    <div className="patient-filters-radio">
                        <label className="radio">
                            <input type="checkbox"></input>
                            <span className="radio-made"></span>
                        </label>
                        <span>Показать все</span>
                    </div>
                </div>

                <div className="patients-filters-row">
                    <div className="patients-filters-cell">
                        <label>Число осмотров на странице</label>
                        <select {...register('size')}>
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
            <div className="patient-list">
                {data?.inspections.map((item: any) => (
                <div className="patient" key={item.id}>
                    <div className="patient-inspection-header">
                        <div className="patient-inspname">
                            <div className="dataDiv"><span className="dataInspection">{new Date(item.date).toLocaleDateString()}</span></div>
                            <strong>Амбулаторный осмотр</strong>
                        </div>
                        <div className="patient-buttons">
                            <button className="buttonInpection"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>Добавить осмотр</button>
                            <button className="buttonInpection"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>Детали осмотра</button>
                        </div>
                    </div>
                    <span>Заключение: <span className="">{item.conclusion}</span></span>
                    <span>Основной диагноз: <strong>{item.diagnosis.name} ({item.diagnosis.code})</strong></span>
                    <span className="patientText">Медицинский работник: {item.doctor}</span>
                </div>))}
            </div>
            <div className="pages">
                <button className="buttonsPage" onClick={() => changePage(page - 1)}>&lt;</button>
                {pages.map((p) => (<button className="buttonsPage" key={p} onClick={() => changePage(p)}>{p}</button>))}
                <button className="buttonsPage" onClick={() => changePage(page + 1)}>&gt;</button>
            </div>
        </div>
    )
}