import { createFileRoute } from "@tanstack/react-router";
import { TransitUserDetailPage } from "../../../features/admin/pages/TransitUserDetailPage";

export const Route = createFileRoute("/admin/transit-users/$transitUserId")({
	component: TransitUserDetailPage,
});
