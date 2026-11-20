"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { isAuthenticated, restoreSession } from '../login/auth_service';
const subscribe=(callback:()=>void)=>{window.addEventListener('auth-change',callback);window.addEventListener('storage',callback);return()=>{window.removeEventListener('auth-change',callback);window.removeEventListener('storage',callback);};};
export function Brand(){return <Link href="/" className="pk-brand"><span className="pk-ball" aria-hidden>◒</span><span>Pokédex<small>JORNADA POKÉMON</small></span></Link>;}
export default function Header(){const path=usePathname();useEffect(()=>{void restoreSession();},[]);const authenticated=useSyncExternalStore(subscribe,()=>isAuthenticated(),()=>false);return <header className="pk-header"><div className="pk-container pk-nav"><Brand/><nav aria-label="Navegação principal"><Link href="/" aria-current={path==='/'?'page':undefined}>Início</Link><Link href="/pokedex" aria-current={path==='/pokedex'?'page':undefined}>Pokédex</Link><Link href="/ranking" aria-current={path==='/ranking'?'page':undefined}>Ranking</Link></nav><div className="pk-auth-links">{authenticated?<><Link href="/dashboard">Meu painel</Link><Link className="pk-button secondary" href="/logout">Sair</Link></>:<><Link href="/login">Entrar</Link><Link className="pk-button" href="/cadastro">Criar conta</Link></>}</div></div></header>;}
