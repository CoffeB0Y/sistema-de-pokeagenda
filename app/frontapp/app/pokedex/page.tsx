import Catalog from "../components/Catalog";
import PublicTrainerLayout from "../components/PublicTrainerLayout";
export default function Page() {
  return (
    <PublicTrainerLayout>
      <p className="pk-eyebrow">EXPLORE O MUNDO POKÉMON</p>
      <h1>Pokédex de Kanto</h1>
      <p>
        Descubra características, habilidades e evoluções das 151 espécies de
        Kanto.
      </p>
      <Catalog />
    </PublicTrainerLayout>
  );
}
