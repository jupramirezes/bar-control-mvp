import dayjs from 'dayjs';
export const currencyCOP=(v:number|null|undefined)=>typeof v==='number'?v.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}):'—';
export const fmtMonth=(d:string|Date)=>dayjs(d).startOf('month').format('YYYY-MM-01');
