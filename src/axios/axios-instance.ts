import axios, { AxiosInstance } from 'axios';

/* eslint-disable-next-line no-undef*/
const serverIpAddress: string = process.env.REACT_APP_SERVICE_URL
    ? 'https://' + process.env.REACT_APP_SERVICE_URL
    : 'http://localhost:8080';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: serverIpAddress
});



export default axiosInstance;
