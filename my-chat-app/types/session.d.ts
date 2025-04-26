declare module "@/utils/session" {
  export function getUsername(): string | null;
  export function setUsername(username: string): void;
  export function clearSession(): void;
}
