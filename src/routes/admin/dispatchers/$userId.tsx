import { createFileRoute } from "@tanstack/react-router";
import { DispatcherDetailPage } from "../../../features/admin/pages/DispatcherDetailPage";

export const Route = createFileRoute("/admin/dispatchers/$userId")({
	component: DispatcherDetailPage,
});
