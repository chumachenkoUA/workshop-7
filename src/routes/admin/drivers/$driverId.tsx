import { createFileRoute } from "@tanstack/react-router";
import { DriverDetailPage } from "../../../features/admin/pages/DriverDetailPage";

export const Route = createFileRoute("/admin/drivers/$driverId")({
	component: DriverDetailPage,
});
