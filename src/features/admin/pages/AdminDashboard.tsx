/* eslint-disable no-use-before-define */
import { useEffect, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, Outlet, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../../store/auth";
import { isTokenExpired } from "../../../utils/jwt";
import { useTransitUsers, useCreateTransitUser } from "../../transitUsers/api";
import { useDrivers, useCreateDriver } from "../../drivers/api";
import { useCreateDispatcher, useUsers } from "../../users/api";

type TabKey = "transit" | "drivers" | "dispatchers";

export const AdminDashboard = (): ReactElement => {
	const navigate = useNavigate();
	const { token, role, clearToken } = useAuthStore.getState();
	const [activeTab, setActiveTab] = useState<TabKey>("transit");
	const matchRoute = useMatchRoute();
	const isAdminHome = matchRoute({ to: "/admin", fuzzy: false });

	useEffect(() => {
		if (!token || isTokenExpired(token) || role !== "ADMINISTRATOR") {
			clearToken();
			void navigate({ to: "/login" });
		}
	}, [token, role, clearToken, navigate]);

	return (
		<div className="min-h-screen bg-slate-100 p-6">
			<div className="mx-auto flex max-w-6xl flex-col gap-6">
				<header className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Адмін-панель</h1>
					<div className="flex gap-3">
						<RouterLink
							className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
							to="/"
						>
							На головну
						</RouterLink>
						<button
							className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
							type="button"
							onClick={() => {
								clearToken();
								void navigate({ to: "/" });
							}}
						>
							Вийти
						</button>
					</div>
				</header>

				{isAdminHome ? (
					<>
						<div className="flex gap-3">
							{[
								{ key: "transit", label: "Транзитні користувачі" },
								{ key: "drivers", label: "Водії" },
								{ key: "dispatchers", label: "Диспетчери" },
							].map((tab) => (
								<button
									key={tab.key}
									type="button"
									className={`rounded px-3 py-2 text-sm font-semibold shadow ${
										activeTab === tab.key ? "bg-blue-600 text-white" : "bg-white text-gray-800"
									}`}
									onClick={() => {
										setActiveTab(tab.key as TabKey);
									}}
								>
									{tab.label}
								</button>
							))}
						</div>

						<TabContent activeTab={activeTab} />
					</>
				) : (
					<Outlet />
				)}
			</div>
		</div>
	);
};

function TabContent({ activeTab }: { activeTab: TabKey }): ReactElement {
	switch (activeTab) {
		case "transit":
			return <TransitUsersTab />;
		case "drivers":
			return <DriversTab />;
		case "dispatchers":
			return <DispatchersTab />;
		default:
			return <TransitUsersTab />;
	}
}

function TransitUsersTab(): ReactElement {
	const { data, isLoading, isError } = useTransitUsers();
	const createMutation = useCreateTransitUser();
	const transitUserSchema = z.object({
		email: z.string().email("Введіть коректний email"),
		phone: z.string().min(1, "Телефон обов'язковий"),
		fullName: z.string().min(1, "ПІБ обов'язкове"),
	});
	type TransitUserForm = z.infer<typeof transitUserSchema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TransitUserForm>({
		resolver: zodResolver(transitUserSchema),
		defaultValues: { email: "", phone: "", fullName: "" },
	});

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<section className="lg:col-span-2 rounded-lg bg-white p-5 shadow">
				<h2 className="text-lg font-semibold">Список транзитних користувачів</h2>
				{isLoading ? (
					<p className="mt-3 text-sm text-gray-600">Завантаження...</p>
				) : isError ? (
					<p className="mt-3 text-sm text-red-600">Не вдалося завантажити.</p>
				) : (
					<ul className="mt-4 divide-y text-sm">
						{data?.map((user) => (
							<li key={user.id} className="flex justify-between py-2">
								<div>
									<div className="font-semibold">{user.fullName}</div>
									<div className="text-gray-600">{user.email}</div>
									<div className="text-gray-600">{user.phone}</div>
								</div>
								<RouterLink
									className="text-sm font-semibold text-blue-600 hover:underline"
									params={{ transitUserId: user.id }}
									to="/admin/transit-users/$transitUserId"
								>
									Деталі
								</RouterLink>
							</li>
						))}
					</ul>
				)}
			</section>

			<aside className="rounded-lg bg-white p-5 shadow">
				<h3 className="text-md font-semibold">Додати транзитного користувача</h3>
				<form
					className="mt-3 space-y-3"
					onSubmit={handleSubmit((values) => {
						createMutation.mutate(values, {
							onSuccess: () => {
								reset();
							},
						});
					})}
				>
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Email"
						{...register("email")}
					/>
					{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Телефон"
						{...register("phone")}
					/>
					{errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="ПІБ"
						{...register("fullName")}
					/>
					{errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
					<button
						className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
						disabled={createMutation.isPending}
						type="submit"
					>
						{createMutation.isPending ? "Створення..." : "Створити"}
					</button>
					{createMutation.isError ? (
						<p className="text-xs text-red-600">Не вдалося створити користувача.</p>
					) : null}
				</form>
			</aside>
		</div>
	);
};

function DriversTab(): ReactElement {
	const { data, isLoading, isError } = useDrivers();
	const createMutation = useCreateDriver();
	const driverSchema = z
		.object({
			email: z.string().email("Введіть коректний email"),
			phone: z.string().min(1, "Телефон обов'язковий"),
			fullName: z.string().min(1, "ПІБ обов'язкове"),
			licenseData: z.string().min(1, "Ліцензія обов'язкова"),
			passportType: z.enum(["idCard", "paper"]),
			passportNumber: z.string().min(1, "Номер обов'язковий"),
			passportSeries: z.string().optional(),
		})
		.refine(
			(values) => values.passportType === "idCard" || Boolean(values.passportSeries?.trim()),
			{
				path: ["passportSeries"],
				message: "Серія обов'язкова для паперового паспорта",
			}
		);
	type DriverForm = z.infer<typeof driverSchema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<DriverForm>({
		resolver: zodResolver(driverSchema),
		defaultValues: {
			email: "",
			phone: "",
			fullName: "",
			licenseData: "",
			passportType: "idCard",
			passportNumber: "",
			passportSeries: "",
		},
	});

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<section className="lg:col-span-2 rounded-lg bg-white p-5 shadow">
				<h2 className="text-lg font-semibold">Список водіїв</h2>
				{isLoading ? (
					<p className="mt-3 text-sm text-gray-600">Завантаження...</p>
				) : isError ? (
					<p className="mt-3 text-sm text-red-600">Не вдалося завантажити.</p>
				) : (
					<ul className="mt-4 divide-y text-sm">
						{data?.map((driver) => (
							<li key={driver.id} className="flex justify-between py-2">
								<div>
									<div className="font-semibold">{driver.fullName}</div>
									<div className="text-gray-600">{driver.email}</div>
									<div className="text-gray-600">{driver.phone}</div>
								</div>
								<RouterLink
									className="text-sm font-semibold text-blue-600 hover:underline"
									params={{ driverId: driver.id }}
									to="/admin/drivers/$driverId"
								>
									Деталі
								</RouterLink>
							</li>
						))}
					</ul>
				)}
			</section>

			<aside className="rounded-lg bg-white p-5 shadow">
				<h3 className="text-md font-semibold">Додати водія</h3>
				<form
					className="mt-3 space-y-3"
					onSubmit={handleSubmit((values) => {
						const passportData =
							values.passportType === "paper"
								? { type: "paper" as const, series: values.passportSeries ?? "", number: values.passportNumber }
								: { type: "idCard" as const, number: values.passportNumber };
						createMutation.mutate(
							{
								email: values.email,
								phone: values.phone,
								fullName: values.fullName,
								licenseData: values.licenseData,
								passportData,
							},
							{
								onSuccess: () => {
									reset();
								},
							}
						);
					})}
				>
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Email"
						{...register("email")}
					/>
					{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Телефон"
						{...register("phone")}
					/>
					{errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="ПІБ"
						{...register("fullName")}
					/>
					{errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Ліцензія"
						{...register("licenseData")}
					/>
					{errors.licenseData ? <p className="text-xs text-red-600">{errors.licenseData.message}</p> : null}
					<div className="flex gap-2">
						<select
							className="w-1/3 rounded border px-2 py-2 text-sm"
							{...register("passportType")}
						>
							<option value="idCard">ID</option>
							<option value="paper">Паспорт</option>
						</select>
						<input
							className="w-1/3 rounded border px-3 py-2 text-sm"
							placeholder="Серія (для паперового)"
							{...register("passportSeries")}
						/>
						<input
							required
							className="w-1/3 rounded border px-3 py-2 text-sm"
							placeholder="Номер"
							{...register("passportNumber")}
						/>
					</div>
					{errors.passportNumber ? (
						<p className="text-xs text-red-600">{errors.passportNumber.message}</p>
					) : null}
					{errors.passportSeries ? (
						<p className="text-xs text-red-600">{errors.passportSeries.message}</p>
					) : null}
					<button
						className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
						disabled={createMutation.isPending}
						type="submit"
					>
						{createMutation.isPending ? "Створення..." : "Створити"}
					</button>
					{createMutation.isError ? (
						<p className="text-xs text-red-600">Не вдалося створити водія.</p>
					) : null}
				</form>
			</aside>
		</div>
	);
};

function DispatchersTab(): ReactElement {
	const { data, isLoading, isError } = useUsers();
	const createDispatcher = useCreateDispatcher();
	const dispatcherSchema = z
		.object({
			email: z.string().email("Введіть коректний email"),
			phone: z.string().min(1, "Телефон обов'язковий"),
			fullName: z.string().min(1, "ПІБ обов'язкове"),
			password: z.string().min(6, "Мінімум 6 символів"),
			passwordConfirm: z.string().min(6, "Мінімум 6 символів"),
		})
		.refine((values) => values.password === values.passwordConfirm, {
			path: ["passwordConfirm"],
			message: "Паролі не співпадають",
		});
	type DispatcherForm = z.infer<typeof dispatcherSchema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<DispatcherForm>({
		resolver: zodResolver(dispatcherSchema),
		defaultValues: { email: "", password: "", passwordConfirm: "", fullName: "", phone: "" },
	});

	const dispatchers = data?.filter((user) => user.role === "DISPATCHER") ?? [];

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<section className="lg:col-span-2 rounded-lg bg-white p-5 shadow">
				<h2 className="text-lg font-semibold">Диспетчери</h2>
				{isLoading ? (
					<p className="mt-3 text-sm text-gray-600">Завантаження...</p>
				) : isError ? (
					<p className="mt-3 text-sm text-red-600">Не вдалося завантажити.</p>
				) : (
					<ul className="mt-4 divide-y text-sm">
						{dispatchers.map((user) => (
							<li key={user.id} className="flex justify-between py-2">
								<div>
									<div className="font-semibold">{user.fullName ?? user.name ?? "Без імені"}</div>
									<div className="text-gray-600">{user.email}</div>
									{user.phone ? <div className="text-gray-600">{user.phone}</div> : null}
								</div>
								<RouterLink
									className="text-sm font-semibold text-blue-600 hover:underline"
									params={{ userId: user.id.toString() }}
									to="/admin/dispatchers/$userId"
								>
									Деталі
								</RouterLink>
							</li>
						))}
					</ul>
				)}
			</section>

			<aside className="rounded-lg bg-white p-5 shadow">
				<h3 className="text-md font-semibold">Додати диспетчера</h3>
				<form
					className="mt-3 space-y-3"
					onSubmit={handleSubmit((values) => {
						createDispatcher.mutate(values, {
							onSuccess: () => {
								reset();
							},
						});
					})}
				>
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Email"
						{...register("email")}
					/>
					{errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Телефон"
						{...register("phone")}
					/>
					{errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="ПІБ"
						{...register("fullName")}
					/>
					{errors.fullName ? <p className="text-xs text-red-600">{errors.fullName.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Пароль"
						type="password"
						{...register("password")}
					/>
					{errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
					<input
						required
						className="w-full rounded border px-3 py-2 text-sm"
						placeholder="Підтвердження пароля"
						type="password"
						{...register("passwordConfirm")}
					/>
					{errors.passwordConfirm ? (
						<p className="text-xs text-red-600">{errors.passwordConfirm.message}</p>
					) : null}
					<button
						className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
						disabled={createDispatcher.isPending}
						type="submit"
					>
						{createDispatcher.isPending ? "Створення..." : "Створити"}
					</button>
					{createDispatcher.isError ? (
						<p className="text-xs text-red-600">Не вдалося створити користувача.</p>
					) : null}
				</form>
			</aside>
		</div>
	);
};
