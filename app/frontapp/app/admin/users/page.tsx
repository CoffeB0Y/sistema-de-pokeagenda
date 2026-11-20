"use client";

import { api } from "@/app/lib/api";
import { clearToken } from "@/app/login/auth_service";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  passwordHash?: string;
};

export default function Users() {
  const router = useRouter();
  const [selfId, setSelfId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const API = "/users";

  const [id, setId] = useState<number | string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  function edit(user: User) {
    setId(user.id);
    setName(user.name);
    setEmail(user.email);
  }

  async function remove(userId: User["id"]) {
    if (userId !== selfId || busy) return;
    if (
      !window.confirm(
        "Excluir sua conta e seus registros? Esta ação é definitiva.",
      )
    )
      return;
    setBusy(true);
    try {
      await api(`${API}/${userId}`, { method: "DELETE" });
      clearToken();
      router.replace("/login");
    } catch {
      setError("Não foi possível excluir a conta.");
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    try {
      setUsers(await api<User[]>(API));
      setSelfId((await api<{ id: number }>("/profiles/me")).id);
    } catch {
      setError("Não foi possível carregar os usuários. Verifique a API.");
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (id === null && new TextEncoder().encode(password).length > 72) {
      setError("A senha deve ter no máximo 72 bytes em UTF-8.");
      return;
    }
    setBusy(true);
    try {
      await api(id === null ? API : `${API}/${id}`, {
        method: id === null ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          ...(id === null ? { passwordHash: password } : {}),
        }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
      setBusy(false);
      return;
    }
    setId(null);
    setPassword("");
    setName("");
    setEmail("");
    await load();
    window.dispatchEvent(new Event("profile-change"));
    setBusy(false);
  }

  useEffect(() => {
    let active = true;
    Promise.all([api<User[]>(API), api<{ id: number }>("/profiles/me")])
      .then(([list, me]) => {
        if (active) {
          setUsers(list);
          setSelfId(me.id);
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar as contas.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4">Usuários</h1>
      <p>
        Sua conta e as contas cadastradas por você. Cada treinador edita e
        exclui somente a própria conta.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={save} className="row g-3 mb-4">
        <div className="col-md-5">
          <label className="form-label" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            className="form-control"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={3}
            maxLength={100}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            className="form-control"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        {id === null && (
          <div className="col-md-5">
            <label htmlFor="new-password">Senha da nova conta</label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-control"
            />
            <small>
              Até 72 bytes UTF-8; caracteres acentuados podem ocupar mais de um
              byte.
            </small>
          </div>
        )}
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {id === null ? "Cadastrar" : "Salvar"}
          </button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="text-end">
                  {user.id === selfId ? (
                    <>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => edit(user)}
                        disabled={busy}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => void remove(user.id)}
                        disabled={busy}
                      >
                        Excluir
                      </button>
                    </>
                  ) : (
                    <small>Acesso do próprio treinador</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
