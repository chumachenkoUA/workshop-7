import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransitUser, useUpdateTransitUser, useDeleteTransitUser } from "../../transitUsers/api";
import { useAuthStore } from "../../../store/auth";
import { isTokenExpired } from "../../../utils/jwt";
import { formatDateTime } from "../../../utils/date";

const transitUserSchema = z.object({
	email: z.string().email("Введіть коректний email"),
	phone: z.string().min(1, "Телефон обов'язковий"),
	fullName: z.string().min(1, "ПІБ обов'язкове"),
});
type TransitUserForm = z.infer<typeof transitUserSchema>;

export const TransitUserDetailPage = (): ReactElement => {
	const navigate = useNavigate();
	const { transitUserId } = useParams({ from: "/admin/transit-users/$transitUserId" });
	const token = useAuthStore((state) => state.token);
	const role = useAuthStore((state) => state.role);
	const authInvalid = !token || isTokenExpired(token) || role !== "ADMINISTRATOR";
	const { data, isError, isLoading } = useTransitUser(transitUserId);
	const updateMutation = useUpdateTransitUser();
	const deleteMutation = useDeleteTransitUser();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TransitUserForm>({
		resolver: zodResolver(transitUserSchema),
	});

	useEffect(() => {
		if (data) {
			reset({ email: data.email, phone: data.phone, fullName: data.fullName });
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
				<h1 className="text-2xl font-bold">Транзитний користувач #{data.id}</h1>
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

			<div className="mt-4 space-y-4">
				<div className="rounded-lg bg-white p-5 shadow">
					<div className="space-y-2 text-sm text-gray-700">
						<div>
							<span className="text-gray-500">ПІБ: </span>
							<span className="font-semibold">{data.fullName}</span>
						</div>
						<div>
							<span className="text-gray-500">Email: </span>
							<span className="font-semibold">{data.email}</span>
						</div>
						<div>
							<span className="text-gray-500">Телефон: </span>
							<span className="font-semibold">{data.phone}</span>
						</div>
						<div>
							<span className="text-gray-500">Зареєстровано: </span>
							<span className="font-semibold">{formatDateTime(data.registeredAt)}</span>
						</div>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Транспортна картка</h2>
						{data.transportCard ? (
							<div className="mt-2 space-y-1 text-sm text-gray-700">
								<div>Номер: {data.transportCard.number}</div>
								<div>Баланс: {data.transportCard.balance} ₴</div>
								<div>ID: {data.transportCard.id}</div>
							</div>
						) : (
							<p className="mt-2 text-sm text-gray-600">Картка відсутня.</p>
						)}
					</div>

					<div className="rounded-lg bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Останній GPS лог</h2>
						{data.lastGpsLog ? (
							<div className="mt-2 space-y-1 text-sm text-gray-700">
								<div>Lat: {data.lastGpsLog.latitude}</div>
								<div>Lng: {data.lastGpsLog.longitude}</div>
								<div>Час: {formatDateTime(data.lastGpsLog.capturedAt)}</div>
							</div>
						) : (
							<p className="mt-2 text-sm text-gray-600">Логів немає.</p>
						)}
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Редагувати дані</h2>
						<form
							className="mt-3 space-y-3"
							onSubmit={handleSubmit((values) => {
								updateMutation.mutate(
									{ id: transitUserId, ...values },
									{
										onSuccess: (updated) => {
											reset({ email: updated.email, phone: updated.phone, fullName: updated.fullName });
										},
									}
								);
							})}
						>
							<label className="block text-sm">
								<span className="font-medium text-gray-700">Email</span>
								<input
									className="mt-1 w-full rounded border px-3 py-2"
									{...register("email")}
									type="email"
								/>
								{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
							</label>
							<label className="block text-sm">
								<span className="font-medium text-gray-700">Телефон</span>
								<input className="mt-1 w-full rounded border px-3 py-2" {...register("phone")} />
								{errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
							</label>
							<label className="block text-sm">
								<span className="font-medium text-gray-700">ПІБ</span>
								<input className="mt-1 w-full rounded border px-3 py-2" {...register("fullName")} />
								{errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
							</label>
							<button
								className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
								disabled={updateMutation.isPending}
								type="submit"
							>
								{updateMutation.isPending ? "Збереження..." : "Зберегти зміни"}
							</button>
						</form>
					</div>

					<div className="flex flex-col justify-between rounded-lg bg-white p-5 shadow">
						<div>
							<h2 className="text-lg font-semibold text-red-700">Видалення</h2>
							<p className="mt-2 text-sm text-gray-700">Видалить користувача назавжди.</p>
						</div>
						<button
							className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
							disabled={deleteMutation.isPending}
							type="button"
							onClick={() => {
								deleteMutation.mutate(transitUserId, {
									onSuccess: () => {
										void navigate({ to: "/admin" });
									},
								});
							}}
						>
							{deleteMutation.isPending ? "Видалення..." : "Видалити користувача"}
						</button>
						{deleteMutation.isError ? (
							<p className="text-xs text-red-600">Не вдалося видалити користувача. Спробуйте ще.</p>
						) : null}
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Штрафи</h2>
						{data.fines && data.fines.length > 0 ? (
							<ul className="mt-2 space-y-2 text-sm text-gray-700">
								{data.fines.map((fine) => (
									<li key={fine.id} className="rounded border px-3 py-2">
										<div>ID: {fine.id}</div>
										<div>Статус: {fine.status}</div>
										<div>Видано: {fine.issuedAt}</div>
									</li>
								))}
							</ul>
						) : (
							<p className="mt-2 text-sm text-gray-600">Штрафів немає.</p>
						)}
					</div>

					<div className="rounded-lg bg-white p-5 shadow">
						<h2 className="text-lg font-semibold">Скарги</h2>
						{data.complaints && data.complaints.length > 0 ? (
							<ul className="mt-2 space-y-2 text-sm text-gray-700">
								{data.complaints.map((complaint) => (
									<li key={complaint.id} className="rounded border px-3 py-2">
										<div>ID: {complaint.id}</div>
										<div>Тип: {complaint.type}</div>
										<div>Статус: {complaint.status}</div>
									</li>
								))}
							</ul>
						) : (
							<p className="mt-2 text-sm text-gray-600">Скарг немає.</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
