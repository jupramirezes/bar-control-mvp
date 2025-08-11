export const metadata = { title: 'Control de Bar — MVP v1.1', description: 'Control de ventas, cierres, vasos y reportes' };
import './globals.css'; import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es"><body className={inter.className + ' bg-neutral-50 text-neutral-900'}>{children}</body></html>);
}