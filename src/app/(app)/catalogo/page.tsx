'use client';
import { useEffect, useState } from 'react'; import { supabase } from '@/lib/supabaseClient';
export default function Catalogo(){
  return (<main className="max-w-6xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-semibold">Catálogo</h1>
    <Puntos /><Medios /><Cajeros /><Skus />
  </main>);
}
function Puntos(){
  const [rows,setRows]=useState<any[]>([]); const [nombre,setNombre]=useState('');
  useEffect(()=>{(async()=>{ const {data}=await supabase.from('punto').select('*').order('nombre'); setRows(data||[]) })();},[]);
  const add=async()=>{ if(!nombre) return; const {data,error}=await supabase.from('punto').insert({nombre}).select('*').single(); if(!error){ setRows(r=>[...r,data]); setNombre('') } };
  return (<section className="p-4 rounded-2xl border bg-white"><h2 className="font-medium mb-2">Puntos</h2>
    <div className="flex gap-2"><input className="px-2 py-1 border rounded" placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}/><button onClick={add} className="px-3 py-1 rounded bg-neutral-900 text-white">Agregar</button></div>
    <ul className="mt-3 text-sm">{rows.map(r=>(<li key={r.id} className="py-1 border-b">{r.nombre}</li>))}</ul>
  </section>);
}
function Medios(){
  const [rows,setRows]=useState<any[]>([]); const [nombre,setNombre]=useState('');
  useEffect(()=>{(async()=>{ const {data}=await supabase.from('medio_pago').select('*').order('nombre'); setRows(data||[]) })();},[]);
  const add=async()=>{ if(!nombre) return; const {data,error}=await supabase.from('medio_pago').insert({nombre}).select('*').single(); if(!error){ setRows(r=>[...r,data]); setNombre('') } };
  return (<section className="p-4 rounded-2xl border bg-white"><h2 className="font-medium mb-2">Medios de pago</h2>
    <div className="flex gap-2"><input className="px-2 py-1 border rounded" placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}/><button onClick={add} className="px-3 py-1 rounded bg-neutral-900 text-white">Agregar</button></div>
    <ul className="mt-3 text-sm">{rows.map(r=>(<li key={r.id} className="py-1 border-b">{r.nombre}</li>))}</ul>
  </section>);
}
function Cajeros(){
  const [rows,setRows]=useState<any[]>([]); const [nombre,setNombre]=useState('');
  useEffect(()=>{(async()=>{ const {data}=await supabase.from('cajero').select('*').order('nombre'); setRows(data||[]) })();},[]);
  const add=async()=>{ if(!nombre) return; const {data,error}=await supabase.from('cajero').insert({nombre}).select('*').single(); if(!error){ setRows(r=>[...r,data]); setNombre('') } };
  return (<section className="p-4 rounded-2xl border bg-white"><h2 className="font-medium mb-2">Cajeros</h2>
    <div className="flex gap-2"><input className="px-2 py-1 border rounded" placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}/><button onClick={add} className="px-3 py-1 rounded bg-neutral-900 text-white">Agregar</button></div>
    <ul className="mt-3 text-sm">{rows.map(r=>(<li key={r.id} className="py-1 border-b">{r.nombre}</li>))}</ul>
  </section>);
}
function Skus(){
  const [rows,setRows]=useState<any[]>([]); const [puntos,setPuntos]=useState<any[]>([]);
  const [form,setForm]=useState<any>({ codigo:'', nombre:'', categoria:'', punto_id:'', grupo_vaso:'NONE', precio_vigente:0, activo:true });
  useEffect(()=>{(async()=>{
    const [{data:s},{data:p}] = await Promise.all([
      supabase.from('sku').select('*').order('nombre'),
      supabase.from('punto').select('*').order('nombre'),
    ]); setRows(s||[]); setPuntos(p||[]);
  })();},[]);
  const add=async()=>{ if(!form.codigo||!form.nombre) return; const {data,error}=await supabase.from('sku').insert(form).select('*').single(); if(!error){ setRows(r=>[...r,data]); setForm({ codigo:'', nombre:'', categoria:'', punto_id:'', grupo_vaso:'NONE', precio_vigente:0, activo:true }) } };
  const update=async(id:string, patch:any)=>{
    const {data,error}=await supabase.from('sku').update(patch).eq('id',id).select('*').single();
    if(!error){ setRows(r=> r.map((x:any)=> x.id===id? data: x)) }
  };
  return (<section className="p-4 rounded-2xl border bg-white">
    <h2 className="font-medium mb-2">Productos (SKU)</h2>
    <div className="grid md:grid-cols-6 gap-2">
      <input className="px-2 py-1 border rounded" placeholder="Código" value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})}/>
      <input className="px-2 py-1 border rounded" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
      <input className="px-2 py-1 border rounded" placeholder="Categoría" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}/>
      <select className="px-2 py-1 border rounded" value={form.punto_id} onChange={e=>setForm({...form,punto_id:e.target.value})}><option value="">(Todos)</option>{puntos.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
      <select className="px-2 py-1 border rounded" value={form.grupo_vaso} onChange={e=>setForm({...form,grupo_vaso:e.target.value})}>
        <option value="NONE">NONE</option><option value="VASO10">VASO10</option><option value="VASO15">VASO15</option></select>
      <input className="px-2 py-1 border rounded" type="number" min={0} placeholder="Precio" value={form.precio_vigente} onChange={e=>setForm({...form,precio_vigente:Number(e.target.value)})}/>
      <button onClick={add} className="px-3 py-1 rounded bg-neutral-900 text-white md:col-span-6">Agregar</button>
    </div>
    <div className="overflow-x-auto mt-3">
      <table className="min-w-full text-sm"><thead><tr className="border-b"><th className="py-2 pr-4">Código</th><th className="py-2 pr-4">Nombre</th><th className="py-2 pr-4">Grupo vaso</th><th className="py-2 pr-4">Precio</th><th></th></tr></thead>
        <tbody>{rows.map((r:any)=>(<tr key={r.id} className="border-b">
          <td className="py-2 pr-4">{r.codigo}</td>
          <td className="py-2 pr-4"><input className="px-2 py-1 border rounded" value={r.nombre} onChange={e=>update(r.id,{nombre:e.target.value})}/></td>
          <td className="py-2 pr-4">
            <select className="px-2 py-1 border rounded" value={r.grupo_vaso} onChange={e=>update(r.id,{grupo_vaso:e.target.value})}>
              <option value="NONE">NONE</option><option value="VASO10">VASO10</option><option value="VASO15">VASO15</option>
            </select>
          </td>
          <td className="py-2 pr-4"><input className="px-2 py-1 border rounded" type="number" value={r.precio_vigente} onChange={e=>update(r.id,{precio_vigente:Number(e.target.value)})}/></td>
          <td className="py-2 pr-4"></td>
        </tr>))}</tbody>
      </table>
    </div>
  </section>);
}
