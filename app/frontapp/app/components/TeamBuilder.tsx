"use client";
import { useState, type FormEvent } from "react";
import { api, type Team, type Capture } from "../lib/api";
import { useResource } from "../lib/use-resource";
import Modal from "./Modal";
import { Types } from "./PokemonCard";
function TeamForm({
  team,
  captures,
  onClose,
  onSaved,
}: {
  team: Team | null;
  captures: Capture[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<number[]>(
      team?.teamPokemon.map((p) => p.capturedPokemonId) ?? [],
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api(team ? `/teams/${team.id}` : "/teams", {
        method: team ? "PATCH" : "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          description: form.get("description"),
          isActive: form.get("isActive") === "on",
          capturedPokemonIds: selected,
        }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={team ? "Editar equipe" : "Criar equipe"}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form className="pk-form" onSubmit={submit}>
        {error && (
          <p className="pk-notice" role="alert">
            {error}
          </p>
        )}
        <label>
          Nome da equipe
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={team?.name ?? ""}
          />
        </label>
        <label>
          Descrição
          <textarea
            aria-label="Descrição"
            name="description"
            maxLength={500}
            defaultValue={team?.description ?? ""}
          />
        </label>
        <label className="pk-checkbox">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={team?.isActive}
          />{" "}
          Definir como equipe principal
        </label>
        <p>Pokémon da equipe · {selected.length}/6</p>
        <div className="pk-team-select">
          {captures.map((c) => (
            <label
              key={c.id}
              className={selected.includes(c.id) ? "selected" : ""}
            >
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                disabled={!selected.includes(c.id) && selected.length >= 6}
                onChange={(e) =>
                  setSelected((ids) =>
                    e.target.checked
                      ? [...ids, c.id]
                      : ids.filter((id) => id !== c.id),
                  )
                }
              />
              {c.pokemon.spriteUrl && <img src={c.pokemon.spriteUrl} alt="" />}
              <strong className="capitalize">
                {c.nickname || c.pokemon.name}
              </strong>
              <small>Nv. {c.level}</small>
            </label>
          ))}
        </div>
        {captures.length === 0 && (
          <p>Capture Pokémon antes de adicionar integrantes à equipe.</p>
        )}
        <div className="pk-modal-actions">
          <button
            type="button"
            className="pk-button secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button className="pk-button" disabled={busy}>
            {busy ? "Salvando…" : "Salvar equipe"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export default function TeamBuilder() {
  const teams = useResource<Team[]>("/teams"),
    captures = useResource<Capture[]>("/captured-pokemon");
  const [editing, setEditing] = useState<Team | null | undefined>(undefined),
    [deleting, setDeleting] = useState<Team | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/teams/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      teams.reload();
      setMessage("Equipe excluída.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao excluir.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="pk-eyebrow">ESTRATÉGIA</p>
      <div className="pk-section-heading">
        <div>
          <h1>Minhas Equipes</h1>
          <p>Crie formações equilibradas com seus Pokémon capturados.</p>
        </div>
        <button className="pk-button" onClick={() => setEditing(null)}>
          ＋ Criar equipe
        </button>
      </div>
      {message && (
        <p role="status" className="pk-notice">
          {message}
        </p>
      )}
      {teams.loading ? (
        <p role="status">Carregando equipes…</p>
      ) : teams.error ? (
        <p role="alert">
          {teams.error} <button onClick={teams.reload}>Tentar novamente</button>
        </p>
      ) : (
        <>
          <p>
            {teams.data?.length ?? 0} equipes · até seis Pokémon por formação
          </p>
          {teams.data?.map((team) => {
            const members = team.teamPokemon;
            const average = members.length
              ? Math.round(
                  members.reduce((sum, p) => sum + p.capturedPokemon.level, 0) /
                    members.length,
                )
              : 0;
            const types = new Set(
              members.flatMap((p) =>
                [
                  p.capturedPokemon.pokemon.type,
                  p.capturedPokemon.pokemon.type2,
                ].filter(Boolean),
              ),
            );
            return (
              <article className="pk-panel pk-team" key={team.id}>
                <div className="pk-section-heading">
                  <div>
                    {team.isActive && (
                      <span className="pk-main-tag">☆ EQUIPE PRINCIPAL</span>
                    )}
                    <h2>{team.name}</h2>
                    <p>{team.description}</p>
                  </div>
                  <div className="pk-actions">
                    <button
                      className="pk-button secondary"
                      onClick={() => setEditing(team)}
                    >
                      ✎ Editar equipe
                    </button>
                    <button
                      className="pk-icon-button danger"
                      aria-label={`Excluir ${team.name}`}
                      onClick={() => setDeleting(team)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="pk-team-members">
                  {members.map((member) => (
                    <div
                      key={member.capturedPokemonId}
                      className={`bg-${member.capturedPokemon.pokemon.type}`}
                    >
                      {member.capturedPokemon.pokemon.spriteUrl && (
                        <img
                          src={member.capturedPokemon.pokemon.spriteUrl}
                          alt={member.capturedPokemon.pokemon.name}
                        />
                      )}
                      <strong className="capitalize">
                        {member.capturedPokemon.nickname ||
                          member.capturedPokemon.pokemon.name}
                      </strong>
                      <small>Nv. {member.capturedPokemon.level}</small>
                      <Types pokemon={member.capturedPokemon.pokemon} />
                    </div>
                  ))}
                </div>
                {members.length === 0 && (
                  <p>
                    Equipe sem integrantes. Edite para escolher suas capturas.
                  </p>
                )}
                <div className="pk-team-summary">
                  <span>
                    Nível médio <strong>{average}</strong>/100
                  </span>
                  <meter min={0} max={100} value={average} />
                  <span>
                    <strong>{types.size}</strong> tipos na equipe
                  </span>
                </div>
              </article>
            );
          })}
          {teams.data?.length === 0 && (
            <p className="pk-notice">Você ainda não criou uma equipe.</p>
          )}
        </>
      )}
      {editing !== undefined &&
        (captures.loading ? (
          <p role="status">Carregando capturas…</p>
        ) : captures.error ? (
          <p role="alert">
            {captures.error}
            <button onClick={captures.reload}>Tentar novamente</button>
          </p>
        ) : (
          <TeamForm
            team={editing}
            captures={captures.data ?? []}
            onClose={() => setEditing(undefined)}
            onSaved={() => {
              teams.reload();
              setMessage("Equipe salva com sucesso.");
            }}
          />
        ))}
      {deleting && (
        <Modal
          title="Excluir equipe?"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <p>Os Pokémon continuarão na sua coleção.</p>
          <div className="pk-modal-actions">
            <button
              className="pk-button secondary"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </button>
            <button className="pk-button" disabled={busy} onClick={remove}>
              {busy ? "Excluindo…" : "Excluir equipe"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
