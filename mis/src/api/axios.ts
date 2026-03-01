import Axios from 'axios';

export const api = Axios.create({
    baseURL: 'https://mis-api.kreosoft.space/api',
});