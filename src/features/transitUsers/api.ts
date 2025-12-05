/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import type { ApiSuccess } from "../apiTypes";
import type { TransitUser, TransitUserPayload, TransitUserUpdatePayload } from "./types";

const baseKey = ["transitUsers"] as const;
const baseUrl = "/transit-users";

const getAll = async (): Promise<Array<TransitUser>> => {
	const { data } = await apiClient.get<ApiSuccess<Array<TransitUser>>>(baseUrl);
	return data.data;
};

const getById = async (id: string): Promise<TransitUser> => {
	const { data } = await apiClient.get<ApiSuccess<TransitUser>>(`${baseUrl}/${id}`);
	return data.data;
};

const createItem = async (payload: TransitUserPayload): Promise<TransitUser> => {
	const { data } = await apiClient.post<ApiSuccess<TransitUser>>(baseUrl, payload);
	return data.data;
};

const updateItem = async ({ id, ...payload }: TransitUserUpdatePayload): Promise<TransitUser> => {
	const { data } = await apiClient.patch<ApiSuccess<TransitUser>>(`${baseUrl}/${id}`, payload);
	return data.data;
};

const deleteItem = async (id: string): Promise<void> => {
	await apiClient.delete<ApiSuccess<null>>(`${baseUrl}/${id}`);
};

export const useTransitUsers = () =>
	useQuery({
		queryKey: baseKey,
		queryFn: getAll,
	});

export const useTransitUser = (id: string) =>
	useQuery({
		queryKey: [...baseKey, id],
		queryFn: () => getById(id),
		enabled: Boolean(id),
	});

export const useCreateTransitUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createItem,
		onSuccess: (created) => {
			void queryClient.invalidateQueries({ queryKey: baseKey });
			if (created?.id) {
				queryClient.setQueryData([...baseKey, created.id], created);
			}
		},
	});
};

export const useUpdateTransitUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateItem,
		onSuccess: async (updated) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			if (updated?.id) {
				queryClient.setQueryData([...baseKey, updated.id.toString()], updated);
			}
		},
	});
};

export const useDeleteTransitUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteItem,
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			queryClient.removeQueries({ queryKey: [...baseKey, id] });
		},
	});
};
