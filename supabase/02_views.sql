-- 02_views.sql — Vistas/RPC
create or replace view v_bancos_por_dia_punto as select fecha, punto_id, sum(total)::numeric as bancos from venta_tx group by 1,2;
create or replace view v_gasto_por_dia_punto as select fecha, punto_id, coalesce(sum(monto),0)::numeric as gastos from gasto group by 1,2;
create or replace view v_nomina_por_dia_punto as select fecha, punto_id, coalesce(sum(monto),0)::numeric as nomina from nomina group by 1,2;
create or replace view v_descuento_por_dia_punto as select fecha, punto_id, coalesce(sum(monto),0)::numeric as descuentos from descuento group by 1,2;
create or replace function resumen_cierre_por_dia_punto(p_fecha date, p_punto_id uuid)
returns table (fecha date, punto_id uuid, vtd numeric, bancos numeric, gastos numeric, nomina numeric, descuentos numeric) language sql stable as $$
  select vtd.fecha, vtd.punto_id, vtd.total_venta_dia as vtd, coalesce(b.bancos,0), coalesce(g.gastos,0), coalesce(n.nomina,0), coalesce(d.descuentos,0)
  from venta_total_dia vtd
  left join v_bancos_por_dia_punto b on b.fecha=vtd.fecha and b.punto_id=vtd.punto_id
  left join v_gasto_por_dia_punto g on g.fecha=vtd.fecha and g.punto_id=vtd.punto_id
  left join v_nomina_por_dia_punto n on n.fecha=vtd.fecha and n.punto_id=vtd.punto_id
  left join v_descuento_por_dia_punto d on d.fecha=vtd.fecha and d.punto_id=vtd.punto_id
  where vtd.fecha=p_fecha and vtd.punto_id=p_punto_id;
$$;
create or replace function resumen_vasos_por_fecha(p_fecha date)
returns table (fecha date, vasos10_vendidos int, vasos10_cortesias int, vasos15_vendidos int, vasos15_cortesias int) language sql stable as $$
  with tx as (
    select vt.fecha,
      sum(case when s.grupo_vaso='VASO10' then vt.cantidad else 0 end)::int as v10,
      sum(case when s.grupo_vaso='VASO15' then vt.cantidad else 0 end)::int as v15
    from venta_tx vt join sku s on s.id=vt.sku_id where vt.fecha=p_fecha group by 1),
  cortesias as (
    select d.fecha,
      sum(case when s.grupo_vaso='VASO10' then coalesce(d.cantidad,0) else 0 end)::int as c10,
      sum(case when s.grupo_vaso='VASO15' then coalesce(d.cantidad,0) else 0 end)::int as c15
    from descuento d left join sku s on s.id=d.sku_id where d.fecha=p_fecha and d.tipo='Cortesia' group by 1)
  select p_fecha, coalesce(tx.v10,0), coalesce(c.c10,0), coalesce(tx.v15,0), coalesce(c.c15,0) from (select 1) z left join tx on true left join cortesias c on true;
$$;
create or replace function kpi_resumen_rango(p_from date, p_to date, p_punto uuid default null)
returns table (vtd numeric, bancos numeric, gastos numeric, nomina numeric, descuentos numeric, efectivo_esperado numeric) language sql stable as $$
  with base as (select vtd.fecha, vtd.punto_id, vtd.total_venta_dia from venta_total_dia vtd where vtd.fecha between p_from and p_to and (p_punto is null or vtd.punto_id=p_punto)),
  b as (select fecha,punto_id,sum(total)::numeric as bancos from venta_tx where fecha between p_from and p_to and (p_punto is null or punto_id=p_punto) group by 1,2),
  g as (select fecha,punto_id,sum(monto)::numeric as gastos from gasto where fecha between p_from and p_to and (p_punto is null or punto_id=p_punto) group by 1,2),
  n as (select fecha,punto_id,sum(monto)::numeric as nomina from nomina where fecha between p_from and p_to and (p_punto is null or punto_id=p_punto) group by 1,2),
  d as (select fecha,punto_id,sum(monto)::numeric as descuentos from descuento where fecha between p_from and p_to and (p_punto is null or punto_id=p_punto) group by 1,2)
  select coalesce(sum(base.total_venta_dia),0), coalesce(sum(b.bancos),0), coalesce(sum(g.gastos),0), coalesce(sum(n.nomina),0), coalesce(sum(d.descuentos),0),
         coalesce(sum(base.total_venta_dia),0) - coalesce(sum(b.bancos),0) - coalesce(sum(g.gastos),0) - coalesce(sum(n.nomina),0) - coalesce(sum(d.descuentos),0)
  from base left join b on b.fecha=base.fecha and b.punto_id=base.punto_id
            left join g on g.fecha=base.fecha and g.punto_id=base.punto_id
            left join n on n.fecha=base.fecha and n.punto_id=base.punto_id
            left join d on d.fecha=base.fecha and d.punto_id=base.punto_id;
$$;
