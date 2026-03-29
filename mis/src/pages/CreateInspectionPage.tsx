import './css/CreateInspectionPage.css';
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useParams} from "react-router-dom";

const regSchema = z.object({
    date: z.string().datetime(),
    anamnesis: z.string(),
    complaints: z.string(),
    treatment: z.string(),
    conclusion: z.enum(['Disease', 'Recovery', 'Death']),
    nextVisitDate: z.string().optional(),
    deathDate: z.string().optional(),
    previousInspectionId: z.string(),
    diagnoses: z.array(
        z.object({
            icdDiagnosisId: z.string(),
            description: z.string(),
            type: z.enum(['Main', 'Concomitant', 'Complication'])
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
    .refine((data) => new Date(data.date) <= new Date(), {message: "date earlier"})
    .refine((data) => {
        return data.diagnoses.filter(d => d.type === 'Main').length === 1;
    }, {message: "one main diagnoses"})
    .refine((data) => {
        return !(data.conclusion === 'Disease' && !data.nextVisitDate);
    }, {message: "nextVisitDate"})
    .refine((data) => {
        return !(data.conclusion === 'Death' && !data.deathDate);
    }, {message: "deathDate"});

type FormData = z.infer<typeof regSchema>;
export function CreateInspectionPage() {

    const {
        register,
        handleSubmit,
        watch,
        // formState: { errors },
        control,
    } = useForm<FormData>({
        resolver: zodResolver(regSchema),
        defaultValues: {
            diagnoses: [],
            consultations: []
        }
    });

    const { id } = useParams();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const newData = {
                ...data,
                date: new Date(data.date).toISOString()
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

    const {
        fields: diagnosis,
        append: addDiagnose
    } = useFieldArray({
        control,
        name: "diagnoses"
    });
    const {
        fields: consultations,
        append: addConsultation
    } = useFieldArray({
        control,
        name: "consultations"
    });

    return (
        <form className="patient-card" onSubmit={handleSubmit(onSubmit)}>
            <div className="patient-header">
                <h1>Создание осмотра</h1>
            </div>
            <div className="patient-info">
                <div className="patient-info-header">
                    <div className="patient-name">
                        <h2>name</h2>
                        <span>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="14" r="6" stroke="blue" stroke-width="2" fill="none"/>
                                <line x1="15" y1="9" x2="22" y2="2" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                                <line x1="17" y1="2" x2="22" y2="2" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                                <line x1="22" y1="2" x2="22" y2="7" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                            </svg><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="9" r="6" stroke="blue" stroke-width="2" fill="none"/>
                                <line x1="12" y1="15" x2="12" y2="23" stroke="blue" stroke-width="2"/>
                                <line x1="8" y1="19" x2="16" y2="19" stroke="blue" stroke-width="2"/>
                            </svg></span>
                    </div>
                    <span>Дата рождения: date</span>
                </div>
                <div className="insp-info">
                    <div>перв/повторн</div>
                    <div className="inspDate">
                        <label>Дата осмотра</label>
                        <input type="datetime-local" {...register('date')}></input>
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
            {consultations.map((field, index) => (
            <div className="patient-info" key={field.id}>
                <h3>Консультация</h3>
                <div className="insp-filter">
                    <div className="insp-switch">
                        <label className="iSwitch">
                            <input type="checkbox"></input>
                            <span className="iSlider"></span>
                        </label>
                        <span>Требуется консультация</span>
                    </div>
                    <select {...register(`consultations.${index}.specialityId`)}>
                        <option>Специализация консультанта</option>
                    </select>
                </div>
                <div className="insp-comment">
                    <label>Комментарий</label>
                    <input type="text" className="inspInput" {...register(`consultations.${index}.comment.content`)}></input>
                </div>
                <button onClick={() => addConsultation({specialityId: "", comment: { content: "" }})}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="white" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg> Добавить консультацию</button>
            </div>))}

                <div className="patient-info">
                <h3>Диагнозы</h3>
                {diagnosis.map((field, index) => (
                <>
                <div className="insp-diseases" key={field.id}>
                    <label>Болезни</label>
                    <select {...register(`diagnoses.${index}.icdDiagnosisId`)}>
                        <option>a</option>
                    </select>
                    <input type="text" {...register(`diagnoses.${index}.description`)}></input>
                </div>
                <div>
                    <label>Тип диагноза в осмотре</label>
                    <div className="radious">
                        <div className="insp-filters-radio">
                            <label className="iRadio">
                                <input type="checkbox"></input>
                                <span className="radio-made-insp"></span>
                            </label>
                            <span>Основной</span>
                        </div>
                        <div className="insp-filters-radio">
                            <label className="iRadio">
                                <input type="checkbox"></input>
                                <span className="radio-made-insp"></span>
                            </label>
                            <span>Сопутствующий</span>
                        </div>
                        <div className="insp-filters-radio">
                            <label className="iRadio">
                                <input type="checkbox"></input>
                                <span className="radio-made-insp"></span>
                            </label>
                            <span>Осложнение</span>
                        </div>
                    </div>
                </div>
                </>))}
                <button onClick={() => addDiagnose({icdDiagnosisId: "", description: "", type: "Concomitant"})}>
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
                </div>
            </div>
            <div className="insp-btns">
                <button className="saveBtn" type="submit">Сохранить осмотр</button>
                <button className="cancelBtn">Отмена</button>
            </div>
        </form>
    )
}