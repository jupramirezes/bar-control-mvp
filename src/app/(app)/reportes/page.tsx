'use client';
import { useEffect, useState } from 'react'; import { supabase } from '@/lib/supabaseClient'; import { currencyCOP } from '@/lib/utils';
export default function Reportes(){
  const [from,setFrom]=useState<string>(new Date().toISOString().slice(0,10));
  const [to,setTo]=useState<string>(new Date().toISOString().slice(0,10));
  const [puntos,setPuntos]=useState<any[]>([]); const [punto,setPunto]=useState<string>(''); const [kpi,setKpi]=useState<any|null>(null);
  useEffect(()=>{(async()=>{ const {data:p}=await supabase.from('punto').select('*').order('nombre'); setPuntos(p||[]) })();},[]);
  useEffect(()=>{ (async()=>{ const {data}=await supabase.rpc('kpi_resumen_rango',{p_from:from,p_to:to,p_punto: punto || null}); setKpi(data?.[0]||null); })(); },[from,to,punto]);
  return (<main className="max-w-6xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-semibold">Reportes</h1>
    <div className="flex flex-wrap gap-2 items-end">
      <div className="flex flex-col"><label className="text-xs">Desde</label><input className="px-2 py-1 border rounded" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div>
      <div className="flex flex-col"><label className="text-xs">Hasta</label><input className="px-2 py-1 border rounded" type="date" value={to} onChange={e=>setTo(e.target.value)}/></div>
      <div className="flex flex-col"><label className="text-xs">Punto</label><select className="px-2 py-1 border rounded" value={punto} onChange={e=>setPunto(e.target.value)}><option value="">Todos</option>{puntos.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
    </div>
    <section className="grid md:grid-cols-4 gap-4">
      <K label="Ventas Totales" v={currencyCOP(kpi?.vtd||0)} />
      <K label="% Bancos" v={`${kpi?.vtd? Math.round(100*(kpi?.bancos||0)/kpi?.vtd):0}%`} />
      <K label="Efectivo neto esperado" v={currencyCOP(kpi?.efectivo_esperado||0)} tone="green" />
      <K label="Gastos" v={currencyCOP(kpi?.gastos||0)} />
    </section>
  </main>);
}
function K({label,v,tone}:{label:string; v:any; tone?:'green'|'amber'|''}){ const toneCls=tone==='green'?'bg-green-50':tone==='amber'?'bg-yellow-100':'bg-white'; return (<div className={"p-4 rounded-2xl border "+toneCls}><div className="text-xs text-neutral-500">{label}</div><div className="text-xl font-semibold">{v}</div></div>) }
