import { useApp } from '@/core/viewmodels';

export function Notice() {
  const { notice, setNotice } = useApp();
  if (!notice) return null;
  return (
    <div className="notice" role="status">
      <span>{notice}</span>
      <button className="ghost" aria-label="Cerrar aviso" onClick={() => setNotice('')}>
        ×
      </button>
    </div>
  );
}
