/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useMutation } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import type { ApiSuccess } from "../apiTypes";
import type { AuthCredentials, AuthRegisterPayload, AuthTokenResponse } from "./types";

const baseUrl = "/auth";

const login = async (payload: AuthCredentials): Promise<AuthTokenResponse> => {
	const { data } = await apiClient.post<ApiSuccess<AuthTokenResponse>>(`${baseUrl}/login`, payload);
	return data.data;
};

const register = async (payload: AuthRegisterPayload): Promise<string> => {
	const body = {
		...payload,
		passwordConfirm: payload.passwordConfirm ?? payload.password,
	};
	const { data } = await apiClient.post<ApiSuccess<null>>(`${baseUrl}/register`, body);
	return data.message;
};

export const useLogin = () => useMutation({ mutationFn: login });

export const useRegister = () => useMutation({ mutationFn: register });
