export const getUsername = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("username");
};

export const setUsername = (username: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("username", username);
};

export const clearSession = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("username");
  localStorage.removeItem("token");
};
