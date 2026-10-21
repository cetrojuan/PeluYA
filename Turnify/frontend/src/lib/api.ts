let csrf='';
export function setCsrf(value:string){csrf=value;}
// La contraseña y la sesión nunca se guardan en localStorage.
export async function api(path:string,options:RequestInit={}){const r=await fetch('/api'+path,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Turnify-Request':'1','X-CSRF-Token':csrf,...options.headers}});const data=await r.json().catch(()=>null);if(!r.ok){if(r.status===401&&!path.startsWith('/auth/'))window.dispatchEvent(new Event('session-expired'));throw new Error(data?.message||'No se pudo completar la solicitud');}return data;}
