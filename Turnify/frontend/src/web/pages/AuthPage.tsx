import { useAuthViewModel, type AuthMode } from '@/core/viewmodels';
import type { RegisterInput } from '@/core/models/types';
import { Field } from '@/web/components/Field';
import { readForm } from '@/web/utils/formData';

export function AuthPage({ mode }: { mode: AuthMode }) {
  const vm = useAuthViewModel(mode);
  const isLogin = mode === 'login';

  return (
    <div className="auth-layout">
      <section className="auth-story">
        <span className="eyebrow">UN ESPACIO PARA VOS</span>
        <h1>
          Tu tiempo,
          <br />
          <em>mejor organizado.</em>
        </h1>
        <p>Reservá tu próxima experiencia o gestioná tu negocio desde un solo lugar.</p>
        <div className="story-card">
          <span>◷</span>
          <div>
            <b>Todo a tu ritmo</b>
            <p>Turnos, servicios y clientes, siempre en orden.</p>
          </div>
        </div>
      </section>
      <section className="panel auth-panel">
        <span className="eyebrow">BIENVENIDO A TURNIFY</span>
        <h2>{isLogin ? 'Qué bueno verte de nuevo' : 'Empezá con tu cuenta'}</h2>
        <p className="muted">{isLogin ? 'Ingresá para acceder a tu panel.' : 'Elegí cómo querés usar Turnify.'}</p>
        <form key={mode} onSubmit={(e) => vm.submit(readForm<RegisterInput & { confirm: string }>(e))}>
          {!isLogin && (
            <>
              <div className="role-picker">
                <label>
                  <input type="radio" name="role" value="CLIENT" defaultChecked />
                  <b>◎ Cliente</b>
                  <small>Quiero reservar turnos</small>
                </label>
                <label>
                  <input type="radio" name="role" value="PROFESSIONAL" />
                  <b>◇ Profesional</b>
                  <small>Quiero gestionar mi negocio</small>
                </label>
              </div>
              <Field label="Nombre completo" name="name" required minLength={2} autoComplete="name" />
              <Field label="Teléfono (opcional)" name="phone" type="tel" maxLength={30} autoComplete="tel" />
            </>
          )}
          <Field label="Email" name="email" type="email" required maxLength={254} autoComplete="email" />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            required
            minLength={isLogin ? 1 : 12}
            maxLength={72}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          {!isLogin && (
            <>
              <small>Al menos 12 caracteres, mayúscula, minúscula y número.</small>
              <Field
                label="Repetir contraseña"
                name="confirm"
                type="password"
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
              />
            </>
          )}
          <button disabled={vm.pending}>
            {vm.pending ? 'Procesando…' : isLogin ? 'Ingresar a mi panel →' : 'Crear mi cuenta →'}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? '¿Todavía no tenés cuenta?' : '¿Ya tenés una cuenta?'}{' '}
          <button className="link" onClick={vm.switchMode}>
            {isLogin ? 'Registrate' : 'Ingresá'}
          </button>
        </p>
      </section>
    </div>
  );
}
