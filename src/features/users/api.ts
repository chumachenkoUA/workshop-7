/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import type { ApiSuccess } from "../apiTypes";
import type { AdminUser, UserUpdatePayload } from "./types";
import type { AuthRegisterPayload } from "../auth/types";

const baseKey = ["users"] as const;
const baseUrl = "/users";

const getAll = async (): Promise<Array<AdminUser>> => {
	const { data } = await apiClient.get<ApiSuccess<Array<AdminUser>>>(baseUrl);
	return data.data;
};

const getById = async (id: string): Promise<AdminUser> => {
	const { data } = await apiClient.get<ApiSuccess<AdminUser>>(`${baseUrl}/${id}`);
	return data.data;
};

const updateItem = async ({ id, ...payload }: { id: string } & UserUpdatePayload): Promise<AdminUser> => {
	const { data } = await apiClient.patch<ApiSuccess<AdminUser>>(`${baseUrl}/${id}`, payload);
	return data.data;
};

const deleteItem = async (id: string): Promise<void> => {
	await apiClient.delete<ApiSuccess<null>>(`${baseUrl}/${id}`);
};

const createDispatcher = async (payload: AuthRegisterPayload): Promise<string> => {
	const body = {
		...payload,
		passwordConfirm: payload.passwordConfirm ?? payload.password,
	};
	const { data } = await apiClient.post<ApiSuccess<string>>(`${baseUrl}/dispatchers`, body);
	return data.message ?? "Dispatcher created.";
};

export const useUsers = () =>
	useQuery({
		queryKey: baseKey,
		queryFn: getAll,
	});

export const useUser = (id: string) =>
	useQuery({
		queryKey: [...baseKey, id],
		queryFn: () => getById(id),
		enabled: Boolean(id),
	});

export const useUpdateUser = () => {
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

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteItem,
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
			queryClient.removeQueries({ queryKey: [...baseKey, id] });
		},
	});
};

export const useCreateDispatcher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createDispatcher,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: baseKey });
		},
	});
};
