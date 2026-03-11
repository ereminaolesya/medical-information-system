import './RegPatientModal.css'
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import {api} from "../api/axios.ts";

const regPatientSchema = z.object({
    name: z.string(),
    birthday: z.string(),
    gender: z.enum(['Male', 'Female']),
});
type FormData = z.infer<typeof regPatientSchema>;

export function RegPatientModal() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(regPatientSchema),
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const newData = {
                ...data,
                birthday: new Date(data.birthday).toISOString()
            };

            return await api.post("/patient", newData);
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

    return (
        <div className="modal-overlay">
            <section className="modal">
                <form className="modal-inner-container" onSubmit={handleSubmit(onSubmit)}>
                    <h2>Регистрация пациента</h2>
                    <div className="form-input">
                        <label>ФИО</label>
                        <input type="text" placeholder="Иванов Иван Иванович" {...register("name")}></input>
                        {errors.name && <span className="error-message">{errors.name.message as string}</span>}
                    </div>
                    <div className="form-input-row">
                        <div className="form-input">
                            <label>Пол</label>
                            <select defaultValue="Male" {...register("gender")}>
                                <option value="Male">Мужской</option>
                                <option value="Female">Женский</option>
                            </select>
                        </div>
                        <div className="form-input">
                            <label>Дата рождения</label>
                            <input type="date" {...register("birthday")}/>
                        </div>
                    </div>
                    <button className="reg-pat-btn" type="submit">Зарегистрировать</button>
                </form>
            </section>
        </div>

    )
}