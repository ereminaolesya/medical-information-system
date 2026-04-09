// import './css/ConsultationsPage.css';
import z from "zod";
import {Link, useSearchParams} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useState} from "react";


const inspSchema = z.object({
    grouped: z.enum(['true', 'false']).optional(),
    icdRoots: z.string().optional(),
    page: z.string(),
    size: z.string()
})
type FormData = z.infer<typeof inspSchema>;
export function ConsultationsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        register,
        handleSubmit
    } = useForm<FormData>({
        resolver: zodResolver(inspSchema),
        mode: 'onChange',
        defaultValues: {
            page: '1',
            size: '5',
            grouped: 'false'
        }
    });

    const { data } = useQuery({
        queryKey: ['consultation', searchParams.toString()],
        queryFn: async () => {
            const response = await api.get(`/consultation?${searchParams.toString()}`);
            return response.data;
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
        if (data.grouped === 'true') {parametrs.set('grouped', 'true');}
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

    return (
        <div className="patient-card">
            <div className="patient-header">
                <h2>Консультации</h2>
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
                            <input type="radio" value="true" {...register('grouped')}></input>
                            <span className="radio-made"></span>
                        </label>
                        <span>Сгруппировать по <br/>повторным</span>
                    </div>
                    <div className="patient-filters-radio">
                        <label className="radio">
                            <input type="radio" value="false" {...register('grouped')}></input>
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
                {data?.inspections.map((item: any) =>
                    searchParams.get('grouped') === 'true' ? (<ChainList inspection={item} level={0} chainFull={[]} />) : (
                        <div className={`patient  ${item.conclusion === 'Death' ? 'death' : ''}`} key={item.id}>
                            <div className="patient-inspection-header">
                                <div className="patient-inspname">
                                    <div className="dataDiv"><span className="dataInspection">{new Date(item.date).toLocaleDateString()}</span></div>
                                    <strong>Амбулаторный осмотр</strong>
                                </div>
                                <div className="patient-buttons">
                                    <Link to={`/inspection/${item.id}`} className="buttonInpection"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>Детали осмотра</Link>
                                </div>
                            </div>
                            <span>Заключение: <span className="">{item.conclusion === "Death" ? "смерть" : item.conclusion === "Recovery" ? "выздоровление" : "болезнь"}</span></span>
                            <span>Основной диагноз: <strong>{item.diagnosis.name} ({item.diagnosis.code})</strong></span>
                            <span className="patientText">Медицинский работник: {item.doctor}</span>
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

function ChainList({inspection, level = 0, chainFull = []} : { inspection: any, level: number, chainFull: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data } = useQuery({
        queryKey: ['chain', inspection.id],
        queryFn: async () => {
            const res = await api.get(`/inspection/${inspection.id}/chain`);
            return res.data;
        },
        enabled: isOpen && level === 0
    });
    const currentChain = level === 0 ? data : chainFull;
    const nextInChain = currentChain?.find((item: any) => item.previousId === inspection.id);
    return (
        <div className="inspection-row-container" style={{ '--level': level } as React.CSSProperties}>
            {level > 0 && <div className="corner"></div>}
            <div className={`patient  ${inspection.conclusion === 'Death' ? 'death' : ''}`} key={inspection.id}>
                <div className="patient-inspection-header">
                    <div className="patient-inspname">
                        {inspection.hasNested && (
                            <button className="chainButton" onClick={() => setIsOpen(!isOpen)}>
                                {isOpen ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                               xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19" stroke="white" stroke-width="3"
                                              stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                           xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="3"
                                              stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>}
                            </button>
                        )}
                        <div className="dataDiv"><span className="dataInspection">{new Date(inspection.date).toLocaleDateString()}</span></div>
                        <strong>Амбулаторный осмотр</strong>
                    </div>
                    <div className="patient-buttons">
                        <Link to={`/inspection/${inspection.id}`} className="buttonInpection"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>Детали осмотра</Link>
                    </div>
                </div>
                <span>Заключение: <span className="">{inspection.conclusion === "Death" ? "смерть" : inspection.conclusion === "Recovery" ? "выздоровление" : "болезнь"}</span></span>
                <span>Основной диагноз: <strong>{inspection.diagnosis.name} ({inspection.diagnosis.code})</strong></span>
                <span className="patientText">Медицинский работник: {inspection.doctor}</span>
            </div>
            {isOpen && nextInChain && (
                <ChainList inspection={nextInChain} level={level + 1} chainFull={currentChain} />
            )}
        </div>
    );
}