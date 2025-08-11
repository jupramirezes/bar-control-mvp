-- 04_monthly.sql — utilidades mensuales + distribución a socios
create or replace function utilidad_neta_mensual(p_mes date)
returns table (
  mes date, vtd numeric, bancos numeric, gastos numeric, nomina numeric, descuentos numeric, gastos_fijos numeric, efectivo_esperado numeric, utilidad_neta numeric, socios json
) language plpgsql stable as $$
declare
  v_from date := date_trunc('month', p_mes);
  v_to date := (date_trunc('month', p_mes) + interval '1 month - 1 day')::date;
  v_vtd numeric; v_bancos numeric; v_gastos numeric; v_nomina numeric; v_desc numeric; v_fijos numeric; v_efesp numeric; v_util numeric;
  socios_rows json;
begin
  select * into v_vtd, v_bancos, v_gastos, v_nomina, v_desc, v_efesp
  from kpi_resumen_rango(v_from, v_to, null) limit 1;
  select coalesce(sum(monto),0) into v_fijos from gasto_fijo_mes where mes = v_from;
  v_util := coalesce(v_efesp,0) - coalesce(v_fijos,0);

  select json_agg(json_build_object('socio_id', s.id, 'socio_nombre', s.nombre, 'porcentaje', s.porcentaje_global, 'utilidad', round(v_util * s.porcentaje_global)))
  into socios_rows
  from socio s;

  return query select v_from, coalesce(v_vtd,0), coalesce(v_bancos,0), coalesce(v_gastos,0), coalesce(v_nomina,0), coalesce(v_desc,0),
                      coalesce(v_fijos,0), coalesce(v_efesp,0), coalesce(v_util,0), coalesce(socios_rows, '[]'::json);
end$$;
