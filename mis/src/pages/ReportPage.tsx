import './css/ReportPage.css';
import Select from "react-select";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Table from "react-bootstrap/Table";

const regSchema = z.object({
    start: z.string(),
    end: z.string(),
    icdRoots: z.array(z.string()).optional()
});
type FormData = z.infer<typeof regSchema>;
export function ReportPage() {

    const {
        register,
        handleSubmit,
        setValue,
        watch
    } = useForm<FormData>({
        resolver: zodResolver(regSchema),
        defaultValues: {
            icdRoots: []
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            const params = {
                start: new Date(data.start).toISOString(),
                end: new Date(data.end).toISOString(),
                icdRoots: data.icdRoots?.length ? data.icdRoots?.join(",") : []
            };

            return await api.get("/report/icdrootsreport", {params});
        },
        onSuccess: (data) => {
            setReport(data.data);
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

    const selectedIcd = watch("icdRoots");
    const { data: icdData, isLoading } = useQuery({
        queryKey: ['icdRoots'],
        queryFn: async () => {
            const res = await api.get('/dictionary/icd10/roots');
            return res.data;
        }
    });
    const icdOptions = icdData?.map((item: any) => ({
        value: item.id,
        label: `${item.code}`
    }));

    const [report, setReport] = useState<any>(null);

    return (
        <div className="patient-card">
            <form className="patient-info" onSubmit={handleSubmit(onSubmit)}>
                <h5>Статистика осмотров</h5>
                <div className="reportPage">
                    <div className="dateReport">
                        <label>Дата с</label>
                        <input type="date" {...register("start")}></input>
                    </div>
                    <div className="dateReport">
                        <label>Дата по</label>
                        <input type="date" {...register("end")}></input>
                    </div>
                    <div className="dateReport selectRoot">
                        <label>МКБ-10</label>
                        <Select
                            isMulti
                            options={icdOptions}
                            value={icdOptions?.filter(o => selectedIcd?.includes(o.value))}
                            isLoading={isLoading}
                            onChange={(selected) => setValue("icdRoots", selected ? selected.map((s: any) => s.value) : [])}
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                    </div>
                </div>
                <button type="submit">Сохранить сводку</button>
            </form>
            {report && (
                <Table striped bordered hover responsive>
                    <thead>
                    <tr>
                        <th>Пациент</th>
                        <th>Дата рождения</th>
                        <th>Пол</th>
                        {report.filters.icdRoots.map((item: any) => (
                            <th>{item}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {report.records.map((item: any) => (
                        <tr>
                            <td>{item.patientName}</td>
                            <td>{new Date(item.patientBirthdate).toLocaleDateString()}</td>
                            <td>{item.gender === 'Male' ? 'М' : 'Ж'}</td>
                            {report.filters.icdRoots.map((code: any) => (
                                <td>{item.visitsByRoot[code] || 0}</td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={3}><strong>Итого:</strong></td>
                        {report.filters.icdRoots.map((item: any) => (
                            <td>{report.summaryByRoot[item] || 0}</td>
                        ))}
                    </tr>
                    </tbody>
                </Table>
            )}

        </div>
    )
}