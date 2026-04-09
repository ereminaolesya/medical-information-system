import './EditInspectionModal.css'
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import Select from "react-select";
import {useEffect, useState} from "react";

const regSchema = z.object({
    anamnesis: z.string(),
    complaints: z.string(),
    treatment: z.string(),
    conclusion: z.enum(['Disease', 'Recovery', 'Death']),
    nextVisitDate: z.string().optional(),
    deathDate: z.string().optional(),
    diagnoses: z.array(
        z.object({
            icdDiagnosisId: z.string(),
            description: z.string(),
            type: z.enum(['Main', 'Concomitant', 'Complication']),

            code: z.string().optional(),
            name: z.string().optional()
        })
    )
})
    .refine((data) => {
        return data.diagnoses.filter(d => d.type === 'Main').length === 1;
    }, {message: "one main diagnoses", path: ["diagnoses"]})
    .refine((data) => {
        return !(data.conclusion === 'Disease' && !data.nextVisitDate);
    }, {message: "nextVisitDate", path: ["nextVisitDate"]})
    .refine((data) => {
        return !(data.conclusion === 'Death' && !data.deathDate);
    }, {message: "deathDate", path: ["deathDate"]});


type FormData = z.infer<typeof regSchema> & {
    newIcdDiagnosisId?: string;
    newDescription?: string;
    newType?: 'Main' | 'Concomitant' | 'Complication';
};

type Props = {
    onClose: () => void;
    id: string;
}

export function EditInspectionModal({ onClose, id }: Props) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        control,
        getValues,
        setValue,
        reset
    } = useForm<FormData>({
        resolver: zodResolver(regSchema),
        defaultValues: {
            diagnoses: [],
            newType: "Main"
        }
    });

    const { data, /*isLoading*/ } = useQuery({
        queryKey: ['inspection', id],
        queryFn: async () => {
            const response = await api.get(`/inspection/${id}`);
            return response.data;
        }
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const newData = {
                ...data,
                nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate).toISOString() : null,
                deathDate: data.deathDate ? new Date(data.deathDate).toISOString() : null
            };
            return await api.put(`/inspection/${id}`, newData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['inspection', id]})
            console.log("Осмотр обновлен", data);
            alert('Осмотр обновлен!');
            onClose();
        },
        onError: (error: any) => {
            console.log("Осмотр не обновлен", error.response?.data);
            alert('Осмотр не обновлен!');
        },
    });

    useEffect(() => {
        if (!data) return;
        (async () => {
            const ids = await Promise.all(
                data.diagnoses.map(async (d) => {
                    const res = await api.get("/dictionary/icd10",{
                        params: {
                            request: d.code,
                            page: 1,
                            size: 1
                        }
                    });
                    return res.data.records[0].id;
                })
            );

            reset({
                anamnesis: data.anamnesis,
                complaints: data.complaints,
                treatment: data.treatment,
                conclusion: data.conclusion,
                nextVisitDate: data.nextVisitDate ? data.nextVisitDate.slice(0, 16) : '',
                deathDate: data.deathDate ? data.deathDate.slice(0, 16) : '',
                diagnoses: data.diagnoses.map((d, i) => ({
                    icdDiagnosisId: ids[i],
                    description: d.description,
                    type: d.type,

                    code: d.code,
                    name: d.name
                }))
            });
        })();

    }, [data, reset]);

    const onSubmit = (data: FormData) => {
        mutation.mutate(data);
    };

    const conclusion = watch("conclusion");

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


     return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal" onClick={(e) => e.stopPropagation()}>
                <form className="modal-inner-container-inspection" onSubmit={handleSubmit(onSubmit)}>
                    <h2>Редактирование осмотра</h2>
                    <div className="patient-info">
                        <h3>Жалобы</h3>
                        <input type="text" className="inspInput" {...register('complaints')}></input>
                    </div>
                    <div className="patient-info">
                        <h3>Анамнез заболевания</h3>
                        <input type="text" className="inspInput" {...register('anamnesis')}></input>
                    </div>
                    <div className="patient-info">
                        <h3>Рекомендации по лечению</h3>
                        <input type="text" className="inspInput" {...register('treatment')}></input>
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
                        <button className="cancelBtn" type="button" onClick={onClose}>Отмена</button>
                    </div>
                </form>
            </section>
        </div>

    )
}