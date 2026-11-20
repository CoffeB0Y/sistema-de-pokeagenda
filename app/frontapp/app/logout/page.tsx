"use client";
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { clearToken } from '../login/auth_service';
export default function Logout() {
  const router=useRouter(); const [error,setError]=useState('');
  const logout=useCallback(()=>api('/auth/logout',{method:'POST'}).then(()=>{clearToken();router.replace('/');},(e:unknown)=>{setError(e instanceof Error?e.message:'Não foi possível encerrar a sessão.');}),[router]);
  useEffect(()=>{void logout();},[logout]);
  return error?<div className="pk-notice" role="alert">{error}<button className="pk-button secondary" onClick={()=>void logout()}>Tentar novamente</button></div>:<p className="pk-notice" role="status">Encerrando sessão…</p>;
}
