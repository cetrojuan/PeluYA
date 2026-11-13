import 'dotenv/config';
import { PrismaClient, Role, type AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Datos ficticios. Los IDs estables permiten repetir el seed sin borrar registros.
async function main() {
  const passwordHash = await bcrypt.hash('TurnifyDemo2026!', 12);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@turnify.local' }, update: {},
    create: { name: 'Cliente Demo', email: 'cliente@turnify.local', passwordHash, role: Role.CLIENT },
  });
  const otherClient = await prisma.user.upsert({
    where: { email: 'cliente2@turnify.local' }, update: {},
    create: { name: 'Cliente Demo 2', email: 'cliente2@turnify.local', passwordHash, role: Role.CLIENT },
  });
  for (let n = 0; n < 12; n++) {
    const suffix = String(n).padStart(2, '0');
    const email = n === 0 ? 'profesional@turnify.local' : `profesional${n}@turnify.local`;
    const professional = await prisma.user.upsert({ where: { email }, update: {},
      create: { name: `Profesional Demo ${n + 1}`, email, passwordHash, role: Role.PROFESSIONAL } });
    const profile = await prisma.professionalProfile.upsert({ where: { userId: professional.id }, update: {},
      create: { userId: professional.id, businessName: `Barbería Demo ${suffix}`, category: 'Barbería',
        description: 'Negocio ficticio para probar la aplicación.' } });
    const service = await prisma.service.upsert({ where: { id: `pp2-demo-service-${suffix}` }, update: {},
      create: { id: `pp2-demo-service-${suffix}`, professionalId: profile.id,
        name: 'Corte demo', duration: 30, price: 15000 } });
    for (const dayOfWeek of [1, 2, 3, 4, 5]) {
      if (!await prisma.availability.count({ where: { professionalId: profile.id, dayOfWeek } })) {
        await prisma.availability.create({ data: { professionalId: profile.id, dayOfWeek,
          startTime: '09:00', endTime: '18:00' } });
      }
    }
    if (n !== 0) continue;
    const statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
    for (let i = 0; i < 48; i++) {
      const status = statuses[i % statuses.length];
      const date = new Date(+today + (status === 'COMPLETED' ? -60 + i : 1 + i) * 86400000);
      while ([0, 6].includes(date.getUTCDay())) date.setUTCDate(date.getUTCDate() + 1);
      const hour = 9 + (i % 8);
      const startTime = String(hour).padStart(2, '0') + ':00';
      const endTime = String(hour).padStart(2, '0') + ':30';
      const id = 'pp2-demo-appointment-' + String(i).padStart(2, '0');
      if (await prisma.appointment.findUnique({ where: { id } })) continue;
      const occupied = await prisma.appointment.count({ where: { professionalId: profile.id, date,
        status: { not: 'CANCELLED' }, startTime: { lt: endTime }, endTime: { gt: startTime } } });
      if (occupied) continue;
      await prisma.appointment.create({ data: { id, professionalId: profile.id,
        clientId: Math.floor(i / 4) % 2 === 0 ? client.id : otherClient.id, serviceId: service.id,
        date, startTime, endTime, status, reminder: 'NONE', notes: 'Reserva ficticia del TP.' } });
    }
  }
  console.log('Datos ficticios listos: 12 profesionales y hasta 48 turnos. El seed se puede repetir.');
  console.log('Accesos demo: profesional@turnify.local, cliente@turnify.local y cliente2@turnify.local.');
}
main().catch((error: unknown) => {
  console.error('No se pudieron cargar los datos ficticios.', error instanceof Error ? error.name : 'Error');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
