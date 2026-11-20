"use client";
import {useCallback,useEffect,useState} from 'react';
import {api} from './api';
export function useResource<T>(path:string){const[data,setData]=useState<T|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);const reload=useCallback(()=>setVersion(v=>v+1),[]);useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active){setLoading(true);setError('');}});api<T>(path).then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[path,version]);return {data,error,loading,reload};}
