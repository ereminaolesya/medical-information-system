import './css/CreateInspectionPage.css';
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Select from "react-select";

const regSchema = z.object({
    date: z.string(),
    anamnesis: z.string(),
    complaints: z.string(),
    treatment: z.string(),
    conclusion: z.enum(['Disease', 'Recovery', 'Death']),
    nextVisitDate: z.string().optional(),
    deathDate: z.string().optional(),
    previousInspectionId: z.string().optional(),
    diagnoses: z.array(
        z.object({
            icdDiagnosisId: z.string(),
            description: z.string(),
            type: z.enum(['Main', 'Concomitant', 'Complication']),

            code: z.string().optional(),
            name: z.string().optional()
        })
    ),
    consultations: z.array(
        z.object({
            specialityId: z.string(),
            comment: z.object({
                content: z.string()
            })
        })
    )
})
    .refine((data) => new Date(data.date) <= new Date(), {message: "date earlier", path: ["date"]})
    .refine((data) => {
        return data.diagnoses.filter(d => d.type === 'Main').length === 1;
    }, {message: "one main diagnoses", path: ["diagnoses"]})
    .refine((data) => {
        return !(data.conclusion === 'Disease' && !data.nextVisitDate);
    }, {message: "nextVisitDate", path: ["nextVisitDate"]})
    .refine((data) => {
        return !(data.conclusion === 'Death' && !data.deathDate);
    }, {message: "deathDate", path: ["deathDate"]})
    .refine((data) => {
        const specialtiest = data.consultations.map(c => c.specialityId);
        return specialtiest.length === new Set(specialtiest).size;
    }, {message: "double specialties"})
    .refine((data) => {
        return data.consultations.every(c => c.comment.content);
    }, {message: "need comment", path: ["consultations"]});


type FormData = z.infer<typeof regSchema> & {
    newIcdDiagnosisId?: string;
    newDescription?: string;
    newType?: 'Main' | 'Concomitant' | 'Complication';

    newSpecialityId?: string;
    newComment?: string;
    consultRequired?: boolean;

};
export function CreateInspectionPage() {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        control,
        getValues,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(regSchema),
        defaultValues: {
            diagnoses: [],
            consultations: [],
            newType: "Main"
        }
    });

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const prev = searchParams.get("prev");

    const [isRepeat, setIsRepeat] = useState(!!prev);

    useEffect(() => {
        if (prev) {
            setValue("previousInspectionId", prev);
            setIsRepeat(true);
        }
    }, [prev]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const newData = {
                ...data,
                date: new Date(data.date).toISOString(),
                nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate).toISOString() : null,
                deathDate: data.deathDate ? new Date(data.deathDate).toISOString() : null
            };

            return await api.post(`/patient/${id}/inspections`, newData);
        },
        onSuccess: (data) => {
            console.log("Успешная регистрация:", data);
            alert('Регистрация успешна!');
        },
        onError: (error: any) => {
            console.log("Ошибка регистрации", error.response?.data);
            alert('Регистрация неуспешна!');
        },
    });

    const onSubmit = (data: FormData) => {
        mutation.mutate(data);
    };

    const conclusion = watch("conclusion");

    const { data } = useQuery({
        queryKey: ["previousInspections", id],
        queryFn: async () => {
            const res = await api.get(`/patient/${id}/inspections/search`);
            return res.data;
        }
    });

    const { data: patient } = useQuery({
        queryKey: ["patient", id],
        queryFn: async () => {
            const res = await api.get(`/patient/${id}`);
            return res.data;
        },
    });

    const { data: specialties } = useQuery({
        queryKey: ['specialties'],
        queryFn: async () => {
            const response = await api.get("/dictionary/speciality?page=1&size=100");
            return response.data.specialties;
        },
    });

    const [search, setSearch] = useState("");
    const { data: icd } = useQuery({
        queryKey: ['icd', search],
        queryFn: async () => {
            const res = await api.get("/dictionary/icd10",{
                params: {
                    request: search,
                    page: 1,
                    size: 10
                }
            });
            return res.data.records;
        }
    });
    const icdOptions = icd?.map((item: any) => ({
        value: item.id,
        label: `${item.code} - ${item.name}`
    }));

    //diag
    const {
        fields: diagnosArray,
        append: appendDiagnoses
    } = useFieldArray({
        control,
        name: "diagnoses"
    })

    const hanAddDiagnoses = () => {
        const diagIcd = getValues("newIcdDiagnosisId");
        const diagDescr = getValues("newDescription");
        const diagType = getValues("newType");
        const selectedIcd = icd?.find((item: any) => item.id === diagIcd);

        if (!diagIcd || !diagDescr || !diagType || !selectedIcd) {return;}
        if(diagType === "Main") {
            const existing = getValues("diagnoses");
            if (existing.some(d => d.type === "Main")) {return; }
        }

        appendDiagnoses({
            icdDiagnosisId: diagIcd,
            description: diagDescr,
            type: diagType,
            code: selectedIcd.code,
            name: selectedIcd.name,
        });

        setValue("newIcdDiagnosisId", "");
        setValue("newDescription", "");
        setValue("newType", "Main");
    }

