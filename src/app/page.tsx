'use client';
import Link from 'next/link';

export default function Home(){
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6 bg-neutral-50">
      <h1 className="text-3xl font-bold">README / Contexto</h1>
      <p className="text-sm text-neutral-600">
        MVP con Supabase: ventas (Tx), VTD, gastos/nomina/descuentos, cierres, vasos, reportes y socios.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border bg-white">
          <h2 className="font-semibold mb-2">Atajos</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/ventas" className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200">Captura Tx</Link>
            <Link href="/cierres" className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200">Cierre</Link>
            <Link href="/reportes" className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200">Reportes</Link>
            <Link href="/mensual" className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200">Mensual</Link>
            <Link href="/catalogo" className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200">Catálogo</Link>
            <Link href="/vasos" className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200">Vasos</Link>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-green-50">
          <h2 className="font-semibold mb-2">Reglas clave</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Efectivo por ventas = VTD - Bancos</li>
            <li>Efectivo esperado = (VTD - Bancos) - Gastos - Nómina - Descuentos</li>
            <li>Descuadre = Efectivo real - Efectivo esperado</li>
            <li>Cortesías con SKU de vasos suman a consumo</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
