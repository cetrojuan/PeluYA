import assert from 'node:assert/strict';
const base=process.env.TEST_API,origin='http://localhost:5173';
if (!base) throw new Error('Definí TEST_API apuntando a una API aislada con datos ficticios.');
let checks=0;
async function call(path,method='GET',data,session={},expected=200,headers={}){const r=await fetch(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json','X-Turnify-Request':'1','X-CSRF-Token':session.csrf||'',Cookie:session.cookie||'',...headers},...(data===undefined?{}:{body:JSON.stringify(data)})});const json=await r.json();assert.equal(r.status,expected,`${method} ${path}: ${JSON.stringify(json)}`);checks++;return {json,cookie:r.headers.get('set-cookie')?.split(';')[0],setCookie:r.headers.get('set-cookie')};}
const suffix=Date.now();
async function register(role,n){const r=await call('/auth/register','POST',{name:'Prueba '+n,email:`test${n}${suffix}@example.com`,phone:'',password:'TurnifyTest2026!',role});return {...r.json,cookie:r.cookie};}
const a=await register('PROFESSIONAL','a'),b=await register('PROFESSIONAL','b'),c=await register('CLIENT','c'),d=await register('CLIENT','d');
const cookieResponse = await call('/auth/login','POST',{email:`testa${suffix}@example.com`,password:'TurnifyTest2026!'});
Object.assign(a, cookieResponse.json, { cookie: cookieResponse.cookie });
assert.match(cookieResponse.setCookie, /HttpOnly/i);
assert.match(cookieResponse.setCookie, /SameSite=Strict/i);
assert.match(cookieResponse.setCookie, /Path=\/api(?:;|$)/i); checks++;
await call('/profile','GET',undefined,{},401);
await call('/profile','GET',undefined,{cookie:'turnify_session=inventada'},401);
await call('/profile','PUT',{}, {...a,csrf:''},403);
await call('/profile','PUT',{},a,403,{Origin:'https://otro.example'});
await call('/profile','PUT',{},a,403,{'X-Turnify-Request':''});
for (const [path, method] of [['/professional','PUT'],['/services','POST'],['/availability','POST']]) {
  await call(path,method,{}, {},401);
  await call(path,method,{},c,403);
}
await call('/profile','PUT',{role:'PROFESSIONAL',id:a.user.id},c,400);
await call('/auth/register','POST',{name:'Hack',email:'hack@example.com',phone:'',password:'123',role:'ADMIN'},{},400);
const p=(await call('/profile','GET',undefined,a)).json;
assert.equal(p.passwordHash,undefined);checks++;
await call('/professional','PUT',{businessName:'Prueba estudio',category:'Barbería',description:'',address:'',paymentMethods:['Transferencia'],paymentAlias:'prueba.alias',paymentCBU:'',paymentHolder:'Titular',paymentInstructions:''},a);
const svc=(await call('/services','POST',{name:'Servicio prueba',description:'',duration:60,price:15000},a,201)).json;
await call('/services/'+svc.id,'PUT',{name:'Ajeno',description:'',duration:30,price:1},b,404);
await call('/services/'+svc.id,'DELETE',{},b,404);
await call('/services','POST',{name:'No autorizado',description:'',duration:30,price:1},c,403);
await call('/services','POST',{name:'Inválido',description:'',duration:-1,price:-1},a,400);
const date=new Date(Date.now()+7*86400000).toISOString().slice(0,10),dayOfWeek=new Date(date).getUTCDay();
await call('/availability','POST',{dayOfWeek,startTime:'09:00',endTime:'18:00'},a,201);
await call('/availability','POST',{dayOfWeek,startTime:'17:00',endTime:'19:00'},a,409);
const slot=(await call('/profile','GET',undefined,a)).json.professional.availability[0];
await call('/availability/'+slot.id,'DELETE',{},b,404);
await call('/availability/'+slot.id,'PUT',{dayOfWeek,startTime:'09:00',endTime:'17:00'},b,404);
const booking={professionalId:p.professional.id,serviceId:svc.id,date,startTime:'10:00',notes:'Prueba',reminder:'NONE'};
await call('/appointments','POST',{...booking,clientId:d.user.id},c,400);
const appt=(await call('/appointments','POST',booking,c,201)).json;
await call('/appointments','POST',{...booking,startTime:'10:30'},d,409);
await call('/appointments','POST',{...booking,startTime:'08:00'},d,400);
const otherService=(await call('/services','POST',{name:'Otro servicio',description:'',duration:30,price:100},b,201)).json;
await call('/appointments','POST',{...booking,serviceId:otherService.id},d,400);
await call('/appointments/'+appt.id+'/status','PATCH',{status:'CANCELLED'},d,404);
await call('/appointments/'+appt.id+'/status','PATCH',{status:'CONFIRMED'},c,403);
await call('/appointments/'+appt.id+'/status','PATCH',{status:'CONFIRMED'},b,404);
await call('/appointments/'+appt.id,'PUT',{date,startTime:'12:00',notes:''},b,404);
await call('/appointments/'+appt.id,'PUT',{date,startTime:'12:00',notes:''},c,403);
await call('/appointments/'+appt.id,'PUT',{date,startTime:'12:00',notes:'Nueva hora'},a);
await call('/appointments/'+appt.id+'/status','PATCH',{status:'CONFIRMED'},a);
const publicList=(await call('/professionals?q=Prueba%20estudio')).json;assert.equal(publicList.items.find(x=>x.id===p.professional.id).paymentAlias,undefined);checks++;
const own=(await call('/appointments','GET',undefined,c)).json;assert.equal(own.items[0].professional.paymentAlias,'prueba.alias');checks++;
for (const query of ['page=0','page=-1','page=1.5','page=abc','pageSize=51','page=1&page=2','clientId=otro','status=ADMIN']) {
  await call('/appointments?'+query,'GET',undefined,c,400);
}
await call('/appointments/summary','GET',undefined,{},401);
const otherList=(await call('/appointments','GET',undefined,d)).json;
assert.equal(otherList.total,0);checks++;
const otherSummary=(await call('/appointments/summary','GET',undefined,d)).json;
assert.equal(otherSummary.active,0);assert.equal(otherSummary.upcoming.length,0);checks++;
const ownSummary=(await call('/appointments/summary','GET',undefined,c)).json;
assert.equal(ownSummary.active,1);assert.equal(ownSummary.pending,0);checks++;
const filtered=(await call('/appointments?status=PENDING','GET',undefined,c)).json;
assert.equal(filtered.total,0);checks++;
const lastPage=(await call('/appointments?page=2&pageSize=1','GET',undefined,c)).json;
assert.equal(lastPage.items.length,0);assert.equal(lastPage.total,1);checks++;
const page1=(await call('/professionals?page=1&pageSize=1')).json;
const page2=(await call('/professionals?page=2&pageSize=1')).json;
assert.equal(page1.items.length,1);assert.equal(page2.items.length,1);
assert.notEqual(page1.items[0].id,page2.items[0].id);assert.equal(page1.total,page2.total);checks++;
for (const query of ['page=0','pageSize=51','q=a&q=b','userId=otro']) {
  await call('/professionals?'+query,'GET',undefined,{},400);
}
const oldCookie=c.cookie;
await call('/auth/logout','POST',{},c);
await call('/auth/me','GET',undefined,{...c,cookie:oldCookie},401);
const login=(await call('/auth/login','POST',{email:`testc${suffix}@example.com`,password:'TurnifyTest2026!'}));const active={...login.json,cookie:login.cookie};
await call('/auth/password','PUT',{currentPassword:'TurnifyTest2026!',newPassword:'NuevaClave2026!'},active);
await call('/auth/me','GET',undefined,active,401);
console.log(`${checks} comprobaciones de API completadas correctamente.`);

// Volumen y aislamiento sobre el seed del TP: más de una página para cada rol.
async function demoSession(email) {
  const response = await call('/auth/login', 'POST', { email, password: 'TurnifyDemo2026!' });
  return { ...response.json, cookie: response.cookie };
}
async function allPages(session) {
  const first = (await call('/appointments?pageSize=7', 'GET', undefined, session)).json;
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page++) {
    const next = (await call('/appointments?pageSize=7&page='+page, 'GET', undefined, session)).json;
    assert.equal(next.total, first.total); assert.ok(next.items.length <= 7);
    items.push(...next.items);
  }
  assert.equal(items.length, first.total); assert.equal(new Set(items.map(x=>x.id)).size, first.total);
  checks++;
  return items;
}
const demoClient = await demoSession('cliente@turnify.local');
const demoClient2 = await demoSession('cliente2@turnify.local');
const demoPro = await demoSession('profesional@turnify.local');
const clientRows = await allPages(demoClient), otherRows = await allPages(demoClient2), proRows = await allPages(demoPro);
const demoProProfile = (await call('/profile','GET',undefined,demoPro)).json.professional;
assert.ok(clientRows.length > 10); assert.ok(otherRows.length > 10); assert.ok(proRows.length > 10);
assert.ok(clientRows.every(x=>x.clientId === demoClient.user.id));
assert.ok(otherRows.every(x=>x.clientId === demoClient2.user.id));
assert.ok(proRows.every(x=>x.professionalId === demoProProfile.id));
assert.ok(!clientRows.some(x=>otherRows.some(y=>x.id===y.id))); checks++;
for (const status of ['PENDING','CONFIRMED','CANCELLED','COMPLETED']) {
  const filtered = (await call('/appointments?status='+status, 'GET', undefined, demoClient)).json;
  assert.equal(filtered.total, clientRows.filter(x=>x.status===status).length);
  assert.ok(filtered.items.every(x=>x.status===status && x.clientId===demoClient.user.id)); checks++;
}
const demoSummary = (await call('/appointments/summary','GET',undefined,demoClient)).json;
assert.equal(demoSummary.active, clientRows.filter(x=>['PENDING','CONFIRMED'].includes(x.status)).length);
assert.equal(demoSummary.completed, clientRows.filter(x=>x.status==='COMPLETED').length); checks++;
await call('/appointments?page=2&pageSize=1&status=PENDING','GET',undefined,demoClient);
assert.deepEqual((await call('/appointments/summary','GET',undefined,demoClient)).json, demoSummary); checks++;
assert.equal((await call('/professionals?q=%27%20OR%201%3D1--')).json.total, 0); checks++;
assert.equal((await call('/professionals?q='+encodeURIComponent('<script>alert(1)</script>'))).json.total, 0); checks++;
console.log(`${checks} comprobaciones de API, volumen y aislamiento completadas correctamente.`);
