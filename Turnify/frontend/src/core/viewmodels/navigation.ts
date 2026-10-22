import type { Role } from '../models/types';

// Pantallas de la app. En web se muestran según `page`; en móvil serán las rutas del navegador de pantallas.
export type Page =
  | 'home' | 'login' | 'register'
  | 'dashboard' | 'appointments' | 'profile' | 'security'
  | 'services' | 'availability' | 'business'
  | 'explore' | 'booking';

export interface NavItem { page: Page; icon: string; label: string }

const PROFESSIONAL_NAV: NavItem[] = [
  { page: 'dashboard', icon: '◈', label: 'Resumen' },
  { page: 'appointments', icon: '▦', label: 'Agenda de turnos' },
  { page: 'services', icon: '◇', label: 'Mis servicios' },
  { page: 'availability', icon: '◷', label: 'Horarios' },
  { page: 'business', icon: '▤', label: 'Negocio y cobros' },
  { page: 'profile', icon: '◎', label: 'Mi perfil' },
  { page: 'security', icon: '♧', label: 'Seguridad' },
];

const CLIENT_NAV: NavItem[] = [
  { page: 'dashboard', icon: '◈', label: 'Resumen' },
  { page: 'explore', icon: '⌕', label: 'Buscar profesionales' },
  { page: 'appointments', icon: '▦', label: 'Mis turnos' },
  { page: 'profile', icon: '◎', label: 'Mi perfil' },
  { page: 'security', icon: '♧', label: 'Seguridad' },
];

export const navigationFor = (role: Role) => (role === 'PROFESSIONAL' ? PROFESSIONAL_NAV : CLIENT_NAV);
