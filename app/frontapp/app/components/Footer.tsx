import Link from 'next/link';
import { Brand } from './Header';
export default function Footer(){return <footer className="pk-footer"><div className="pk-container pk-footer-grid"><div><Brand/><p>Sua jornada, suas conquistas, seus Pokémon.<br/>Tudo em um só lugar.</p></div><div><strong>Explore</strong><Link href="/pokedex">Pokédex</Link><Link href="/ranking">Ranking</Link></div><div><strong>Sua jornada</strong><Link href="/cadastro">Criar conta</Link><Link href="/login">Entrar</Link></div><p>Projeto acadêmico<br/>Dados de espécies: PokéAPI</p></div></footer>;}
