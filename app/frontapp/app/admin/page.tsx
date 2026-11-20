"use client";

import Link from "next/link";

export default function Admin() {

    return (
        <div className="container">
            <ul>
                <li>
                    <h1>Admin</h1><Link href="/dashboard">Painel do treinador</Link>
                </li>
                <li>
                    <Link href="/admin/users">Gerenciar Usuários</Link>
                </li>
                <li>
                    <Link href="/equipes">Minhas Equipes</Link>
                </li>
                <li>
                    <Link href="/logout">Logout</Link>
                </li>
            </ul>
        </div>
    );
}
