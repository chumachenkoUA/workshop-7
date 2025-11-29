/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import type { ApiSuccess } from "../apiTypes";
import type { TransportCard, TransportCardPayload } from "./types";

const baseKey = ["transportCards"] as const;
const baseUrl = "/v1/transport-cards";

const getAll = async (): Promise<Array<TransportCard>> => {
	const { data } = await apiClient.get<ApiSuccess<Array<TransportCard>>>(baseUrl);
	return data.data;
};

const getById = async (id: string): Promise<TransportCard> => {
	const { data } = await apiClient.get<ApiSuccess<TransportCard>>(`${baseUrl}/${id}`);
	return data.data;
};

const createItem = async (payload: TransportCardPayload): Promise<TransportCard> => {
	const { data } = await apiClient.post<ApiSuccess<TransportCard>>(baseUrl, payload);
	return data.data;
};

const updateItem = async ({ id, ...payload }: { id: string } & TransportCardPayload): Promise<TransportCard> => {
	const { data } = await apiClient.patch<ApiSuccess<TransportCard>>(`${baseUrl}/${id}`, payload);
	return data.data;
};

const deleteItem = async (id: string): Promise<void> => {
	await apiClient.delete<ApiSuccess<null>>(`${baseUrl}/${id}`);
};

export const useTransportCards = () =>
	useQuery({
		queryKey: baseKey,
		queryFn: getAll,
	});

export const useTransportCard = (id: string) =>
	useQuery({
		queryKey: [...baseKey, id],
		queryFn: () => getById(id),
		enabled: Boolean(id),
	});

export const useCreateTransportCard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createItem,
		onSuccess: async (created) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			if (created?.id) {
				queryClient.setQueryData([...baseKey, created.id], created);
			}
		},
	});
};

export const useUpdateTransportCard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateItem,
		onSuccess: async (updated) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			if (updated?.id) {
				queryClient.setQueryData([...baseKey, updated.id], updated);
			}
		},
	});
};

export const useDeleteTransportCard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteItem,
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			queryClient.removeQueries({ queryKey: [...baseKey, id] });
		},
	});
};
