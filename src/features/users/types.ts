export type AdminUser = {
  id: number;
  email: string;
  username?: string;
  name?: string;
  phone?: string;
  fullName?: string;
  registeredAt?: string;
  language: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type UserUpdatePayload = {
  username?: string;
  name?: string;
  phone?: string;
  fullName?: string;
  language?: string;
};
