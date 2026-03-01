import './RegistrPage.css';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {useMutation, useQuery} from "@tanstack/react-query";
import { api } from "../api/axios";

const regSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.string().email(),
    birthday: z.string(),
    gender: z.enum(['Male', 'Female']),
    phone: z
        .string()
        .regex(
            /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, "Телефон должен быть в формате +7 (ххх) ххх хх-хх"
        ),
    speciality: z.string().uuid()
});
type FormData = z.infer<typeof regSchema>;

export function RegistrPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(regSchema),
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const newData = {
                ...data,
                birthday: new Date(data.birthday).toISOString()
            };

            return await api.post("/doctor/register", newData);
        },
        onSuccess: (data) => {
            const token = data.data.token;
            console.log("Успешная регистрация:", data);
            alert('Регистрация успешна!');
            localStorage.setItem("token", token);
        },
        onError: (error: any) => {
            console.log("Ошибка регистрации", error.response?.data);
            alert('Регистрация неуспешна!');
        },
    });

    const onSubmit = (data: FormData) => {
        mutation.mutate(data);
    };

    const { data: specialties, isLoading } = useQuery({
        queryKey: ['specialties'],
        queryFn: async () => {
            const response = await api.get("/dictionary/speciality?page=1&size=100");
            return response.data.specialties;
        },
    });

    return (
        <div className="reg-page">
            <form className="reg-form" onSubmit={handleSubmit(onSubmit)}>
                <h2>Регистрация</h2>
                <div className="form-input">
                    <label>Имя</label>
                    <input type="text" placeholder="Иванов Иван Иванович" {...register("name")}></input>
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
                <div className="form-input">
                    <label>Телефон</label>
                    <input type="tel" placeholder="+7 (ххх) ххх хх-хх" {...register("phone")}></input>
                    {errors.phone && <span className="error-message">{errors.phone.message as string}</span>}
                </div>
                <div className="form-input">
                    <label>Специальность</label>
                    <select {...register("speciality")}>
                        <option value="" disabled>Выберите специальность</option>

                        {isLoading && <option>Загрузка...</option>}

                        {specialties?.map((spec: any) => (
                            <option key={spec.id} value={spec.id}>
                                {spec.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-input">
                    <label>Email</label>
                    <input type="email" placeholder="name@example.com" {...register("email")}></input>
                </div>
                <div className="form-input">
                    <label>Пароль</label>
                    <input type="password" {...register("password")}></input>
                </div>
                <button className="login-btn" type="submit">Зарегистрироваться</button>
            </form>
        </div>
    )
}