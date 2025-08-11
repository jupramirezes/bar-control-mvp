-- 03_seed.sql — Semillas mínimas
insert into punto (nombre) values ('Barra') on conflict do nothing;
insert into punto (nombre) values ('Granizados') on conflict do nothing;
insert into medio_pago (nombre) values ('Efectivo') on conflict do nothing;
insert into medio_pago (nombre) values ('Transferencia') on conflict do nothing;
insert into medio_pago (nombre) values ('Tarjeta') on conflict do nothing;
insert into cajero (nombre) values ('Turno 1') on conflict do nothing;
insert into cajero (nombre) values ('Turno 2') on conflict do nothing;
do $$ declare pid uuid; begin select id into pid from punto where nombre='Granizados' limit 1;
insert into sku (codigo,nombre,categoria,punto_id,grupo_vaso,precio_vigente) values ('GRA_10K','Granizado 10k','Granizados',pid,'VASO10',10000) on conflict (codigo) do nothing;
insert into sku (codigo,nombre,categoria,punto_id,grupo_vaso,precio_vigente) values ('GRA_15K','Granizado 15k','Granizados',pid,'VASO15',15000) on conflict (codigo) do nothing;
insert into sku (codigo,nombre,categoria,punto_id,grupo_vaso,precio_vigente) values ('GRA_PROMO2X','Granizado 2x','Granizados',pid,'NONE',18000) on conflict (codigo) do nothing;
end $$;
