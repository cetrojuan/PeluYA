# Turnify · Frontend

React 19 + TypeScript + Vite, organizado con **MVVM** y pensado para compartir la lógica con la futura app de **React Native**.

## Estructura

```
src/
├── main.tsx            arranque de la web (configura la API y monta <App/>)
├── core/               ← NO depende del navegador: se reusa tal cual en React Native
│   ├── models/         Model: tipos de datos (User, Appointment, …)
│   ├── api/            Model: llamadas a la API (authApi, appointmentsApi, …)
│   ├── viewmodels/     ViewModel: un hook por pantalla con estado y acciones
│   └── utils/          formatos (moneda, fechas, estados)
└── web/                ← solo web (React DOM + CSS)
    ├── App.tsx         elige qué pantalla mostrar
    ├── layout/         Header, Sidebar, aviso, encabezado de página
    ├── pages/          View: una pantalla por archivo
    ├── components/     piezas reutilizables (Field, Stat, Empty…)
    └── styles.css
```

## MVVM en dos líneas

- **View** (`web/pages/X.tsx`): solo dibuja y llama al ViewModel. No hace `fetch` ni tiene reglas.
- **ViewModel** (`core/viewmodels/useXViewModel.ts`): estado de la pantalla + acciones (`save`, `book`, `cancel`…).
- **Model** (`core/models` + `core/api`): los datos y cómo se piden al back.

```tsx
// web/pages/ServicesPage.tsx (View)
const vm = useServicesViewModel();
<button onClick={() => vm.startEditing(service)}>Editar</button>
```

Para la app móvil se escriben vistas nuevas (`<View>`, `<Text>`, `<Pressable>`) que usan **los mismos ViewModels**.

## Reglas para mantener `core/` compatible con React Native

`npm run check:core` (corre solo en el build) falla si `src/core` usa:
`react-dom`, `window`, `document`, `localStorage`, `FormData`, `import.meta.env`, etiquetas HTML o algo de `web/`.

- Los formularios web leen sus campos con `web/utils/formData.ts` y le pasan **objetos tipados** al ViewModel.
- La URL de la API se configura una vez con `configureHttp({ baseUrl })` (web: `main.tsx`).
- Confirmaciones (`confirm(...)`) y navegación visual quedan en las Views.

## Alias

`@/` apunta a `src/`: `import { useApp } from '@/core/viewmodels'`.
Dentro de `core/` se usan imports relativos, así la carpeta se puede mover a un paquete compartido sin cambios.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | servidor de desarrollo en http://localhost:5173 (proxy de `/api` al back) |
| `npm run build` | chequea `core`, tipos y genera `dist/` |
| `npm run typecheck` | solo tipos |
| `npm run check:core` | verifica que `core/` no use nada del navegador |

## Próximo cuatrimestre (React Native)

1. Mover `src/core` a `packages/core` y usarlo desde `apps/web` y `apps/mobile` (npm workspaces).
2. Crear `apps/mobile` con Expo y escribir las Views nativas sobre los mismos ViewModels.
3. En el back, sumar login con token para el celular (la cookie + CSRF es para navegador).
