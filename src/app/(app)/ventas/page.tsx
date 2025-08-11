'use client';
import { useEffect, useState } from 'react'; import { supabase } from '@/lib/supabaseClient'; import { currencyCOP } from '@/lib/utils';
export default function Ventas(){
  const [puntos,setPuntos]=useState<any[]>([]); const [medios,setMedios]=useState<any[]>([]); const [cajeros,setCajeros]=useState<any[]>([]); const [skus,setSkus]=useState<any[]>([]);
  const [list,setList]=useState<any[]>([]); const [saved,setSaved]=useState<string>('');
  const [form,setForm]=useState<any>({ fecha:new Date().toISOString().slice(0,10), hora:new Date().toTimeString().slice(0,5), punto_id:'', cajero_id:'', sku_id:'', cantidad:1, precio_unitario:0, medio_pago_id:'', nota:'' });
  useEffect(()=>{(async()=>{
    const [{data:p},{data:m},{data:c},{data:s}] = await Promise.all([
      supabase.from('punto').select('*').eq('activo',true).order('nombre'),
      supabase.from('medio_pago').select('*').eq('activo',true).order('nombre'),
      supabase.from('cajero').select('*').eq('activo',true).order('nombre'),
      supabase.from('sku').select('*').eq('activo',true).order('nombre')
    ]); setPuntos(p||[]); setMedios(m||[]); setCajeros(c||[]); setSkus(s||[]);
  })();},[]);
  const onSku=(id:string)=>{ const s=skus.find((x:any)=>x.id===id); setForm((f:any)=>({...f, sku_id:id, precio_unitario:s?.precio_vigente||0})) }
  const save=async()=>{
    if(!form.punto_id||!form.sku_id||!form.medio_pago_id) return alert('Completa punto, SKU y medio.');
    const payload={...form,cantidad:Number(form.cantidad),precio_unitario:Number(form.precio_unitario)};
    const {data,error}=await supabase.from('venta_tx').insert(payload).select('*, sku(nombre), punto(nombre), medio_pago(nombre)').single();
    if(error){console.error(error); alert('Error'); return;}
    setList(l=>[data,...l].slice(0,100)); setSaved(`Guardado ✓ ${new Date().toLocaleTimeString()}`);
  };
  return (<main className="max-w-6xl mx-auto p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Ventas (Tx/POS)</h1>
    <div className="text-xs text-green-700 h-4">{saved}</div>
    <div className="grid md:grid-cols-4 gap-4 p-4 rounded-2xl border bg-yellow-50">
      <input className="px-2 py-1 border rounded" type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/>
      <input className="px-2 py-1 border rounded" type="time" value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})}/>
      <select className="px-2 py-1 border rounded" value={form.punto_id} onChange={e=>setForm({...form,punto_id:e.target.value})}><option value="">Punto</option>{puntos.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
      <select className="px-2 py-1 border rounded" value={form.cajero_id} onChange={e=>setForm({...form,cajero_id:e.target.value})}><option value="">Cajero</option>{cajeros.map((c:any)=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
      <select className="px-2 py-1 border rounded" value={form.sku_id} onChange={e=>onSku(e.target.value)}><option value="">SKU</option>{skus.map((s:any)=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
      <input className="px-2 py-1 border rounded" type="number" min={1} value={form.cantidad} onChange={e=>setForm({...form,cantidad:e.target.value})} placeholder="Cantidad"/>
      <input className="px-2 py-1 border rounded" type="number" min={0} value={form.precio_unitario} onChange={e=>setForm({...form,precio_unitario:e.target.value})} placeholder="Precio"/>
      <select className="px-2 py-1 border rounded" value={form.medio_pago_id} onChange={e=>setForm({...form,medio_pago_id:e.target.value})}><option value="">Medio</option>{medios.map((m:any)=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
      <input className="px-2 py-1 border rounded md:col-span-3" placeholder="Nota" value={form.nota} onChange={e=>setForm({...form,nota:e.target.value})}/>
      <div><button onClick={save} className="px-4 py-2 rounded-xl bg-neutral-900 text-white">Guardar</button></div>
    </div>
    <div className="p-4 rounded-2xl border bg-white">
      <h2 className="font-medium mb-2">Registros recientes</h2>
      <table className="min-w-full text-sm"><thead><tr className="border-b"><th className="py-2 pr-4">Fecha</th><th className="py-2 pr-4">Punto</th><th className="py-2 pr-4">SKU</th><th className="py-2 pr-4">Cant</th><th className="py-2 pr-4">Precio</th><th className="py-2 pr-4">Total</th></tr></thead>
      <tbody>{list.map((r:any)=>(<tr key={r.id} className="border-b"><td className="py-2 pr-4">{r.fecha}</td><td className="py-2 pr-4">{r.punto?.nombre||r.punto_id?.slice(0,6)}</td><td className="py-2 pr-4">{r.sku?.nombre||r.sku_id?.slice(0,6)}</td><td className="py-2 pr-4">{r.cantidad}</td><td className="py-2 pr-4">{currencyCOP(r.precio_unitario)}</td><td className="py-2 pr-4">{currencyCOP(r.total)}</td></tr>))}</tbody></table>
    </div>
  </main>);
}