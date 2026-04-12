import { useNavigate } from 'react-router-dom';
import './css/LoginPage.css';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {useMutation} from "@tanstack/react-query";
import { api } from "../api/axios";

const loginSchema = z.object({
    password: z.string(),
    email: z.string().email()
});
type FormData = z.infer<typeof loginSchema>;

export function LoginPage() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return await api.post("/doctor/login", data);
        },
        onSuccess: async (data) => {
            const token = data.data.token;
            alert('Логин успешна!');
            localStorage.setItem("token", token);
            const res = await api.get("/doctor/profile");
            localStorage.setItem("userId", res.data.id);
            navigate('/profile')
        },
        onError: (error: any) => {
            console.error(error);
            alert('Логин неуспешна!');
        },
    });

    const onSubmit = (data: FormData) => {
        mutation.mutate(data);
    };

    const navigate = useNavigate();
    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                <h2>Вход</h2>
                <div className="form-input">
                    <label>Email</label>
                    <input type="email" placeholder="name@example.com" {...register("email")}></input>
                    {errors.email && <span className="error-message">{errors.email.message as string}</span>}
                </div>
                <div className="form-input">
                    <label>Пароль</label>
                    <input type="password" {...register("password")}></input>
                    {errors.password  && <span className="error-message">{errors.password.message as string}</span>}
                </div>
                <button className="login-btn" type="submit">Войти</button>
                <button className="reg-btn" type="button" onClick={() => navigate("/registration")}>Регистрация</button>
            </form>
        </div>
    )
}