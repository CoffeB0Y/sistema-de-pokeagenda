"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type Details } from "../lib/api";
import { useResource } from "../lib/use-resource";
import { saveToken } from "../login/auth_service";
import { Brand } from "./Header";
export default function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const { data: illustration } = useResource<Details>(
    `/pokemon/${register ? 133 : 25}`,
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    if (
      new TextEncoder().encode(String(form.get("password") ?? "")).length > 72
    ) {
      setError(
        "A senha deve ter no máximo 72 bytes em UTF-8. Senhas antigas maiores precisam ser redefinidas.",
      );
      return;
    }
    if (register && form.get("password") !== form.get("confirm")) {
      setError("As senhas devem ser iguais.");
      return;
    }
    setBusy(true);
    try {
      const response = await api<{ access_token: string }>(
        register ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: form.get("email"),
            password: form.get("password"),
            ...(register
              ? { name: form.get("name") }
              : { rememberMe: form.get("remember") === "on" }),
          }),
        },
      );
      saveToken(response.access_token, form.get("remember") === "on");
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(
        next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="pk-auth-page">
      <aside>
        <Brand />
        <div className="pk-auth-illustration">
          {illustration?.spriteUrl ? (
            <img
              src={illustration.spriteUrl}
              alt={register ? "Eevee" : "Pikachu"}
            />
          ) : (
            <span className="pk-auth-symbol" aria-hidden>
              ◒
            </span>
          )}
        </div>
        <blockquote>
          “A jornada de mil batalhas começa com uma única Pokébola.”
          <small>— Professor Carvalho</small>
        </blockquote>
      </aside>
      <section>
        <Link className="pk-back" href="/">
          ← Voltar para o início
        </Link>
        <form onSubmit={submit} className="pk-auth-form">
          <p className="pk-eyebrow">
            {register ? "COMECE SUA JORNADA" : "BEM-VINDO DE VOLTA"}
          </p>
          <h1>{register ? "Crie sua conta" : "Entre na sua conta"}</h1>
          <p>
            {register
              ? "Cadastre-se gratuitamente e torne-se um treinador."
              : "Continue de onde parou em sua jornada Pokémon."}
          </p>
          {error && (
            <div className="pk-notice" role="alert">
              {error}
            </div>
          )}
          {register && (
            <label>
              Nome do treinador
              <input
                name="name"
                required
                minLength={3}
                maxLength={100}
                autoComplete="name"
                placeholder="Como devemos chamar você?"
              />
            </label>
          )}
          <label>
            E-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="treinador@exemplo.com"
            />
          </label>
          <label>
            Senha
            <div className="pk-password">
              <input
                aria-label="Senha"
                name="password"
                type={visible ? "text" : "password"}
                required
                minLength={6}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder="Sua senha"
              />
              <button
                type="button"
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>
          {register ? (
            <label>
              Confirmar senha
              <input
                name="confirm"
                type={visible ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
          ) : (
            <label className="pk-checkbox">
              <input type="checkbox" name="remember" /> Lembrar de mim neste
              dispositivo
            </label>
          )}
          <small>
            Senha de até 72 bytes UTF-8; caracteres acentuados podem ocupar mais
            de um byte.
          </small>
          <button className="pk-button" disabled={busy}>
            {busy
              ? "Aguarde…"
              : register
                ? "Criar minha conta →"
                : "Entrar na jornada →"}
          </button>
          {!register && (
            <Link href="/recuperar-senha">Esqueci minha senha</Link>
          )}
          <p className="pk-auth-switch">
            {register ? "Já possui uma conta?" : "Ainda não tem uma conta?"}{" "}
            <Link href={register ? "/login" : "/cadastro"}>
              {register ? "Entrar" : "Criar conta"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
