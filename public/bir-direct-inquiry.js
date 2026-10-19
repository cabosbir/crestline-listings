(() => {
  'use strict';
  document.querySelectorAll('[data-bir-direct-inquiry]').forEach(form => {
    const button=form.querySelector('button[type="submit"]');
    const status=form.querySelector('.bir-form-status');
    let sending=false;
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if(sending||!form.reportValidity())return;
      const fields=new FormData(form);
      const body={name:String(fields.get('name')||'').trim(),email:String(fields.get('email')||'').trim(),phone:String(fields.get('phone')||'').trim(),message:String(fields.get('message')||'').trim(),website:String(fields.get('website')||''),listingId:'',address:form.dataset.property||'',sourceSite:location.hostname};
      if(!body.name||!body.message){status.textContent='Please enter your name and question.';status.dataset.outcome='error';status.focus();return;}
      sending=true;button.disabled=true;button.textContent='Sending…';status.textContent='';delete status.dataset.outcome;
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),25000);
      try {
        const response=await fetch('https://www.bircabo.com/api/search-pilot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
        const result=await response.json();
        if(!response.ok||result.success!==true)throw new Error(response.status===429?'rate_limit':'delivery');
        status.textContent='Thank you. Your inquiry has been sent to Don.';status.dataset.outcome='success';button.textContent='Inquiry sent';
        form.reset();
        document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'success'}}));
      } catch(error) {
        status.textContent=error.message==='rate_limit'?'Please wait a few minutes before trying again. Your message is still here. You can also contact Don using the options below.':'We could not confirm delivery. Your message is still here. Please try again, or contact Don using the options below.';
        status.dataset.outcome='error';button.disabled=false;button.textContent='Try sending again';sending=false;
        document.dispatchEvent(new CustomEvent('bir-lead-result',{detail:{form:'general_contact',outcome:'error'}}));
      } finally {clearTimeout(timeout);status.focus();}
    });
  });
})();
