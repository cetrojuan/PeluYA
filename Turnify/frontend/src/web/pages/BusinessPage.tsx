import { useBusinessViewModel } from '@/core/viewmodels';
import type { BusinessInput } from '@/core/models/types';
import { Field } from '@/web/components/Field';
import { readAll, readForm } from '@/web/utils/formData';

export function BusinessPage() {
  const { business, paymentMethods, acceptedMethods, pending, save } = useBusinessViewModel();
  return (
    <section className="panel form-panel">
      <h2>Tu negocio y formas de cobro</h2>
      <p className="muted">Esta información ayuda a tus clientes a encontrarte y saber cómo pagar.</p>
      <form
        onSubmit={(e) => {
          const values = readForm<BusinessInput>(e);
          save({ ...values, paymentMethods: readAll(e, 'paymentMethods') });
        }}
      >
        <div className="form-grid">
          <Field label="Nombre del negocio" name="businessName" value={business.businessName} required minLength={2} />
          <Field label="Rubro" name="category" value={business.category} required minLength={2} maxLength={60} />
        </div>
        <label>
          Descripción
          <textarea name="description" defaultValue={business.description || ''} maxLength={2000} />
        </label>
        <Field label="Dirección o modalidad de atención" name="address" value={business.address} maxLength={250} />
        <h3>Medios de pago aceptados</h3>
        <div className="checks">
          {paymentMethods.map((method) => (
            <label key={method}>
              <input name="paymentMethods" type="checkbox" value={method} defaultChecked={acceptedMethods.includes(method)} />
              {method}
            </label>
          ))}
        </div>
        <div className="form-grid">
          <Field label="Titular de la cuenta" name="paymentHolder" value={business.paymentHolder} />
          <Field label="Alias bancario / Mercado Pago" name="paymentAlias" value={business.paymentAlias} maxLength={100} />
          <Field
            label="CBU / CVU (22 dígitos)"
            name="paymentCBU"
            value={business.paymentCBU}
            pattern="[0-9]{22}|"
            maxLength={22}
            inputMode="numeric"
          />
        </div>
        <label>
          Indicaciones para el pago
          <textarea
            name="paymentInstructions"
            defaultValue={business.paymentInstructions}
            maxLength={1000}
            placeholder="Por ejemplo: aboná al finalizar la atención."
          />
        </label>
        <div className="tip">Se registran medios e instrucciones de cobro. No se procesan pagos ni se almacenan tarjetas.</div>
        <button disabled={pending}>Guardar negocio y cobros</button>
      </form>
    </section>
  );
}
