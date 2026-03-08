import './css/ProfilePage.css';
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
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(profileSchema),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get("/doctor/profile");
            return response.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const newData = {
                ...data,
                birthday: new Date(data.birthday).toISOString()
            };

            return await api.put("/doctor/profile", newData);
        },
        onSuccess: (data) => {
            console.log("Профиль обновлен", data);
            alert('Профиль обновлен!');
        },
        onError: (error: any) => {
            console.log("Ошибка", error.response?.data);
            alert('Ошибка');
        },
    });

    useEffect(() => {
        if (data) {
            reset({
                name: data.name,
                email: data.email,
                birthday: data.birthday.split("T")[0],
                gender: data.gender,
                phone: data.phone,
            });
        }
    }, [data, reset]);

    const onSubmit = (data: FormData) => {
        mutation.mutate(data);
    };

    if (isLoading) return <div>Загрузка...</div>;

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
                        <select {...register("gender")}>
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