import { clearToken, getToken } from "../login/auth_service";
export const API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }
  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined" && !path.startsWith("/auth/"))
      window.location.assign("/login");
  }
  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    throw new Error("Resposta inválida do servidor.");
  }
  if (!response.ok)
    throw new Error(
      Array.isArray(data?.message)
        ? data.message.join(" ")
        : (data?.message ?? "Não foi possível concluir a operação."),
    );
  return data as T;
}
export interface Pokemon {
  id?: number | null;
  name: string;
  pokedexNumber: number;
  type: string;
  type2: string | null;
  spriteUrl: string | null;
}
export interface Details extends Pokemon {
  height: number;
  weight: number;
  ability: string;
  description: string | null;
  stats: { name: string; value: number }[];
  evolutions: (Pokemon & { evolvesFrom: string | null })[];
}
export interface Catalog {
  results: Pokemon[];
  total: number;
  page: number;
  pages: number;
}
export interface Capture {
  id: number;
  nickname: string | null;
  level: number;
  captureDate: string;
  captureLocation: string | null;
  notes?: string | null;
  pokemon: Pokemon;
}
export interface Team {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  teamPokemon: {
    position: number;
    capturedPokemonId: number;
    capturedPokemon: Capture;
  }[];
}
export interface Progress {
  teams: number;
  monthlyExperience: { month: string; experience: number }[];
  userId: number;
  trainerName: string;
  level: number;
  experience: number;
  experienceInCurrentLevel: number;
  experienceForNextLevel: number;
  pokemonCaptured: number;
  badges: number;
}
export interface RankedTrainer {
  userId: number;
  trainerName: string;
  level: number;
  experience: number;
  pokemonCaptured: number;
  badges: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  profile: {
    id: number;
    trainerName: string | null;
    username: string | null;
    bio: string | null;
    avatarUrl: string | null;
    trainerLevel: number;
  } | null;
}
