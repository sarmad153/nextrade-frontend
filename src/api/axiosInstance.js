import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
export const SERVER_URL = BASE_URL.replace("/api", "");

const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach Bearer token automatically for protected calls
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

export default API;
