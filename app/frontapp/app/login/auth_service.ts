const TOKEN_KEY = "auth_token";
const SESSION_KEY = "auth_session_expires";
export function subscribeAuth(callback: () => void) {
  window.addEventListener("auth-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("auth-change", callback);
    window.removeEventListener("storage", callback);
  };
}
function expiresAt(token: string): number {
  try {
    return (
      Number(
        JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        ).exp,
      ) * 1000
    );
  } catch {
    return 0;
  }
}
// Apenas compatibilidade com sessões Bearer anteriores; novos logins não armazenam JWT.
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token =
    sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  return token && expiresAt(token) > Date.now() ? token : null;
}
export function saveToken(token: string, remember = false) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(
    SESSION_KEY,
    String(expiresAt(token)),
  );
  window.dispatchEvent(new Event("auth-change"));
}
export function clearToken() {
  if (typeof window === "undefined") return;
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(SESSION_KEY);
  }
  window.dispatchEvent(new Event("auth-change"));
}
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return (
    !!getToken() ||
    Number(
      sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY),
    ) > Date.now()
  );
}
export async function restoreSession(): Promise<boolean> {
  if (isAuthenticated()) return true;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"}/auth/session`,
      { credentials: "include" },
    );
    if (!response.ok) {
      clearToken();
      return false;
    }
    const data: { expiresAt: number } = await response.json();
    sessionStorage.setItem(SESSION_KEY, String(data.expiresAt));
    window.dispatchEvent(new Event("auth-change"));
    return data.expiresAt > Date.now();
  } catch {
    return false;
  }
}