//consult
    const {
        append: appendConsultations
    } = useFieldArray({
        control,
        name: "consultations"
    })
    const hanAddConsultations = () => {
        const consultSpec = getValues("newSpecialityId");
        const consultComment = getValues("newComment");

        if (!consultComment) {return; }
        const existing = getValues("consultations");
        if(existing.some(c => c.specialityId === consultSpec)) {return;}

        appendConsultations({
            specialityId: consultSpec,
            comment: { content: consultComment }
        });

        setValue("newSpecialityId", "");
        setValue("newComment", "");
    }

    const navigate = useNavigate();

    return (
        <form className="patient-card" onSubmit={handleSubmit(onSubmit)}>
            <div className="patient-header">
                <h1>Создание осмотра</h1>
            </div>
            <div className="patient-info">
                <div className="patient-info-header">
                    <div className="patient-name">
                        <h2>{patient?.name}</h2>
                        <span>{patient?.gender === "Male" ? <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    <span>Дата рождения: {new Date(patient?.birthday).toLocaleDateString()}</span>
                </div>
                <div className="insp-info">
                    <div className="insp-switch">
                        <span>Первичный осмотр</span>
                        <label className="iSwitch">
                            <input type="checkbox" checked={isRepeat} onChange={(e)=>setIsRepeat(e.target.checked)}></input>
                            <span className="iSlider first"></span>
                        </label>
                        <span>Повторный осмотр</span>
                    </div>
                    {isRepeat &&(
                    <div className="previousInspections">
                        <label>Предыдущий осмотр</label>
                        <select {...register("previousInspectionId")}>
                            <option value=''>Выберите осмотр</option>
                            {data?.map((item: any) =>
                            <option key={item.id} value={item.id}>
                                {new Date(item.date).toLocaleDateString()} {item.diagnosis.code} - {item.diagnosis.name}
                            </option>)}
                        </select>
                    </div>)}
                    <div className="inspDate">
                        <label>Дата осмотра</label>
                        <input type="datetime-local" {...register('date')}></input>
                        {errors.date && <p className="error">{errors.date.message}</p>}
                    </div>

                </div>
            </div>
            <div className="patient-info">
                <h3>Жалобы</h3>
                <input type="text" className="inspInput" {...register('complaints')}></input>
            </div>
            <div className="patient-info">
                <h3>Анамнез заболевания</h3>
                <input type="text" className="inspInput" {...register('anamnesis')}></input>
            </div>

            <div className="patient-info">
                <h3>Консультация</h3>
                <div>
                    <div className="insp-filter">
                        <div className="insp-switch">
                            <label className="iSwitch">
                                <input type="checkbox" {...register("consultRequired")}></input>
                                <span className="iSlider"></span>
                            </label>
                            <span>Требуется консультация</span>
                        </div>
                        {watch("consultRequired") && (<select {...register("newSpecialityId")}>
                            <option>Специализация консультанта</option>
                            {specialties?.map((spec: any) => (
                                <option key={spec.id} value={spec.id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>)}
                    </div>
                    {watch("consultRequired") && (<div className="insp-comment">
                        <label>Комментарий</label>
                        <input type="text" className="inspInput" {...register("newComment")}></input>
                    </div>)}
                </div>
                {errors.consultations && <p className="error">{errors.consultations.message}</p>}
                {watch("consultRequired") && (<button type="button" onClick={hanAddConsultations}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="white" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg> Добавить консультацию</button>)}
            </div>

                <div className="patient-info">
                <h3>Диагнозы</h3>
                    {diagnosArray.map((item) => (
                        <div className="diagnosesInfo" key={item.id}>
                            <strong>{item.code} - {item.name}</strong>
                            <div><p>Тип в осмотре: {item.type === 'Main' ? "Основной" : item.type === 'Concomitant' ? "Сопутствующий" : "Осложнение"}</p>
                                <p>Расшифровка: {item.description}</p></div>
                        </div>)
                    )}
                    <div>
                        <div className="insp-diseases">
                            <label>Болезни</label>
                            <Select options={icdOptions}
                                    value={icdOptions?.find(o => o.value === getValues("newIcdDiagnosisId"))}
                            onChange={(selected) => setValue("newIcdDiagnosisId", selected.value || "")}
                            onInputChange={(input, meta) => { if (meta.action === "input-change") {setSearch(input)}}}
                            />
                            <input type="text" {...register("newDescription")}></input>
                        </div>
                        <div>
                            <label>Тип диагноза в осмотре</label>
                            <div className="radious">
                                <div className="insp-filters-radio">
                                    <label className="iRadio">
                                        <input type="radio" value="Main" {...register("newType")}></input>
                                        <span className="radio-made-insp"></span>
                                    </label>
                                    <span>Основной</span>
                        </div>
                        <div className="insp-filters-radio">
                            <label className="iRadio">
                                <input type="radio" value="Concomitant" {...register("newType")}></input>
                                <span className="radio-made-insp"></span>
                            </label>
                            <span>Сопутствующий</span>
                        </div>
                        <div className="insp-filters-radio">
                            <label className="iRadio">
                                <input type="radio" value="Complication" {...register("newType")}></input>
                                <span className="radio-made-insp"></span>
                            </label>
                            <span>Осложнение</span>
                        </div>
                    </div>
                </div>
                </div>
                    {errors.diagnoses && <p className="error">{errors.diagnoses.message}</p>}
                <button type="button" onClick={hanAddDiagnoses}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="white" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg> Добавить диагноз</button>
            </div>
            <div className="patient-info">
                <h3>Рекомендации по лечению</h3>
                <input type="text" className="inspInput" {...register('treatment')}></input>
            </div>
            <div className="patient-info">
                <h3>Заключение</h3>
                <div className="conclusion">
                    <div className="conclusion-column">
                        <label>Заключение</label>
                        <select {...register('conclusion')}>
                            <option value="Disease">Болезнь</option>
                            <option value="Recovery">Выздоровление</option>
                            <option value="Death">Смерть</option>
                        </select>
                    </div>
                    <div className="conclusion-column">
                        {conclusion === "Disease" && (
                            <>
                                <label>Дата следующего визита</label>
                                <input type="datetime-local" {...register("nextVisitDate")} />
                            </>
                        )}

                        {conclusion === "Death" && (
                            <>
                                <label>Дата смерти</label>
                                <input type="datetime-local" {...register("deathDate")} />
                            </>
                        )}
                    </div>
                    {errors.conclusion && <p className="error">{errors.conclusion.message}</p>}
                </div>
            </div>
            <div className="insp-btns">
                <button className="saveBtn" type="submit">Сохранить осмотр</button>
                <button className="cancelBtn" type="button" onClick={() => navigate(`/patient/${id}`)}>Отмена</button>
            </div>
        </form>
    )
}