"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResource } from "../lib/use-resource";
import type { Details } from "../lib/api";
import { isAuthenticated } from "../login/auth_service";
import { Types } from "./PokemonCard";
import CaptureModal from "./CaptureModal";
const labels: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque especial",
  "special-defense": "Defesa especial",
  speed: "Velocidade",
};
export default function PokemonDetails({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<Details>(
    `/pokemon/${encodeURIComponent(id)}`,
  );
  const [capture, setCapture] = useState(false),
    [saved, setSaved] = useState(false);
  const router = useRouter();
  if (loading)
    return (
      <p className="pk-notice" role="status">
        Consultando os dados da espécie…
      </p>
    );
  if (error || !data)
    return (
      <div className="pk-notice" role="alert">
        {error}
        <button onClick={reload} className="pk-button secondary">
          Tentar novamente
        </button>
      </div>
    );
  return (
    <>
      <p className="pk-breadcrumb">
        <Link href="/">Início</Link> › <Link href="/pokedex">Pokédex</Link> ›{" "}
        <span className="capitalize">{data.name}</span>
      </p>
      <article className="pk-species pk-panel">
        <div className={`pk-species-art bg-${data.type}`}>
          <span>#{String(data.pokedexNumber).padStart(3, "0")}</span>
          {data.spriteUrl && <img src={data.spriteUrl} alt={data.name} />}
        </div>
        <div className="pk-species-info">
          <p className="pk-eyebrow">CONHEÇA A ESPÉCIE</p>
          <h1 className="capitalize">{data.name}</h1>
          <Types pokemon={data} />
          <p>{data.description ?? "Descrição indisponível na PokéAPI."}</p>
          <div className="pk-species-facts">
            <div>
              <small>ALTURA</small>
              <strong>{data.height / 10} m</strong>
            </div>
            <div>
              <small>PESO</small>
              <strong>{data.weight / 10} kg</strong>
            </div>
            <div>
              <small>HABILIDADES</small>
              <strong className="capitalize">{data.ability}</strong>
            </div>
          </div>
          <button
            className="pk-button"
            onClick={() => {
              if (!isAuthenticated()) {
                router.push(`/login?next=/pokedex/${id}`);
                return;
              }
              setCapture(true);
            }}
          >
            ◒ Capturar Pokémon
          </button>
          <small>Entre na sua conta para registrar uma captura.</small>
          {saved && (
            <p role="status">
              Captura registrada!{" "}
              <Link href="/meus-pokemon">Ver minha coleção</Link>
            </p>
          )}
        </div>
      </article>
      <div className="pk-details-bottom">
        <section className="pk-panel">
          <h2>Estatísticas base</h2>
          {data.stats.map((stat) => (
            <div className="pk-stat" key={stat.name}>
              <span>{labels[stat.name] ?? stat.name}</span>
              <strong>{stat.value}</strong>
              <meter min={0} max={255} value={stat.value}>
                {stat.value}
              </meter>
            </div>
          ))}
        </section>
        <section className="pk-panel">
          <h2>Linha evolutiva</h2>
          <div className="pk-evolutions">
            {data.evolutions.map((p) => (
              <Link href={`/pokedex/${p.pokedexNumber}`} key={p.pokedexNumber}>
                {p.spriteUrl && <img src={p.spriteUrl} alt={p.name} />}
                <strong className="capitalize">{p.name}</strong>
                <small>#{String(p.pokedexNumber).padStart(3, "0")}</small>
                <small className="capitalize">
                  {p.evolvesFrom
                    ? `Evolui de ${p.evolvesFrom}`
                    : "Forma inicial"}
                </small>
              </Link>
            ))}
          </div>
        </section>
      </div>
      {capture && (
        <CaptureModal
          pokemon={data}
          onClose={() => setCapture(false)}
          onSaved={() => setSaved(true)}
        />
      )}
    </>
  );
}
