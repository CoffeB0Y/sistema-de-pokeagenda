import PublicTrainerLayout from "../../components/PublicTrainerLayout";
import PokemonDetails from "../../components/PokemonDetails";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PublicTrainerLayout>
      <PokemonDetails id={id} />
    </PublicTrainerLayout>
  );
}
