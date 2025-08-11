'use client';
import { useEffect, useMemo, useState } from 'react'; import { supabase } from '@/lib/supabaseClient'; import { currencyCOP } from '@/lib/utils';
export default function Cierres(){
  const [puntos,setPuntos]=useState<any[]>([]); const [fecha,setFecha]=useState<string>(new Date().toISOString().slice(0,10)); const [puntoId,setPuntoId]=useState<string>('');
  const [efectivoReal,setEfectivoReal]=useState<number>(0); const [obs,setObs]=useState<string>(''); const [resumen,setResumen]=useState<any|null>(null);
  useEffect(()=>{ (async()=>{ const {data:p}=await supabase.from('punto').select('*').eq('activo',true).order('nombre'); setPuntos(p||[]) })(); },[]);
  useEffect(()=>{ (async()=>{ if(!puntoId) return; const {data,error}=await supabase.rpc('resumen_cierre_por_dia_punto',{p_fecha:fecha,p_punto_id:puntoId}); if(!error) setResumen(data?.[0]||null); })(); },[fecha,puntoId]);
  const efectivoPorVentas = useMemo(()=> (resumen? (resumen.vtd||0)-(resumen.bancos||0):0),[resumen]);
  const efectivoEsperado = useMemo(()=> (resumen? efectivoPorVentas - (resumen.gastos||0) - (resumen.nomina||0) - (resumen.descuentos||0):0),[resumen,efectivoPorVentas]);
  const descuadre = useMemo(()=> Number(efectivoReal||0) - efectivoEsperado, [efectivoReal,efectivoEsperado]);
  const guardar=async()=>{ if(!puntoId) return alert('Selecciona punto'); const payload={fecha,punto_id:puntoId,efectivo_real:Number(efectivoReal),obs}; const {error}=await supabase.from('cierre_punto').upsert(payload,{onConflict:'fecha,punto_id'}); if(error){console.error(error); alert('Error');} else alert('Cierre guardado ✓'); };
  return (<main className="max-w-5xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-semibold">Cierres</h1><p className="text-sm text-neutral-600">Calcula Efectivo esperado y Descuadre por día y punto.</p>
    <div className="grid md:grid-cols-4 gap-4 p-4 rounded-2xl border bg-yellow-50">
      <input className="px-2 py-1 border rounded" type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/>
      <select className="px-2 py-1 border rounded" value={puntoId} onChange={e=>setPuntoId(e.target.value)}><option value="">Selecciona</option>{puntos.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
      <input className="px-2 py-1 border rounded" type="number" min={0} placeholder="Efectivo real contado" value={efectivoReal} onChange={e=>setEfectivoReal(Number(e.target.value))}/>
      <input className="px-2 py-1 border rounded md:col-span-2" placeholder="Observación" value={obs} onChange={e=>setObs(e.target.value)}/>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <K label="VTD" v={currencyCOP(resumen?.vtd||0)} />
      <K label="Bancos" v={currencyCOP(resumen?.bancos||0)} />
      <K label="Gastos" v={currencyCOP(resumen?.gastos||0)} />
      <K label="Nómina" v={currencyCOP(resumen?.nomina||0)} />
      <K label="Descuentos" v={currencyCOP(resumen?.descuentos||0)} />
      <K label="% Bancos" v={`${resumen?.vtd? Math.round(100*(resumen?.bancos||0)/resumen?.vtd):0}%`} />
      <K label="Efectivo esperado" v={currencyCOP(efectivoEsperado)} tone="green" />
      <K label="Efectivo real" v={currencyCOP(efectivoReal)} />
      <K label="Descuadre" v={currencyCOP(descuadre)} tone={descuadre===0? '':'amber'} />
    </div>
    <div><button onClick={guardar} className="px-4 py-2 rounded-xl bg-neutral-900 text-white">Guardar cierre</button></div>
  </main>);
}
function K({label,v,tone}:{label:string; v:any; tone?:'green'|'amber'|''}){
  const toneCls = tone==='green'? 'bg-green-50': tone==='amber'? 'bg-yellow-100': 'bg-white';
  return (<div className={"p-4 rounded-2xl border "+toneCls}><div className="text-xs text-neutral-500">{label}</div><div className="text-xl font-semibold">{v}</div></div>)
}