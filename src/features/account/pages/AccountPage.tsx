import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactElement } from "react";
import { useMyTransportCard } from "../../transportCards/api";
import { useMyCardTopUps } from "../../cardTopUps/api";
import { useAuthStore } from "../../../store/auth";
import { isTokenExpired } from "../../../utils/jwt";
import { formatDateTime } from "../../../utils/date";

export const AccountPage = (): ReactElement => {
	const navigate = useNavigate();
	const role = useAuthStore((state) => state.role);
	const token = useAuthStore((state) => state.token);
	const clearToken = useAuthStore((state) => state.clearToken);

	useEffect(() => {
		if (!token || isTokenExpired(token)) {
			clearToken();
			void navigate({ to: "/login" });
		}
	}, [token, clearToken, navigate]);

	const { data: card, isLoading: cardLoading, isError: cardError } = useMyTransportCard();
	const { data: topUps, isLoading: topUpsLoading, isError: topUpsError } = useMyCardTopUps();

	if (role !== "TRANSIT") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-100">
				<div className="rounded-xl bg-white p-6 text-center shadow">
					<p className="text-lg font-semibold text-red-600">Доступ лише для ролі TRANSIT</p>
					<button
						className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						type="button"
						onClick={() => {
							void navigate({ to: "/" });
						}}
					>
						На головну
					</button>
				</div>
			</div>
		);
	}

	const isLoading = cardLoading || topUpsLoading;
	const hasError = cardError || topUpsError;

	return (
		<div className="min-h-screen bg-slate-100 p-6">
			<div className="mx-auto flex max-w-4xl flex-col gap-6">
				<header className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Мій акаунт</h1>
					<div className="flex gap-3">
						<Link
							className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
							to="/"
						>
							На головну
						</Link>
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

				{isLoading ? (
					<div className="rounded-lg bg-white p-4 shadow">Завантаження...</div>
				) : hasError ? (
					<div className="rounded-lg bg-white p-4 text-red-600 shadow">Не вдалося завантажити дані.</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2">
						<div className="rounded-lg bg-white p-5 shadow">
							<h2 className="text-lg font-semibold">Транспортна картка</h2>
							{card ? (
								<div className="mt-3 space-y-1 text-sm text-gray-700">
									<div className="text-gray-500">Номер</div>
									<div className="text-base font-semibold">{card.number}</div>
									<div className="text-gray-500">Баланс</div>
									<div className="text-base font-semibold">{card.balance} ₴</div>
								</div>
							) : (
								<p className="mt-2 text-sm text-gray-600">Картка не знайдена.</p>
							)}
						</div>

						<div className="rounded-lg bg-white p-5 shadow">
							<h2 className="text-lg font-semibold">Останні поповнення</h2>
							{topUps && topUps.length > 0 ? (
								<ul className="mt-3 space-y-2 text-sm">
									{topUps.slice(0, 5).map((topUp) => (
										<li key={topUp.id} className="rounded border px-3 py-2">
											<div className="flex items-center justify-between">
												<span>+{topUp.amount} ₴</span>
												<span className="text-gray-500">{formatDateTime(topUp.rechargedAt)}</span>
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="mt-2 text-sm text-gray-600">Ще немає поповнень.</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
