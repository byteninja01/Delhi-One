
const BASE_URL = 'http://localhost:5000/api'; // Replace with your local IP or production URL

interface RequestOptions extends RequestInit {
    token?: string | null;
}

export const apiClient = async (endpoint: string, { token, ...customConfig }: RequestOptions = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        return Promise.reject(data);
    }
};
