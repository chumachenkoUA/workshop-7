import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeleteUser, useUpdateUser, useUser } from "../../users/api";
import { useAuthStore } from "../../../store/auth";
import { isTokenExpired } from "../../../utils/jwt";

export const DispatcherDetailPage = (): ReactElement => {
	const navigate = useNavigate();
	const { userId } = useParams({ from: "/admin/dispatchers/$userId" });
	const token = useAuthStore((state) => state.token);
	const role = useAuthStore((state) => state.role);
	const authInvalid = !token || isTokenExpired(token) || role !== "ADMINISTRATOR";
	const { data, isError, isLoading } = useUser(userId);
	const updateMutation = useUpdateUser();
	const deleteMutation = useDeleteUser();

	const schema = z.object({
		name: z.string().min(1, "Ім'я обов'язкове"),
	});
	type DispatcherForm = z.infer<typeof schema>;
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<DispatcherForm>({
		resolver: zodResolver(schema),
		defaultValues: { name: "" },
	});

	useEffect(() => {
		if (data) {
			reset({ name: data.fullName ?? data.name ?? "" });
		}
	}, [data, reset]);

	if (authInvalid) {
		void navigate({ to: "/login" });
		return <></>;
	}

	if (isLoading) return <div className="p-4">Завантаження...</div>;
	if (isError || !data) return <div className="p-4 text-red-600">Користувача не знайдено.</div>;

	return (
		<div className="p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Диспетчер #{data.id}</h1>
				<button
					className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
					type="button"
					onClick={() => {
						void navigate({ to: "/admin" });
					}}
				>
					До списку
				</button>
			</div>

			<div className="mt-4 rounded-lg bg-white p-5 shadow">
				<form
					className="space-y-3 text-sm text-gray-700"
					onSubmit={handleSubmit((values) => {
						updateMutation.mutate(
							{ id: userId, name: values.name },
							{
								onSuccess: () => {
									reset(values);
								},
							}
						);
					})}
				>
					<label className="block">
						<span className="text-gray-500">ПІБ</span>
						<input className="mt-1 w-full rounded border px-3 py-2" {...register("name")} />
						{errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
					</label>
					<div>
						<span className="text-gray-500">Email: </span>
						<span className="font-semibold">{data.email}</span>
					</div>
					<div>
						<span className="text-gray-500">Телефон: </span>
						<span className="font-semibold">{data.phone ?? "—"}</span>
					</div>
					<div>
						<span className="text-gray-500">Роль: </span>
						<span className="font-semibold">{data.role}</span>
					</div>
					<button
						className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
						disabled={updateMutation.isPending}
						type="submit"
					>
						{updateMutation.isPending ? "Збереження..." : "Зберегти зміни"}
					</button>
				</form>
				<div className="mt-4 flex items-center justify-between rounded border px-3 py-2">
					<div className="text-sm text-gray-700">
						<p className="font-semibold text-red-700">Видалення</p>
						<p>Видалити диспетчера з системи.</p>
					</div>
					<button
						className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
						disabled={deleteMutation.isPending}
						type="button"
						onClick={() => {
							deleteMutation.mutate(userId, {
								onSuccess: () => {
									void navigate({ to: "/admin" });
								},
							});
						}}
					>
						{deleteMutation.isPending ? "Видалення..." : "Видалити"}
					</button>
				</div>
				{deleteMutation.isError ? (
					<p className="text-xs text-red-600">Не вдалося видалити користувача. Спробуйте ще.</p>
				) : null}
			</div>
		</div>
	);
};
