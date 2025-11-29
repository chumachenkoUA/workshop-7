import axios, { isAxiosError } from 'axios';

// Створення окремого інстансу Axios
const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Якщо токен доступний у змінній середовища -- додаємо в Authorization
const token = import.meta.env.VITE_API_AUTH_TOKEN;
if (token) {
	apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Інтерцептор для відповіді (обробка помилок)
apiClient.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (isAxiosError<{ message?: unknown }>(error)) {
			const responseData = error.response?.data;
			const message =
				typeof responseData === 'string'
					? responseData
					: typeof responseData?.message === 'string'
						? responseData.message
						: error.message;

			console.error('API Error:', message);
			return Promise.reject(error);
		}

		console.error('API Error:', error);
		return Promise.reject(error instanceof Error ? error : new Error('Unknown error'));
	}
);
export default apiClient;
