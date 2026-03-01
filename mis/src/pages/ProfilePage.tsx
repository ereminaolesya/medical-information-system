import './ProfilePage.css';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {useMutation, useQuery} from "@tanstack/react-query";
import { api } from "../api/axios";
import {useEffect} from "react";

const profileSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    birthday: z.string(),
    gender: z.enum(['Male', 'Female']),
    phone: z
        .string()
        .regex(
            /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, "Телефон должен быть в формате +7 (ххх) ххх хх-хх"
        )
});
type FormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(profileSchema),
    });

    const { data: data, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await api.get("/doctor/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return res.data;
        }
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

    return (
        <div className="prof-page">
            <form className="prof-form" onSubmit={handleSubmit(onSubmit)}>
                <h2>Профиль</h2>
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
                    <label>Email</label>
                    <input type="email" placeholder="name@example.com" {...register("email")}></input>
                </div>
                <button className="save-btn" type="submit">Сохранить изменения</button>
            </form>
        </div>
    )
}