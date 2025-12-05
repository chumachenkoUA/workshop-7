import { create } from "zustand";
import { decodeJwt } from "../utils/jwt";

type AuthState = {
	token: string | null;
	role: string | null;
	setToken: (token: string) => void;
	clearToken: () => void;
};

const TOKEN_KEY = "auth_token";

export const useAuthStore = create<AuthState>((set): AuthState => {
	const initialToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
	const initialRole = initialToken ? decodeJwt(initialToken)?.role?.toString() ?? null : null;
	return {
		token: initialToken,
		role: initialRole,
		setToken: (token: string): void => {
			if (typeof window !== "undefined") {
				localStorage.setItem(TOKEN_KEY, token);
			}
			const role = decodeJwt(token)?.role?.toString() ?? null;
			set({ token, role });
		},
		clearToken: (): void => {
			if (typeof window !== "undefined") {
				localStorage.removeItem(TOKEN_KEY);
			}
			set({ token: null, role: null });
		},
	};
});

export const getStoredToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
};
