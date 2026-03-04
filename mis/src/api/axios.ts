import Axios from 'axios';

export const api = Axios.create({
    baseURL: 'https://mis-api.kreosoft.space/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});