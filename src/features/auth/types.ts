export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthRegisterPayload = {
  email: string;
  password: string;
  passwordConfirm?: string;
  fullName: string;
  phone: string;
};

export type AuthTokenResponse = string;
