import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
 const passwordHash=await bcrypt.hash('TurnifyDemo2026!',12);
 const p=await prisma.user.upsert({where:{email:'profesional@turnify.local'},update:{},create:{name:'Juan Profesional',email:'profesional@turnify.local',passwordHash,phone:'1122334455',role:Role.PROFESSIONAL}});
 const profile=await prisma.professionalProfile.upsert({where:{userId:p.id},update:{},create:{userId:p.id,businessName:'Juan Barber Studio',category:'Barbería',description:'Turnos de barbería y cuidado personal.'}});
 if(!await prisma.service.count({where:{professionalId:profile.id}}))
 await prisma.service.createMany({data:[{professionalId:profile.id,name:'Corte de pelo',duration:30,price:15000},{professionalId:profile.id,name:'Corte + barba',duration:45,price:20000}]});
 if(!await prisma.availability.count({where:{professionalId:profile.id}}))
 await prisma.availability.createMany({data:[1,2,3,4,5].map(day=>({professionalId:profile.id,dayOfWeek:day,startTime:'09:00',endTime:'18:00'}))});
 await prisma.user.upsert({where:{email:'cliente@turnify.local'},update:{},create:{name:'Cliente Demo',email:'cliente@turnify.local',passwordHash,phone:'1199999999',role:Role.CLIENT}});
 console.log('Seed listo');
}
main().finally(()=>prisma.$disconnect());
