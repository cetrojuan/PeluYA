// Modelos de datos que devuelve y recibe la API. Compartidos por web y móvil.

export type Role = 'CLIENT' | 'PROFESSIONAL';
export type ReminderType = 'NONE' | 'EMAIL' | 'WHATSAPP' | 'BOTH';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  reminderPreference: ReminderType;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

/** Lo que cualquiera ve de un profesional en el listado. */
export interface PublicProfessional {
  id: string;
  businessName: string;
  category: string;
  description: string | null;
  address: string;
  paymentMethods: string;
  paymentInstructions: string;
  services: Service[];
  availability: Availability[];
}

/** El negocio del profesional logueado (incluye datos de cobro privados). */
export interface ProfessionalProfile extends PublicProfessional {
  paymentAlias: string;
  paymentCBU: string;
  paymentHolder: string;
}

export interface Profile extends User {
  professional: ProfessionalProfile | null;
}

export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: AppointmentStatus;
  service: Service;
  client: { name: string; email: string; phone: string | null };
  professional: Pick<
    ProfessionalProfile,
    'id' | 'businessName' | 'paymentMethods' | 'paymentAlias' | 'paymentCBU' | 'paymentHolder' | 'paymentInstructions'
  >;
}

export interface SessionData {
  user: User;
  csrf: string;
}

// ---- Datos que se envían ----
export interface LoginInput { email: string; password: string }
export interface RegisterInput extends LoginInput { name: string; phone: string; role: Role }
export interface ProfileInput { name: string; email: string; phone: string; reminderPreference: ReminderType }
export interface PasswordInput { currentPassword: string; newPassword: string }
export interface BusinessInput {
  businessName: string;
  category: string;
  description: string;
  address: string;
  paymentMethods: string[];
  paymentAlias: string;
  paymentCBU: string;
  paymentHolder: string;
  paymentInstructions: string;
}
export interface ServiceInput { name: string; description: string; duration: number; price: number }
export interface AvailabilityInput { dayOfWeek: number; startTime: string; endTime: string }
export interface BookingInput {
  professionalId: string;
  serviceId: string;
  date: string;
  startTime: string;
  notes: string;
  reminder: ReminderType;
}
export interface RescheduleInput { date: string; startTime: string; notes: string }
