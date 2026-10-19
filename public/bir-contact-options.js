/* Shared, app-free inquiry option for BIR's five public websites. */
(() => {
  'use strict';
  if (document.getElementById('bir-contact-dialog')) return;
  const phone = '+52 624 129 6245';
  const phoneHref = 'tel:+526241296245';
  const whatsapp = 'https://wa.me/526241296245';
  const ownEmail = /^(?:don|info)@(?:bircabo\.com|bajainternationalrealty\.com)$/i;
  const ownPhone = /^(?:52)?624(?:1296245|1435555)$/;
  const dialog = document.createElement('dialog');
  dialog.id = 'bir-contact-dialog';
  dialog.setAttribute('aria-labelledby', 'bir-contact-title');
  dialog.innerHTML = `<button type="button" class="bir-contact-close" aria-label="Close inquiry form">×</button>
    <h2 id="bir-contact-title">Send an inquiry</h2>
    <p>Send your question directly to Don. No email app or WhatsApp needed.</p>
    <form id="bir-contact-form" data-bir-lead-form="general_contact">
      <label for="bir-contact-name">Your name <span>(required)</span></label>
      <input id="bir-contact-name" name="name" autocomplete="name" maxlength="100" required>
      <label for="bir-contact-email">Your email <span>(required)</span></label>
      <input id="bir-contact-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required>
      <p class="bir-contact-help">Don will reply to this email address.</p>
      <label for="bir-contact-message">Your question <span>(required)</span></label>
      <textarea id="bir-contact-message" name="message" rows="4" maxlength="3000" required></textarea>
      <div class="bir-contact-trap" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="bir-contact-send" type="submit">Send inquiry to Don</button>
      <p class="bir-contact-status" role="status" aria-live="polite" tabindex="-1"></p>
      <p class="bir-contact-call">Prefer to call Don? <a href="${phoneHref}">${phone}</a></p>
      <p class="bir-contact-help">You can also <a href="${whatsapp}" target="_blank" rel="noopener">use WhatsApp</a>.</p>
    </form>`;
  document.body.append(dialog);
  const bar = document.createElement('nav');
  bar.id = 'bir-contact-options';
  bar.setAttribute('aria-label', 'Contact Don');
  bar.innerHTML = `<a class="bir-option-whatsapp" href="${whatsapp}" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="bir-option-inquiry">Send an inquiry</button>`;
  document.body.append(bar);
  document.body.classList.add('bir-has-contact-options');
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.bir-contact-status');
  const submit = dialog.querySelector('.bir-contact-send');
  let sending = false, completed = false, originator = null, context = '';
  function open(trigger) {
    originator = trigger;
    if (completed) { form.reset(); status.textContent = ''; submit.disabled = false; submit.textContent = 'Send inquiry to Don'; completed = false; }
    context = trigger?.dataset.birInquiryContext || document.querySelector('h1')?.textContent?.trim() || document.title;
    context = context.slice(0, 300);
    if (!form.elements.message.value.trim()) form.elements.message.value = /casa oasis/i.test(context) ? 'I would like more information about Casa Oasis.' : '';
    if (!dialog.open) dialog.showModal();
    form.elements.name.focus();
    document.dispatchEvent(new CustomEvent('bir-contact-open'));
  }
  function close() { dialog.close(); originator?.focus?.(); }
  dialog.querySelector('.bir-contact-close').addEventListener('click', close);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } });
  bar.querySelector('button').addEventListener('click', e => open(e.currentTarget));
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[data-bir-inquiry], a[href="#bir-inquiry"]');
    if (a) { e.preventDefault(); open(a); }
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending || completed || !form.reportValidity()) return;
    const data = new FormData(form);
    const body = {name:String(data.get('name')||'').trim(),email:String(data.get('email')||'').trim(),phone:'',message:String(data.get('message')||'').trim(),website:String(data.get('website')||''),listingId:'',address:context,sourceSite:location.hostname,sourcePage:location.pathname};
    if (!body.name || !body.message) { status.textContent = 'Please enter your name and question.'; return; }
    sending = true; submit.disabled = true; submit.textContent = 'Sending…'; status.textContent = '';
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('https://www.bircabo.com/api/search-pilot', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
      const result = await response.json();
      if (!response.ok || result.success !== true) throw Error(response.status === 429 ? 'rate' : 'delivery');
      completed = true; form.reset(); submit.textContent = 'Inquiry sent';
      status.textContent = 'Thank you. Your inquiry has been sent to Don.';
      document.dispatchEvent(new CustomEvent('bir-lead-result', {detail:{form:'general_contact',outcome:'success'}}));
    } catch (error) {
      status.textContent = error.message === 'rate' ? 'Please wait a few minutes and try again. Your message is still here. You can also call Don using the number below.' : 'We could not confirm delivery. Your message is still here. Please try again, or call Don using the number below.';
      submit.disabled = false; submit.textContent = 'Try sending again';
      document.dispatchEvent(new CustomEvent('bir-lead-result', {detail:{form:'general_contact',outcome:'error'}}));
    } finally { sending = false; clearTimeout(timeout); status.focus(); }
  });
  // Property cards are created after page load. Keep those contact links consistent too.
  function enhance(root) {
    if (root.nodeType !== 1 || root.closest?.('#bir-contact-dialog,#bir-contact-options')) return;
    const anchors = [...(root.matches?.('a[href]') ? [root] : []), ...root.querySelectorAll('a[href]')];
    anchors.forEach(a => {
      if (a.closest('#bir-contact-dialog,#bir-contact-options')) return;
      let u; try { u = new URL(a.getAttribute('href'), location.href); } catch { return; }
      if (u.protocol === 'mailto:' && ownEmail.test(u.pathname)) {
        a.dataset.birInquiry = '';
        a.dataset.birInquiryContext = u.searchParams.get('subject') || a.closest('article,.card,dialog')?.querySelector('h2,h3')?.textContent || '';
        a.href = '#bir-inquiry'; a.textContent = 'Send an inquiry'; a.removeAttribute('target'); a.removeAttribute('title');
      } else if (u.protocol === 'tel:' && ownPhone.test(u.pathname.replace(/\D/g,'')) && !a.closest('form')) {
        a.href = whatsapp; a.textContent = 'WhatsApp'; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('title');
      }
    });
    const forms = [...(root.matches?.('form') ? [root] : []), ...root.querySelectorAll('form')];
    forms.forEach(f => {
      if (!f.matches('#inquiry-draft,#inquiry-form,[data-bir-direct-inquiry],[data-bir-lead-form="general_contact"]') || f.querySelector('.bir-contact-call') || f.id === 'bir-contact-form') return;
      const email = f.querySelector('input[type="email"]');
      if (email) email.required = true;
      const call = document.createElement('p'); call.className = 'bir-contact-call';
      call.innerHTML = `Prefer to call Don? <a href="${phoneHref}">${phone}</a>`;
      f.append(call);
    });
  }
  enhance(document.body);
  new MutationObserver(records => { for (const record of records) { if (record.type === 'attributes') enhance(record.target); else for (const node of record.addedNodes) enhance(node); } }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
})();
