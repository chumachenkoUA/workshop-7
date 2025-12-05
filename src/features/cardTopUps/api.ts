/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import type { ApiSuccess } from "../apiTypes";
import type { CardTopUp, CardTopUpPayload, CardTopUpUpdatePayload } from "./types";

const baseKey = ["cardTopUps"] as const;
const baseUrl = "/card-top-ups";

const getAll = async (): Promise<Array<CardTopUp>> => {
	const { data } = await apiClient.get<ApiSuccess<Array<CardTopUp>>>(baseUrl);
	return data.data;
};

const getById = async (id: string): Promise<CardTopUp> => {
	const { data } = await apiClient.get<ApiSuccess<CardTopUp>>(`${baseUrl}/${id}`);
	return data.data;
};

const getMine = async (): Promise<Array<CardTopUp>> => {
	const { data } = await apiClient.get<ApiSuccess<Array<CardTopUp>>>(`${baseUrl}/me`);
	return data.data;
};

const createItem = async (payload: CardTopUpPayload): Promise<CardTopUp> => {
	const { data } = await apiClient.post<ApiSuccess<CardTopUp>>(baseUrl, payload);
	return data.data;
};

const updateItem = async ({ id, ...payload }: CardTopUpUpdatePayload): Promise<CardTopUp> => {
	const { data } = await apiClient.patch<ApiSuccess<CardTopUp>>(`${baseUrl}/${id}`, payload);
	return data.data;
};

const deleteItem = async (id: string): Promise<void> => {
	await apiClient.delete<ApiSuccess<null>>(`${baseUrl}/${id}`);
};

export const useCardTopUps = () =>
	useQuery({
		queryKey: baseKey,
		queryFn: getAll,
	});

export const useMyCardTopUps = () =>
	useQuery({
		queryKey: [...baseKey, "me"],
		queryFn: getMine,
	});

export const useCardTopUp = (id: string) =>
	useQuery({
		queryKey: [...baseKey, id],
		queryFn: () => getById(id),
		enabled: Boolean(id),
	});

export const useCreateCardTopUp = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createItem,
		onSuccess: async (created) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: baseKey }),
				queryClient.invalidateQueries({ queryKey: [...baseKey, "me"] }),
			]);
			if (created?.id) {
				queryClient.setQueryData([...baseKey, created.id], created);
			}
		},
	});
};

export const useUpdateCardTopUp = () => {
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

export const useDeleteCardTopUp = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteItem,
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			queryClient.removeQueries({ queryKey: [...baseKey, id] });
		},
	});
};
