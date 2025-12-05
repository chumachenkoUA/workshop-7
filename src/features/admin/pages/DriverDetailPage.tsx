import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDriver, useUpdateDriver, useDeleteDriver } from "../../drivers/api";
import { useAuthStore } from "../../../store/auth";
import { isTokenExpired } from "../../../utils/jwt";

const driverSchema = z
	.object({
		email: z.string().email("Введіть коректний email"),
		phone: z.string().min(1, "Телефон обов'язковий"),
		fullName: z.string().min(1, "ПІБ обов'язкове"),
		licenseData: z.string().min(1, "Ліцензія обов'язкова"),
		passportType: z.enum(["idCard", "paper"]),
		passportSeries: z.string().optional(),
		passportNumber: z.string().min(1, "Номер обов'язковий"),
	})
	.refine(
		(values) => values.passportType === "idCard" || Boolean(values.passportSeries?.trim()),
		{
			path: ["passportSeries"],
			message: "Серія обов'язкова для паперового паспорта",
		}
	);
type DriverForm = z.infer<typeof driverSchema>;

export const DriverDetailPage = (): ReactElement => {
	const navigate = useNavigate();
	const { driverId } = useParams({ from: "/admin/drivers/$driverId" });
	const token = useAuthStore((state) => state.token);
	const role = useAuthStore((state) => state.role);
	const authInvalid = !token || isTokenExpired(token) || role !== "ADMINISTRATOR";
	const { data, isError, isLoading } = useDriver(driverId);
	const updateMutation = useUpdateDriver();
	const deleteMutation = useDeleteDriver();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<DriverForm>({
		resolver: zodResolver(driverSchema),
		defaultValues: {
			passportType: "idCard",
		},
	});

	useEffect(() => {
		if (data) {
			const passportType =
				data.passportData?.type === "paper" || (data.passportData as { type?: string })?.type === "paper"
					? "paper"
					: "idCard";
			reset({
				email: data.email,
				phone: data.phone,
				fullName: data.fullName,
				licenseData: data.licenseData,
				passportType,
				passportSeries: passportType === "paper" ? (data.passportData as { series?: string })?.series ?? "" : "",
				passportNumber: (data.passportData as { number?: string })?.number ?? "",
			});
		}
	}, [data, reset]);

	if (authInvalid) {
		void navigate({ to: "/login" });
		return <></>;
	}

	if (isLoading) return <div className="p-4">Завантаження...</div>;
	if (isError || !data) return <div className="p-4 text-red-600">Водія не знайдено.</div>;

	return (
		<div className="p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Водій #{data.id}</h1>
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
						const passportData =
							values.passportType === "paper"
								? { type: "paper" as const, series: values.passportSeries ?? "", number: values.passportNumber }
								: { type: "idCard" as const, number: values.passportNumber };
						updateMutation.mutate(
							{
								id: driverId,
								email: values.email,
								phone: values.phone,
								fullName: values.fullName,
								licenseData: values.licenseData,
								passportData,
							},
							{
								onSuccess: (updated) => {
									reset({
										email: updated.email,
										phone: updated.phone,
										fullName: updated.fullName,
										licenseData: updated.licenseData,
										passportType: updated.passportData.type,
										passportSeries:
											updated.passportData.type === "paper" ? updated.passportData.series : "",
										passportNumber: updated.passportData.number,
									});
								},
							}
						);
					})}
				>
					<label className="block">
						<span className="text-gray-500">ПІБ: </span>
						<input className="mt-1 w-full rounded border px-3 py-2" {...register("fullName")} />
						{errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
					</label>
					<label className="block">
						<span className="text-gray-500">Email: </span>
						<input className="mt-1 w-full rounded border px-3 py-2" {...register("email")} type="email" />
						{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
					</label>
					<label className="block">
						<span className="text-gray-500">Телефон: </span>
						<input className="mt-1 w-full rounded border px-3 py-2" {...register("phone")} />
						{errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
					</label>
					<label className="block">
						<span className="text-gray-500">Ліцензія: </span>
						<input className="mt-1 w-full rounded border px-3 py-2" {...register("licenseData")} />
						{errors.licenseData ? <p className="text-xs text-red-600">{errors.licenseData.message}</p> : null}
					</label>
					<div className="grid gap-2 md:grid-cols-2">
						<label className="block">
							<span className="text-gray-500">Тип паспорта</span>
							<select className="mt-1 w-full rounded border px-3 py-2" {...register("passportType")}>
								<option value="idCard">ID</option>
								<option value="paper">Паперовий</option>
							</select>
						</label>
						<label className="block">
							<span className="text-gray-500">Серія (для паперового)</span>
							<input className="mt-1 w-full rounded border px-3 py-2" {...register("passportSeries")} />
							{errors.passportSeries ? (
								<p className="text-xs text-red-600">{errors.passportSeries.message}</p>
							) : null}
						</label>
						<label className="block md:col-span-2">
							<span className="text-gray-500">Номер</span>
							<input className="mt-1 w-full rounded border px-3 py-2" {...register("passportNumber")} />
							{errors.passportNumber ? (
								<p className="text-xs text-red-600">{errors.passportNumber.message}</p>
							) : null}
						</label>
					</div>
					<button
						className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
						disabled={updateMutation.isPending}
						type="submit"
					>
						{updateMutation.isPending ? "Збереження..." : "Оновити дані"}
					</button>
				</form>
				<div className="mt-4 flex items-center justify-between rounded border px-3 py-2">
					<div>
						<div className="font-semibold">Поточний паспорт</div>
						<div className="text-xs text-gray-600">
							{data.passportData.type === "paper"
								? `Паперовий: ${data.passportData.series} ${data.passportData.number}`
								: `ID: ${data.passportData.number}`}
						</div>
					</div>
					<button
						className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
						disabled={deleteMutation.isPending}
						type="button"
						onClick={() => {
							deleteMutation.mutate(driverId, {
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
					<p className="text-xs text-red-600">Не вдалося видалити водія. Спробуйте ще.</p>
				) : null}
			</div>
		</div>
	);
};
