export type Role = "admin" | "editor";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}