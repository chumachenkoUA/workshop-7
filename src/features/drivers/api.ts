/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import type { ApiSuccess } from "../apiTypes";
import type { Driver, DriverPayload, DriverUpdatePayload } from "./types";

const baseKey = ["drivers"] as const;
const baseUrl = "/drivers";

const getAll = async (): Promise<Array<Driver>> => {
	const { data } = await apiClient.get<ApiSuccess<Array<Driver>>>(baseUrl);
	return data.data;
};

const getById = async (id: string): Promise<Driver> => {
	const { data } = await apiClient.get<ApiSuccess<Driver>>(`${baseUrl}/${id}`);
	return data.data;
};

const createItem = async (payload: DriverPayload): Promise<Driver> => {
	const { data } = await apiClient.post<ApiSuccess<Driver>>(baseUrl, payload);
	return data.data;
};

const updateItem = async ({ id, ...payload }: DriverUpdatePayload): Promise<Driver> => {
	const { data } = await apiClient.patch<ApiSuccess<Driver>>(`${baseUrl}/${id}`, payload);
	return data.data;
};

const deleteItem = async (id: string): Promise<void> => {
	await apiClient.delete<ApiSuccess<null>>(`${baseUrl}/${id}`);
};

export const useDrivers = () =>
	useQuery({
		queryKey: baseKey,
		queryFn: getAll,
	});

export const useDriver = (id: string) =>
	useQuery({
		queryKey: [...baseKey, id],
		queryFn: () => getById(id),
		enabled: Boolean(id),
	});

export const useCreateDriver = () => {
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

export const useUpdateDriver = () => {
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

export const useDeleteDriver = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteItem,
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			queryClient.removeQueries({ queryKey: [...baseKey, id] });
		},
	});
};
