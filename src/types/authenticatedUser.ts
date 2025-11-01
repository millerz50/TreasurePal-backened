// types/authenticatedUser.ts
export interface AuthenticatedUser {
  id: string;
  role: "admin" | "agent" | "user"; // Add other roles if needed
}
