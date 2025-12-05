import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useLogin } from "../api";
import { useAuthStore } from "../../../store/auth";
import { decodeJwt } from "../../../utils/jwt";

export const LoginPage = (): ReactElement => {
	const navigate = useNavigate();
	const loginMutation = useLogin();
	const setToken = useAuthStore((state) => state.setToken);
	const loginSchema = z.object({
		email: z.string().email("Введіть коректний email"),
		password: z.string().min(1, "Пароль обов'язковий"),
	});
	type LoginForm = z.infer<typeof loginSchema>;
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = handleSubmit((values) => {
		loginMutation.mutate(values, {
			onSuccess: (token) => {
				const decoded = decodeJwt(token);
				setToken(token);
				const next =
					decoded?.role === "ADMINISTRATOR"
						? "/admin"
						: decoded?.role === "TRANSIT"
							? "/account"
							: "/";
				void navigate({ to: next });
			},
		});
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
				<h1 className="text-2xl font-semibold">Увійти</h1>
				<p className="mt-1 text-sm text-gray-600">Введіть свої облікові дані, щоб продовжити.</p>
				<form className="mt-5 space-y-4" onSubmit={onSubmit}>
					<label className="block text-sm">
						<span className="text-gray-700">Email</span>
						<input
							autoComplete="email"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("email", { required: "Email обов'язковий" })}
							type="email"
						/>
						{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
					</label>
					<label className="block text-sm">
						<span className="text-gray-700">Пароль</span>
						<input
							autoComplete="current-password"
							className="mt-1 w-full rounded border px-3 py-2"
							{...register("password", { required: "Пароль обов'язковий" })}
							type="password"
						/>
						{errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
					</label>
					<button
						className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
						disabled={loginMutation.isPending}
						type="submit"
					>
						{loginMutation.isPending ? "Вхід..." : "Увійти"}
					</button>
					{loginMutation.isError ? (
						<p className="text-sm text-red-600">Не вдалося увійти. Перевірте дані.</p>
					) : null}
				</form>
			</div>
		</div>
	);
};
