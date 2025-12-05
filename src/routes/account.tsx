import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../features/account/pages/AccountPage";

export const Route = createFileRoute("/account")({
	component: AccountPage,
});
