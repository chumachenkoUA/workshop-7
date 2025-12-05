import { useNavigate } from "@tanstack/react-router";
import type { FunctionComponent } from "../common/types";
import { useAuthStore } from "../store/auth";
import { isTokenExpired } from "../utils/jwt";

export const Home = (): FunctionComponent => {
	const token = useAuthStore((state) => state.token);
	const role = useAuthStore((state) => state.role);
	const clearToken = useAuthStore((state) => state.clearToken);
	const navigate = useNavigate();

	const authed = Boolean(token && !isTokenExpired(token));
	const goToAccount = (): void => {
		if (!authed) {
			void navigate({ to: "/login" });
			return;
		}
		const target = role === "ADMINISTRATOR" ? "/admin" : "/account";
		void navigate({ to: target });
	};

	return (
		<div className="min-h-screen bg-slate-100">
			<header className="flex items-center justify-between px-6 py-4 shadow">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-2xl bg-blue-600 text-white/90 shadow"></div>
					<div>
						<p className="text-sm font-semibold text-gray-700">Transit Hub</p>
						<p className="text-xs text-gray-500">Міська транспортна система</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<button
						className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow hover:bg-gray-50"
						type="button"
						onClick={goToAccount}
					>
						Мій акаунт
					</button>
					{token ? (
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
					) : null}
				</div>
			</header>

			<main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
				<section className="rounded-2xl bg-white p-6 shadow">
					<h1 className="text-3xl font-bold text-gray-900">Єдина панель керування поїздками</h1>
					<p className="mt-3 text-sm text-gray-700">
						Поповнюйте транспортні картки та керуйте поїздками.
					</p>

					<div className="mt-5 flex flex-wrap gap-3">
						<button
							className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
							type="button"
							onClick={goToAccount}
						>
							{authed ? "Перейти в акаунт" : "Увійти"}
						</button>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-3">
						{[
							{ label: "Активні транзитні користувачі", value: "2.1K" },
							{ label: "Поповнення за місяць", value: "₴820K" },
							{ label: "Маршрути онлайн", value: "147" },
						].map((item) => (
							<div key={item.label} className="rounded-lg border bg-white p-4 text-left shadow-sm">
								<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
								<p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	);
};
