const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Note {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    username?: string;
    created_at: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

type LogData = Record<string, unknown> | string | number | boolean | null | undefined;

// Logging utility
const log = {
    create: (action: string, data?: LogData) => {
        const timestamp = new Date().toLocaleString('id-ID', { 
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.log(`[${timestamp}] [CREATE] ${action}`, data ?? '');
    },
    read: (action: string, data?: LogData) => {
        const timestamp = new Date().toLocaleString('id-ID', { 
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.log(`[${timestamp}] [READ] ${action}`, data ?? '');
    },
    update: (action: string, data?: LogData) => {
        const timestamp = new Date().toLocaleString('id-ID', { 
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.log(`[${timestamp}] [UPDATE] ${action}`, data ?? '');
    },
    delete: (action: string, data?: LogData) => {
        const timestamp = new Date().toLocaleString('id-ID', { 
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.log(`[${timestamp}] [DELETE] ${action}`, data ?? '');
    },
    upload: (action: string, data?: LogData) => {
        const timestamp = new Date().toLocaleString('id-ID', { 
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.log(`[${timestamp}] [UPLOAD] ${action}`, data ?? '');
    },
    error: (action: string, error: unknown) => {
        const timestamp = new Date().toLocaleString('id-ID', { 
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.error(`[${timestamp}] [ERROR] ${action}`, error);
    }
};

//Get auth token
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};  

//Auth headers
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};  


export const api = {
    // GET all notes
    async getNotes(): Promise<Note[]> {
        try {
            log.read('Fetching all notes...');

            const response = await fetch(`${API_URL}/api/notes`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notes: ${response.statusText}`);
            }

            const data = await response.json();
            log.read(`Successfully fetched ${data.length} notes`, { count: data.length });

            return data;
        } catch (error) {
            log.error('Failed to fetch notes', error);
            throw error;
        }
    },

    // GET single note by ID
    async getNoteById(id: number): Promise<Note> {
        try {
            log.read(`Fetching note with ID: ${id}`);
        
            const response = await fetch(`${API_URL}/api/notes/${id}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch note: ${response.statusText}`);
            }

            const data = await response.json();
            log.read(`Successfully fetched note: "${data.title}"`, { id, title: data.title });

            return data;
        } catch (error) {
            log.error(`Failed to fetch note ID: ${id}`, error);
            throw error;
        }
    },

    // CREATE new note
    async createNote(formData: FormData): Promise<Note> {
        try {
            const title = formData.get('title');
            const hasImage = formData.has('image');
        
            log.create(`Creating note: "${title}"${hasImage ? ' with image' : ''}`, { 
                title,
                hasImage 
            });

            if (hasImage) {
                log.upload('Uploading image with note...');
            }

            const token = getToken();
            const response = await fetch(`${API_URL}/api/notes`, {
                    method: 'POST',
                    headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to create note: ${response.statusText}`);
            }

            const data = await response.json();

            if (hasImage) {
                log.upload('Image uploaded successfully!');
            }

            log.create(`Note created successfully: "${data.title}"`, { 
                id: data.id, 
                title: data.title 
            });

            return data;
        } catch (error) {
            log.error('Failed to create note', error);
            throw error;
        }
    },

    // UPDATE note
    async updateNote(id: number, updates: { title: string; content: string }): Promise<Note> {
        try {
            log.update(`Updating note ID: ${id}`, { id, updates });
        
            const response = await fetch(`${API_URL}/api/notes/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`Failed to update note: ${response.statusText}`);
            }

            const data = await response.json();
            log.update(`Note updated successfully: "${data.title}"`, { 
                id: data.id, 
                title: data.title 
            });

            return data;
        } catch (error) {
            log.error(`Failed to update note ID: ${id}`, error);
            throw error;
        }
    },

    // DELETE note
    async deleteNote(id: number): Promise<void> {
        try {
            log.delete(`Deleting note ID: ${id}`);
        
            const response = await fetch(`${API_URL}/api/notes/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete note: ${response.statusText}`);
            }

            log.delete(`Note deleted successfully`, { id });
        } catch (error) {
            log.error(`Failed to delete note ID: ${id}`, error);
            throw error;
        }
    },

    // Auth: Login
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            log.read(`Attempting login for: ${email}`);

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.statusText}`);
            }

            const data: AuthResponse = await response.json();
            log.read(`Login successful for: ${email}`, { email });

            return data;
        } catch (error) {
            log.error(`Login failed for: ${email}`, error);
            throw error;
        }
    },

    // Auth: Register
    async register(name: string, email: string, password: string): Promise<User> {
        try {
            log.create(`Registering new user: ${email}`);

            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                throw new Error(`Registration failed: ${response.statusText}`);
            }

            const data: User = await response.json();
            log.create(`User registered successfully: ${email}`, { email });

            return data;
        } catch (error) {
            log.error(`Registration failed for: ${email}`, error);
            throw error;
        }
    },
};