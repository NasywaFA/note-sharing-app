import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface User {
    id: number;
    username: string;
    email: string;
}
export interface Note {
    ID: number;
    title: string;
    content: string;
    image_url?: string;
    user_id: number;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const authAPI = {
    register: async (username: string, email: string, password: string) => {
        const response = await api.post('/register', { username, email, password });
        return response.data;
    },

    login: async (login: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/login', { login, password });
        return response.data;
    },
};


export const notesAPI = {
    getAll: async (): Promise<Note[]> => {
        const response = await api.get<Note[]>('/notes');
        return response.data;
    },

    getById: async (id: number): Promise<Note> => {
        const response = await api.get<Note>(`/notes/${id}`);
        return response.data;
    },

    create: async (title: string, content: string, imageURL?: string): Promise<Note> => {
        const response = await api.post<Note>('/notes', {
            title,
            content,
            image_url: imageURL || '',
        });
        return response.data;
    },

    update: async (id: number, title: string, content: string, imageURL?: string): Promise<Note> => {
        const response = await api.put<Note>(`/notes/${id}`, {
            title,
            content,
            image_url: imageURL || '',
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/notes/${id}`);
    },
};

export default api;
