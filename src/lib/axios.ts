import axios, { isAxiosError } from "axios";
import { getStoredToken } from "../store/auth";

// Створення окремого інстансу Axios
const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Інтерцептор для запитів: підставляємо токен з localStorage або ENV
apiClient.interceptors.request.use((config) => {
	const storedToken = getStoredToken();
	const envToken = import.meta.env.VITE_API_AUTH_TOKEN;
	const token = storedToken ?? envToken;

	if (token) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = token.startsWith("Bearer") ? token : `Bearer ${token}`;
	}
	return config;
});

// Інтерцептор для відповіді (обробка помилок)
apiClient.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (isAxiosError<{ message?: unknown }>(error)) {
			const responseData = error.response?.data;
			const message =
				typeof responseData === "string"
					? responseData
					: typeof responseData?.message === "string"
						? responseData.message
						: error.message;

			console.error("API Error:", message);
			return Promise.reject(error);
		}

		console.error("API Error:", error);
		return Promise.reject(error instanceof Error ? error : new Error("Unknown error"));
	}
);

export default apiClient;
