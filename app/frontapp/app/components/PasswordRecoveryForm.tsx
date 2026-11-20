"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { clearToken } from "../login/auth_service";
import { Brand } from "./Header";

export default function PasswordRecoveryForm({
  reset = false,
}: {
  reset?: boolean;
}) {
  const token = useRef("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (reset) {
      const fromHash = new URLSearchParams(window.location.hash.slice(1)).get(
        "token",
      );
      if (fromHash) token.current = fromHash;
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [reset]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    if (
      reset &&
      new TextEncoder().encode(String(form.get("password") ?? "")).length > 72
    ) {
      setError("A senha deve ter no máximo 72 bytes em UTF-8.");
      return;
    }
    if (reset && form.get("password") !== form.get("confirm")) {
      setError("As senhas devem ser iguais.");
      return;
    }
    if (reset && !/^[a-f0-9]{64}$/.test(token.current)) {
      setError("Link inválido ou expirado. Solicite uma nova recuperação.");
      return;
    }
    setBusy(true);
    try {
      const response = await api<{ message: string }>(
        reset ? "/auth/reset-password" : "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify(
            reset
              ? { token: token.current, password: form.get("password") }
              : { email: form.get("email") },
          ),
        },
      );
      if (reset) {
        clearToken();
        token.current = "";
      }
      setMessage(response.message);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível concluir a solicitação.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="pk-auth-page">
      <aside>
        <Brand />
        <div className="pk-auth-illustration">
          <span className="pk-auth-symbol" aria-hidden>
            ◒
          </span>
        </div>
        <blockquote>Continue sua jornada com segurança.</blockquote>
      </aside>
      <section>
        <Link className="pk-back" href="/login">
          ← Voltar para entrar
        </Link>
        <form className="pk-auth-form" onSubmit={submit}>
          <p className="pk-eyebrow">SUA CONTA</p>
          <h1>{reset ? "Redefinir senha" : "Recuperar senha"}</h1>
          <p>
            {reset
              ? "Escolha uma senha com pelo menos 8 caracteres e no máximo 72 bytes UTF-8."
              : "Informe seu e-mail para receber um link de recuperação válido por 15 minutos."}
          </p>
          {error && (
            <p className="pk-notice" role="alert">
              {error}
            </p>
          )}
          {message ? (
            <>
              <p className="pk-notice" role="status">
                {message}
              </p>
              <Link className="pk-button" href="/login">
                Voltar para entrar
              </Link>
            </>
          ) : (
            <>
              {reset ? (
                <>
                  <label>
                    Nova senha
                    <input
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </label>
                  <label>
                    Confirmar nova senha
                    <input
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </label>
                </>
              ) : (
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
              )}
              <button className="pk-button" disabled={busy}>
                {busy
                  ? "Aguarde…"
                  : reset
                    ? "Salvar nova senha"
                    : "Enviar instruções"}
              </button>
            </>
          )}
          {reset && (
            <p>
              <Link href="/recuperar-senha">Solicitar outro link</Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
