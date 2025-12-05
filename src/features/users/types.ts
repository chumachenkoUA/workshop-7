export type AdminUser = {
  id: number;
  email: string;
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
  name?: string;
  phone?: string;
  fullName?: string;
  language?: string;
};
