'use client';
import { useEffect, useMemo, useState } from 'react'; import { supabase } from '@/lib/supabaseClient'; import { currencyCOP } from '@/lib/utils';
function consumo(row:any,size:10|15){ return (row[`inicial_${size}`]||0)+(row[`entradas_${size}`]||0)-(row[`final_${size}`]||0) }
export default function Vasos(){
  const [fecha,setFecha]=useState<string>(new Date().toISOString().slice(0,10)); const [row,setRow]=useState<any|null>(null);
  const [summary,setSummary]=useState<any|null>(null);
  useEffect(()=>{ (async()=>{ const {data}=await supabase.from('vasos_dia').select('*').eq('fecha',fecha).maybeSingle(); setRow(data||{fecha,inicial_10:0,entradas_10:0,final_10:0,inicial_15:0,entradas_15:0,final_15:0}); const {data: s}=await supabase.rpc('resumen_vasos_por_fecha',{p_fecha:fecha}); setSummary(s?.[0]||null); })(); },[fecha]);
  const save=async()=>{ const {data,error}=await supabase.from('vasos_dia').upsert(row,{onConflict:'fecha'}).select('*').single(); if(!error){ setRow(data); alert('Guardado ✓') } }
  const dif10 = useMemo(()=> (row? consumo(row,10):0) - ((summary?.vasos10_vendidos||0)+(summary?.vasos10_cortesias||0)),[row,summary])
  const dif15 = useMemo(()=> (row? consumo(row,15):0) - ((summary?.vasos15_vendidos||0)+(summary?.vasos15_cortesias||0)),[row,summary])
  const [ingresoDinero,setIngresoDinero] = useState<number>(0);
  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from('venta_tx').select('total, sku:sku_id(grupo_vaso)').eq('fecha',fecha);
    const totalTx = (data||[]).filter((r:any)=> r.sku?.grupo_vaso==='VASO10' || r.sku?.grupo_vaso==='VASO15').reduce((a:any,b:any)=>a+(b.total||0),0);
    setIngresoDinero(totalTx||0);
  })(); },[fecha]);
  return (<main className="max-w-5xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-semibold">Control de Vasos</h1>
    <div className="grid md:grid-cols-3 gap-4 p-4 rounded-2xl border bg-yellow-50">
      <div className="flex flex-col"><label className="text-xs">Fecha</label><input className="px-2 py-1 border rounded" type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/></div>
      <div className="md:col-span-2 text-sm text-neutral-600 flex items-end">La app calcula consumo y cruza con ventas Tx + cortesías.</div>
      {[10,15].map((size:any)=>(<div key={size} className="p-4 rounded-2xl border bg-white">
        <h2 className="font-medium mb-2">Vasos {size}k</h2>
        <div className="grid grid-cols-3 gap-2">
          <Num label="Inicial" value={row?.[`inicial_${size}`]||0} onChange={(v)=>setRow({...row,[`inicial_${size}`]:v})} />
          <Num label="Entradas" value={row?.[`entradas_${size}`]||0} onChange={(v)=>setRow({...row,[`entradas_${size}`]:v})} />
          <Num label="Final" value={row?.[`final_${size}`]||0} onChange={(v)=>setRow({...row,[`final_${size}`]:v})} />
        </div>
        <div className="text-sm mt-3">Diferencia estimada {size}k: <b>{size===10? dif10: dif15}</b></div>
      </div>))}
      <div className="flex items-end"><button onClick={save} className="px-4 py-2 rounded-xl bg-neutral-900 text-white">Guardar</button></div>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl border bg-white"><h3 className="font-medium mb-2">Ventas vinculadas a vasos</h3>
        <ul className="text-sm space-y-1">
          <li>Vendidos 10k: <b>{summary?.vasos10_vendidos||0}</b></li>
          <li>Cortesías 10k: <b>{summary?.vasos10_cortesias||0}</b></li>
          <li>Vendidos 15k: <b>{summary?.vasos15_vendidos||0}</b></li>
          <li>Cortesías 15k: <b>{summary?.vasos15_cortesias||0}</b></li>
        </ul>
      </div>
      <div className="p-4 rounded-2xl border bg-white"><h3 className="font-medium mb-2">Estimación de ventas en dinero</h3>
        <div className="text-2xl font-semibold">{currencyCOP(ingresoDinero)}</div>
        <div className="text-xs text-neutral-500 mt-1">Se calcula con las ventas Tx de SKUs grupo VASO10/15 del día.</div>
      </div>
    </div>
  </main>);
}
function Num({label,value,onChange}:{label:string; value:number; onChange:(v:number)=>void}){ return (<div className="flex flex-col"><label className="text-xs">{label}</label><input className="px-2 py-1 border rounded" type="number" min={0} value={value} onChange={e=>onChange(Number(e.target.value))}/></div>) }
