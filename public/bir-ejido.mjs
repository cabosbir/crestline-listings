export function inquiryPayload(form,{path,title}){
 const value=k=>String(form.get(k)||'').trim();
 const intent=value('intent')==='selling'?'selling':'buying';
 return {name:value('name'),email:value('email'),phone:value('phone'),website:value('website'),inquiryType:intent,propertyType:'land',preferredAgent:'Don Weis',agentEmail:'don@bircabo.com',message:`${title}\nSource: https://www.bircabo.com/${path}\nIntent: ${intent}\nLocation / ubicación: ${value('location')}\nArea / superficie m²: ${value('area')||'Not specified / No indicada'}\nStatus / situación: ${value('status')}\nDocuments / documentos: ${value('documents')}\nIntended use / uso: ${value('use')}\nBudget or expected price / presupuesto o precio: ${value('budget')}\nTiming / plazo: ${value('timing')}\n\n${value('message')}`};
}
if(typeof document!=='undefined'){
 const form=document.getElementById('ejido-contact');
 if(form){
 const spanish=document.documentElement.lang.startsWith('es');
 const words=spanish?{send:'Enviar consulta a BIR',sending:'Enviando…',sent:'Consulta enviada',success:'Gracias. Tu consulta fue enviada a Don y al equipo BIR.',error:'No pudimos confirmar el envío. Tus datos siguen en el formulario. ',email:'Enviar por correo',retry:'Volver a intentar'}:{send:'Send inquiry to BIR',sending:'Sending…',sent:'Inquiry sent',success:'Thank you. Your inquiry was sent to Don and the BIR team.',error:'We could not confirm delivery. Your entries are still in the form. ',email:'Send by email',retry:'Try again'};
 const intent=document.getElementById('ejido-intent'),button=form.querySelector('button[type=submit]'),status=form.querySelector('[role=status]');
 const config={path:new URL(document.querySelector('link[rel=canonical]').href).pathname.slice(1),title:document.querySelector('h1').textContent};
 document.querySelectorAll('[data-ejido-intent]').forEach(link=>link.addEventListener('click',()=>{intent.value=link.dataset.ejidoIntent;intent.focus({preventScroll:true});}));
 form.addEventListener('submit',async event=>{
 event.preventDefault();if(button.disabled)return;
 const payload=inquiryPayload(new FormData(form),config);button.disabled=true;button.textContent=words.sending;status.textContent='';
 try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});const data=await response.json();if(!response.ok||data.success!==true)throw Error('Unconfirmed');document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'success'}}));status.textContent=words.success;button.textContent=words.sent;form.reset();}
 catch{status.replaceChildren(document.createTextNode(words.error));const email=document.createElement('a');email.href='mailto:don@bircabo.com?subject='+encodeURIComponent(config.title)+'&body='+encodeURIComponent(payload.message);email.textContent=words.email;status.append(email);button.disabled=false;button.textContent=words.retry;}
 });
 }
}
