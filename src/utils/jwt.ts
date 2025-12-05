type JwtPayload = {
  exp?: number;
  role?: string;
  [key: string]: unknown;
};

export const decodeJwt = (token: string): JwtPayload | null => {
	try {
		const [, payload] = token.split(".");
		if (!payload) return null;
		const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(decoded) as JwtPayload;
	} catch {
		return null;
	}
};

export const isTokenExpired = (token: string | null): boolean => {
	if (!token) return true;
	const payload = decodeJwt(token);
	if (!payload?.exp) return false;
	// exp у секундах
	const nowInSeconds = Math.floor(Date.now() / 1000);
	return payload.exp < nowInSeconds;
};
