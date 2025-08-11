'use client';
import { useEffect, useMemo, useState } from 'react'; import { supabase } from '@/lib/supabaseClient'; import { currencyCOP, fmtMonth } from '@/lib/utils';
export default function Mensual(){
  const [mes,setMes]=useState<string>(fmtMonth(new Date().toISOString()));
  const [gfijos,setGfijos]=useState<any[]>([]); const [socios,setSocios]=useState<any[]>([]); const [kpi,setKpi]=useState<any|null>(null);
  const [nuevo,setNuevo]=useState<any>({ concepto:'Arriendo', monto:0 });
  useEffect(()=>{ (async()=>{
    const [{data:g},{data:s},{data:k}] = await Promise.all([
      supabase.from('gasto_fijo_mes').select('*').eq('mes', mes).order('concepto'),
      supabase.from('socio').select('*').order('nombre'),
      supabase.rpc('utilidad_neta_mensual', { p_mes: mes })
    ]);
    setGfijos(g||[]); setSocios(s||[]); setKpi(k?.[0]||null);
  })(); },[mes]);
  const addFijo=async()=>{ const payload={ mes, concepto:nuevo.concepto, monto:Number(nuevo.monto) }; const {data,error}=await supabase.from('gasto_fijo_mes').upsert(payload,{onConflict:'mes,concepto'}).select('*').single(); if(!error){ setGfijos(r=>{ const i=r.findIndex((x:any)=>x.concepto===data.concepto); if(i>=0){const c=[...r]; c[i]=data; return c} return [data,...r] }); setNuevo({concepto:'',monto:0}); } };
  const delFijo=async(id:string)=>{ const {error}=await supabase.from('gasto_fijo_mes').delete().eq('id',id); if(!error) setGfijos(r=>r.filter((x:any)=>x.id!==id)) };
  const utilidad = useMemo(()=> (kpi? (kpi.utilidad_neta || 0) : 0),[kpi]);
  return (<main className="max-w-6xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-semibold">Reporte mensual</h1>
    <div className="flex gap-2 items-end"><div className="flex flex-col"><label className="text-xs">Mes</label><input className="px-2 py-1 border rounded" type="month" value={mes.slice(0,7)} onChange={e=>setMes(e.target.value+'-01')}/></div></div>
    <section className="grid md:grid-cols-3 gap-4">
      <K label="Ventas Totales (VTD)" v={currencyCOP(kpi?.vtd||0)} />
      <K label="Efectivo neto esperado" v={currencyCOP(kpi?.efectivo_esperado||0)} />
      <K label="Gastos fijos del mes" v={currencyCOP(kpi?.gastos_fijos||0)} />
      <K label="Utilidad neta" v={currencyCOP(utilidad)} tone="green" />
    </section>
    <section className="p-4 rounded-2xl border bg-white">
      <h2 className="font-medium mb-2">Gastos fijos del mes</h2>
      <div className="grid md:grid-cols-4 gap-2">
        <input className="px-2 py-1 border rounded" placeholder="Concepto" value={nuevo.concepto} onChange={e=>setNuevo({...nuevo,concepto:e.target.value})}/>
        <input className="px-2 py-1 border rounded" type="number" min={0} placeholder="Monto" value={nuevo.monto} onChange={e=>setNuevo({...nuevo,monto:Number(e.target.value)})}/>
        <button onClick={addFijo} className="px-3 py-1 rounded bg-neutral-900 text-white">Agregar/Actualizar</button>
      </div>
      <table className="min-w-full text-sm mt-3"><thead><tr className="border-b"><th className="py-2 pr-4">Concepto</th><th className="py-2 pr-4">Monto</th><th></th></tr></thead>
        <tbody>{gfijos.map((g:any)=>(<tr key={g.id} className="border-b"><td className="py-2 pr-4">{g.concepto}</td><td className="py-2 pr-4">{currencyCOP(g.monto)}</td><td><button onClick={()=>delFijo(g.id)} className="text-xs text-red-600">Eliminar</button></td></tr>))}</tbody></table>
    </section>
    <section className="p-4 rounded-2xl border bg-white">
      <h2 className="font-medium mb-2">Distribución a socios</h2>
      <table className="min-w-full text-sm"><thead><tr className="border-b"><th className="py-2 pr-4">Socio</th><th className="py-2 pr-4">% Global</th><th className="py-2 pr-4">Ganancia del mes</th></tr></thead>
        <tbody>{(kpi?.socios||[]).map((s:any)=>(<tr key={s.socio_id} className="border-b"><td className="py-2 pr-4">{s.socio_nombre}</td><td className="py-2 pr-4">{Math.round(100*(s.porcentaje||0))}%</td><td className="py-2 pr-4">{currencyCOP(s.utilidad||0)}</td></tr>))}</tbody></table>
    </section>
  </main>);
}
function K({label,v,tone}:{label:string; v:any; tone?:'green'|'amber'|''}){ const toneCls=tone==='green'?'bg-green-50':tone==='amber'?'bg-yellow-100':'bg-white'; return (<div className={"p-4 rounded-2xl border "+toneCls}><div className="text-xs text-neutral-500">{label}</div><div className="text-xl font-semibold">{v}</div></div>) }
