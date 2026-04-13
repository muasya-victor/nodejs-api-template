export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role:
    | "USER"
    | "ADMIN"
    | "MANAGER"
    | "STUDENT"
    | "TEACHER"
    | "CUSTOMER"
    | "TEMPORARY";
  password?: string;
};