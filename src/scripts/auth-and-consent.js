
(function(){
 'use strict';
 const POLICY='2026-09-11.2',EMAIL='as@trufflinnovations.in';
 const paths=['/login','/request-access','/request-access/received','/request-received','/activate-account','/invitation-expired','/invitation-sent','/forgot-password','/reset-password','/reset-expired','/reset-email-sent','/reset-complete'];
 window.trufflAuthPaths=paths;
 const card=document.getElementById('auth-card'),shell=document.getElementById('auth-shell'),dialog=document.getElementById('v-auth');
 const notice=document.querySelector('.auth-preview-note');if(notice)notice.remove();
 const live=document.getElementById('utility-announcement'),banner=document.getElementById('cookie-banner'),prefs=document.getElementById('cookie-preferences');
 const defaults=()=>({necessary:true,analytics:false,functional:false,advertising:false});
 let config=null,choice=null,current='/login',email='',receipt=null,submitting=false,formCache={},requestKeys={},returnURL=null,opener=null,embedTimer=null,frame=null,embedGeneration=0;
 let preferredReceipt=null;try{preferredReceipt=JSON.parse(sessionStorage.getItem('truffl_request_receipt'));}catch{}
 try{choice=JSON.parse(localStorage.getItem('truffl_privacy_choice'));if(choice?.version!==POLICY||choice.timestamp<Date.now()-180*86400000)choice=null;}catch{}
 if(navigator.globalPrivacyControl&&choice)choice.categories.advertising=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function announce(text){live.textContent=text;}
 function focusHeading(){requestAnimationFrame(()=>{const h=card.querySelector('h1');if(h&&dialog.open){h.tabIndex=-1;h.focus({preventScroll:true});}});}
 async function api(path,body){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin',signal:controller.signal});const data=await r.json();if(!r.ok)throw {status:r.status,data};return data;}finally{clearTimeout(timer);}}
 const boot=api('/api/bootstrap').then(data=>{config=data;if(data.consent&&(!choice||choice.timestamp<=data.consent.timestamp))choice=data.consent;if(navigator.globalPrivacyControl&&choice)choice.categories.advertising=false;banner.hidden=true;return data;}).catch(()=>{banner.hidden=true;return null;});
 window.trufflReady=boot;
 function heading(title,copy){return '<p class="auth-eyebrow">Truffl</p><h1 id="auth-title">'+title+'</h1>'+(copy?'<p class="auth-copy">'+copy+'</p>':'')+'<div id="auth-error" class="auth-error" role="alert" tabindex="-1" hidden></div>';}
 const link=(path,label,primary=false)=>'<a href="'+path+'" class="'+(primary?'auth-primary':'auth-link')+'">'+label+'</a>';
 function field(name,label,type='text',auto='',required=true){return '<div class="auth-field"><label for="uf-'+name+'">'+label+'</label><div class="'+(type==='password'?'auth-password':'')+'"><input id="uf-'+name+'" name="'+name+'" type="'+type+'" autocomplete="'+auto+'" '+(required?'required':'')+' aria-describedby="uf-error-'+name+'">'+(type==='password'?'<button type="button" class="auth-reveal" data-reveal="uf-'+name+'" aria-label="Show password">Show</button>':'')+'</div><small id="uf-error-'+name+'" class="field-error"></small></div>';}
 function form(kind,fields,cta){return '<form class="auth-form" data-auth-form="'+kind+'" novalidate>'+fields+'<button class="auth-primary" type="submit">'+cta+'</button></form>';}
 function contactFields(access){return '<div class="auth-grid">'+field('fullName','Full name','text','name')+field('email','Work email','email','email')+field('company','Company','text','organization')+field('role',access?'Role':'Role (optional)','text','organization-title',access)+'</div><div class="auth-field"><label for="uf-requirement">What do you want to build?</label><select id="uf-requirement" name="requirement" required aria-describedby="uf-error-requirement"><option value="">Select a use case</option>'+['Customer support','Revenue recovery','Voice inside an application','Enterprise voice operations','Explore the Truffl platform','Something else'].map(t=>'<option>'+t+'</option>').join('')+'</select><small class="field-error" id="uf-error-requirement"></small></div><div class="auth-field"><label for="uf-description">Briefly describe your requirement</label><textarea id="uf-description" name="description" required maxlength="4000" aria-describedby="uf-error-description"></textarea><small class="field-error" id="uf-error-description"></small></div>'+field('phone','Phone number (optional)','tel','tel',false);}
 function stopEmbed(){embedGeneration++;clearTimeout(embedTimer);frame=null;const el=document.getElementById('calendly-embed');if(el)el.replaceChildren();}
 function rememberForm(){const f=card.querySelector('form');if(f&&['contact','access'].includes(f.dataset.authForm))formCache[f.dataset.authForm]=Object.fromEntries(new FormData(f));}
 function render(path){
  if(path==='/request-access/received')path='/contact/submitted';
  stopEmbed();if(['/reset-email-sent','/invitation-sent','/reset-complete'].includes(path)&&!email)path='/forgot-password';current=path;let body='';shell.classList.toggle('wide',['/contact','/contact/submitted','/request-access'].includes(path));
  if(path==='/login')body=heading('Enter your Truffl workspace.','Access your agents, interactions, evaluations and workspace settings.')+form('login',field('email','Work email','email','username')+field('password','Password','password','current-password')+link('/forgot-password','Forgot password?'),'Login')+'<p class="auth-bottom">New to Truffl? '+link('/request-access','Request access')+'</p>';
  if(path==='/contact'||path==='/request-access'){
   const access=path==='/request-access',kind=access?'access':'contact';
   body=heading(access?'Request access to Truffl.':'Talk to us.','Tell us what you want to build. After submitting your details, choose a time to speak with the Truffl team.')+form(kind,contactFields(access),'Continue to scheduling')+(access?'<p class="auth-bottom">Already have access? '+link('/login','Login')+'</p>':'')+'<p class="auth-bottom">'+link('mailto:'+EMAIL,'Email us instead')+'</p>';
  }
  if(path==='/request-access/received')body=heading('Your request is with us.',"We've received your request for Truffl access. If it is a fit for the current platform, we'll contact you at <strong>"+esc(receipt?.email||email)+'</strong> with the next step.')+'<div class="auth-actions"><a href="/" data-nav="home" class="auth-primary">Return home</a>'+link('/contact','Talk to us')+'</div>';
  if(path==='/contact/submitted')body=heading("Let's find a time.",'Thanks, '+esc((receipt?.fullName||'').split(' ')[0])+". We've received your details. Choose a convenient time to speak with us.")+'<p id="scheduler-link" hidden></p><div id="scheduler-status" class="scheduler-status" aria-live="polite"></div><div id="calendly-embed" class="calendly-embed"></div><p class="auth-bottom"><a href="/" data-nav="home">Return home</a></p>';
  if(path==='/forgot-password')body=heading('Reset your password.','Enter the email associated with your Truffl workspace.')+form('recover',field('email','Work email','email','email'),'Send reset link')+'<p class="auth-bottom">'+link('/login','Back to login')+'</p>';
  if(path==='/reset-email-sent')body=heading('Check your inbox.',"If a Truffl account exists for <strong>"+esc(email)+"</strong>, we've sent a password reset link.")+form('recover','','Resend link')+'<p class="auth-bottom">'+link('/login','Back to login')+'</p>';
  if(path==='/reset-expired')body=heading('This reset link has expired.','Password reset links are time-limited for your security. Request a new one to continue.')+link('/forgot-password','Send new link',true)+'<p class="auth-bottom">'+link('/login','Back to login')+'</p>';
  if(path==='/invitation-expired')body=heading('This invitation has expired.','Request a new invitation to continue setting up your Truffl workspace.')+form('resend-invite','','Resend invitation')+'<p class="auth-bottom">'+link('/login','Back to login')+'</p>';
  if(path==='/invitation-sent')body=heading('A new invitation is on its way.','Check your inbox at <strong>'+esc(email.replace(/^(.).+(@.*)$/,'$1•••$2'))+'</strong>.')+link('/login','Back to login');
  if(path==='/reset-complete')body=heading('Your password has been reset.','')+link('/login','Login',true);
  if(path==='/activate-account'||path==='/reset-password')body=heading(path==='/activate-account'?'Activate your workspace.':'Create a new password.','We couldn’t verify this link right now. Please try again in a moment.')+form('verify-token','','Try again')+'<p class="auth-bottom">'+link('/login','Back to login')+'</p>';
  card.innerHTML=body;
  const f=card.querySelector('form');if(f&&formCache[f.dataset.authForm])for(const [k,v]of Object.entries(formCache[f.dataset.authForm]))if(f.elements[k])f.elements[k].value=v;
  focusHeading();if(path==='/contact/submitted')schedule();
 }
 function show(path){if(path==='/login')path='/contact';rememberForm();if(!dialog.open){opener=document.activeElement;returnURL=paths.includes(location.pathname)||location.pathname.startsWith('/contact')?'/':location.pathname+location.search+location.hash;}window.trufflCloseMobileMenu?.();if(!dialog.open){dialog.showModal();document.body.classList.add('auth-modal-open');}render(path==='/request-received'?'/request-access/received':path);dialog.scrollTop=0;}
 function close(){rememberForm();stopEmbed();if(dialog.open)dialog.close();}
 window.trufflCloseAuthModal=close;
 dialog.querySelector('.auth-close').addEventListener('click',close);
 dialog.addEventListener('close',()=>{stopEmbed();document.body.classList.remove('auth-modal-open');card.innerHTML='';if(paths.includes(location.pathname)||location.pathname.startsWith('/contact'))history.replaceState({},'',returnURL||'/');opener?.focus?.();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
 function error(message,fields={},contact=false){const box=document.getElementById('auth-error');box.innerHTML=(contact?'<h2>We couldn’t send your request.</h2>':'')+'<p>'+esc(message)+'</p>'+(contact?link('mailto:'+EMAIL,'Email us instead'):'');box.hidden=false;announce(message);box.focus();for(const [k,m]of Object.entries(fields)){const input=document.getElementById('uf-'+k),el=document.getElementById('uf-error-'+k);if(input)input.setAttribute('aria-invalid','true');if(el)el.textContent=m;}const first=Object.keys(fields)[0];if(first)setTimeout(()=>document.getElementById('uf-'+first)?.focus(),100);}
 function validate(data,access){const e={};if(!data.fullName?.trim())e.fullName='Enter your name.';if(!data.email?.trim())e.email='Enter your work email.';else if(!/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email))e.email='Enter a valid email address.';if(!data.company?.trim())e.company='Enter your company name.';if(access&&!data.role?.trim())e.role='Enter your role.';if(!data.requirement)e.requirement='Select what you want to build.';if(!data.description?.trim())e.description='Tell us briefly about your requirement.';if(data.phone&&(!/^[+\d ()-]+$/.test(data.phone)||data.phone.replace(/\D/g,'').length<7||data.phone.replace(/\D/g,'').length>15))e.phone='Enter a valid phone number or leave this field blank.';return e;}
 const attribution={};const initialQuery=new URLSearchParams(location.search);for(const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'])if(initialQuery.has(k))attribution[k]=initialQuery.get(k).slice(0,300);try{if(document.referrer){const ref=new URL(document.referrer);attribution.referral=ref.origin+ref.pathname;}}catch{}
 card.addEventListener('submit',async e=>{
  e.preventDefault();if(submitting)return;const f=e.target,kind=f.dataset.authForm,data=Object.fromEntries(new FormData(f)),button=f.querySelector('button[type=submit]'),isLead=['contact','access'].includes(kind);
  f.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));f.querySelectorAll('.field-error').forEach(x=>x.textContent='');
  if(isLead){const errors=validate(data,kind==='access');if(Object.keys(errors).length){error("Your details haven't been submitted. Check the highlighted fields and try again.",errors,true);button.textContent='Try again';return;}}
  else if(kind==='recover'&&data.email&&!/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email)){error('Enter a valid email address.',{email:'Enter a valid email address.'});return;}
  submitting=true;button.disabled=true;const label=button.textContent,submittedPath=current;button.textContent='Please wait…';
  try{
   await boot;if(!config)config=await api('/api/bootstrap');
   if(isLead){
    const signature=JSON.stringify(data);if(requestKeys[kind]?.signature!==signature)requestKeys[kind]={signature,key:crypto.randomUUID()};f.dataset.key=requestKeys[kind].key;
    preferredReceipt={id:f.dataset.key,kind,pending:true};try{sessionStorage.setItem('truffl_request_receipt',JSON.stringify(preferredReceipt));}catch{}
    const saved=await api('/api/requests',{...data,kind,idempotencyKey:f.dataset.key,attribution});
    receipt={id:saved.id,kind,fullName:data.fullName,email:data.email,company:data.company};email=data.email;
    preferredReceipt={id:saved.id,kind};try{sessionStorage.setItem('truffl_request_receipt',JSON.stringify(preferredReceipt));}catch{}
    delete formCache[kind];delete requestKeys[kind];if(!dialog.open||current!==submittedPath)return;try{history.replaceState({},'',kind==='contact'?'/contact/submitted':'/request-access/received');}catch{}announce('Your details have been received.');render(kind==='contact'?'/contact/submitted':'/request-access/received');
   }else{
    // Auth success must come from a connected authentication service, never a local UI transition.
    const result=await api('/api/auth/'+kind,kind==='recover'?{email:data.email||email}:{token:new URLSearchParams(location.search).get('token')||'',...data});
    if(kind==='recover'&&result.sent){email=data.email||email;render('/reset-email-sent');}
    else if(kind==='resend-invite'&&result.sent){email=result.maskedEmail||'';render('/invitation-sent');}
    else if(kind==='verify-token'&&result.expired)render(current==='/activate-account'?'/invitation-expired':'/reset-expired');
    else error("We couldn't complete your request right now. Please try again in a moment.");
   }
  }catch(err){if(!dialog.open||current!==submittedPath)return;error(err.status===429?'Too many attempts. Please wait before trying again.':isLead?(err.data?.errors?"Your details haven't been submitted. Check the highlighted fields and try again.":"We couldn't send your request right now. Your answers are still here. Please try again."):kind==='resend-invite'?"We couldn't send a new invitation. Try again, or contact us at "+EMAIL+'.':kind==='recover'?"We couldn’t send the email. Please try again.":"We couldn't complete your request right now. Please try again in a moment.",err.data?.errors||{},isLead);if(isLead)button.textContent='Try again';}
  finally{submitting=false;button.disabled=false;if(button.textContent==='Please wait…')button.textContent=label;}
 });
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(a&&(paths.includes(a.getAttribute('href'))||a.getAttribute('href')==='/contact')){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const path=a.getAttribute('href');if(path.endsWith('/received')||path==='/request-received'){restoreReceipt(path);return;}show(path);return;}
  const toggle=e.target.closest('[data-reveal]');if(toggle){const input=document.getElementById(toggle.dataset.reveal),shown=input.type==='text';input.type=shown?'password':'text';toggle.textContent=shown?'Show':'Hide';toggle.setAttribute('aria-label',shown?'Show password':'Hide password');}
  if(e.target.closest('[data-cookie-settings]')){e.preventDefault();openPrefs();}
  const action=e.target.closest('[data-consent-action]')?.dataset.consentAction;if(action){if(action==='manage')openPrefs();else saveChoice(action==='accept'?{necessary:true,analytics:true,functional:true,advertising:!navigator.globalPrivacyControl}:defaults());}
 });
 function prefMarkup(){const selected=choice?.categories||defaults();return '<header class="cookie-modal-head"><h2 id="cookie-title" tabindex="-1">Cookie settings</h2><button type="button" data-close-prefs aria-label="Close cookie settings">×</button></header><p>Choose which optional technologies Truffl may use. You can change these choices at any time.</p><div class="cookie-error" role="alert" tabindex="-1" hidden></div>'+[
 ['necessary','Necessary','Required for security, authentication, privacy choices and requested website functions.'],['analytics','Analytics','Helps us understand how the website is used and improve its performance.'],['functional','Functional','Enables optional experiences such as embedded scheduling and media.'],['advertising','Advertising','Measures campaigns and may support retargeting or personalised advertising.']
 ].map(([id,title,desc])=>'<section class="cookie-category"><label><span><strong>'+title+(id==='necessary'?' (always active)':'')+'</strong><span>'+desc+'</span></span><input type="checkbox" name="'+id+'" '+(id==='necessary'||selected[id]?'checked ':'')+(id==='necessary'||(id==='advertising'&&navigator.globalPrivacyControl)?'disabled ':'')+'></label><details><summary>Provider details</summary>'+inventoryMarkup(id)+'</details></section>').join('')+(navigator.globalPrivacyControl?'<p>Your browser’s Global Privacy Control is active. Advertising remains off.</p>':'')+'<div class="cookie-actions"><button class="auth-primary" data-save-prefs>Save choices</button><button data-consent-action="accept">Accept all</button><button data-consent-action="reject">Reject non-essential</button></div>';}
 function inventoryMarkup(category){if(!config)return '<p>Provider details couldn’t load. Close and reopen settings to try again.</p>';const items=config.inventory.filter(i=>i.category===category);if(!items.length)return '<p>No '+category+' providers are configured on this website.</p>';return items.map(i=>'<dl><dt>Provider / technology</dt><dd>'+esc(i.provider)+' · '+esc(i.name)+'</dd><dt>Purpose</dt><dd>'+esc(i.purpose)+'</dd><dt>Duration</dt><dd>'+esc(i.duration)+'</dd><dt>Type</dt><dd>'+esc(i.party)+'</dd></dl>'+(i.detailsUrl?'<a href="'+esc(i.detailsUrl)+'" target="_blank" rel="noopener noreferrer">Provider cookie details ↗</a>':'')).join('');}
 async function openPrefs(){if(!config){try{config=await api('/api/bootstrap');}catch{}}prefs.innerHTML=prefMarkup();if(!prefs.open)prefs.showModal();prefs.querySelector('h2').focus();}
 prefs.addEventListener('click',e=>{if(e.target.closest('[data-close-prefs]'))prefs.close();if(e.target.closest('[data-save-prefs]')){const categories=defaults();for(const id of ['analytics','functional','advertising'])categories[id]=prefs.querySelector('[name='+id+']').checked;saveChoice(categories);}});
 async function saveChoice(categories){
  if(navigator.globalPrivacyControl)categories.advertising=false;
  
  // Withdrawal takes effect immediately, even if the server cannot record it yet.
  if(!categories.functional){stopEmbed();document.getElementById('calendly-widget-script')?.remove();}
  choice={id:crypto.randomUUID(),version:POLICY,categories:defaults(),timestamp:Date.now()};try{localStorage.setItem('truffl_privacy_choice',JSON.stringify(choice));}catch{}
  document.querySelectorAll('[data-consent-action],[data-save-prefs]').forEach(b=>b.disabled=true);
  try{await boot;choice=await api('/api/consent',{policyVersion:POLICY,categories,gpc:navigator.globalPrivacyControl===true});try{localStorage.setItem('truffl_privacy_choice',JSON.stringify(choice));}catch{}banner.hidden=true;if(prefs.open)prefs.close();announce('Your privacy choices have been saved.');}
  catch{choice.categories={necessary:true,analytics:false,functional:false,advertising:false};try{localStorage.setItem('truffl_privacy_choice',JSON.stringify(choice));}catch{}const box=prefs.open?prefs.querySelector('.cookie-error'):banner.querySelector('.cookie-error');box.hidden=false;box.textContent='Optional technologies remain off. We couldn’t record your choices right now. Please try again.';box.focus();}
  finally{document.querySelectorAll('[data-consent-action],[data-save-prefs]').forEach(b=>b.disabled=false);if(current==='/contact/submitted'&&dialog.open)schedule();}
 }
 function calendarFallback(){const status=document.getElementById('scheduler-status');if(!status)return;stopEmbed();status.innerHTML="The calendar couldn't load. "+(config?.booking.url?'<a href="'+esc(bookingURL())+'" target="_blank" rel="noopener noreferrer">Open Calendly in a new tab</a> or ':'')+'email us at <a href="mailto:'+EMAIL+'">'+EMAIL+'</a>.';}
 function bookingURL(){const u=new URL(config.booking.url);u.searchParams.set('name',receipt.fullName);u.searchParams.set('email',receipt.email);if(config.booking.companyQuestion)u.searchParams.set(config.booking.companyQuestion,receipt.company);u.searchParams.set('primary_color','315cff');return u.href;}
 async function schedule(){
  stopEmbed();const generation=embedGeneration;await boot;const status=document.getElementById('scheduler-status'),target=document.getElementById('calendly-embed');if(!status||!target||generation!==embedGeneration||!receipt)return;
  if(!config?.booking.url){calendarFallback();return;}
  const direct=document.getElementById('scheduler-link');if(direct){direct.hidden=false;direct.innerHTML='<a class="auth-primary" href="'+esc(bookingURL())+'" target="_blank" rel="noopener noreferrer">Book a time in Calendly ↗</a>';}
  if(!choice?.categories.functional){status.innerHTML='To use the embedded calendar, allow functional technologies in <button class="auth-link" type="button" data-cookie-settings>Cookie settings</button>. You can also <a href="'+esc(bookingURL())+'" target="_blank" rel="noopener noreferrer">open Calendly in a new tab</a>.';return;}
  status.textContent='Loading available times…';
  try{
   if(!window.Calendly){await new Promise((resolve,reject)=>{let script=document.getElementById('calendly-widget-script');if(!script){script=document.createElement('script');script.id='calendly-widget-script';script.src='https://assets.calendly.com/assets/external/widget.js';script.async=true;document.head.append(script);}script.addEventListener('load',resolve,{once:true});script.addEventListener('error',()=>{script.remove();reject();},{once:true});setTimeout(reject,15000);});}
   if(generation!==embedGeneration||!choice.categories.functional||!dialog.open)return;
   const prefill={name:receipt.fullName,email:receipt.email};if(config.booking.companyQuestion)prefill.customAnswers={[config.booking.companyQuestion]:receipt.company};
   window.Calendly.initInlineWidget({url:bookingURL(),parentElement:target,prefill,utm:{utmSource:attribution.utm_source,utmMedium:attribution.utm_medium,utmCampaign:attribution.utm_campaign}});
   frame=target.querySelector('iframe');embedTimer=setTimeout(calendarFallback,20000);
  }catch{if(generation===embedGeneration)calendarFallback();}
 }
 window.addEventListener('message',e=>{if(e.origin!=='https://calendly.com'||!frame||e.source!==frame.contentWindow||!choice?.categories.functional)return;const event=e.data?.event;if(['calendly.event_type_viewed','calendly.profile_page_viewed','calendly.date_and_time_selected','calendly.event_scheduled'].includes(event)){clearTimeout(embedTimer);const status=document.getElementById('scheduler-status');if(status)status.textContent=event==='calendly.event_scheduled'?'Your meeting is scheduled. Calendly will send the meeting details to you and the Truffl team.':'';if(event==='calendly.event_scheduled')announce('Your meeting is scheduled.');}});
 async function restoreReceipt(path){await boot;if(!preferredReceipt?.id){show(path.startsWith('/contact')?'/contact':'/request-access');return;}try{receipt=await api('/api/requests/'+preferredReceipt.id);preferredReceipt={id:receipt.id,kind:receipt.kind};try{sessionStorage.setItem('truffl_request_receipt',JSON.stringify(preferredReceipt));}catch{}show(receipt.kind==='contact'?'/contact/submitted':'/request-access/received');}catch(err){if(err.status===404){preferredReceipt=null;try{sessionStorage.removeItem('truffl_request_receipt');}catch{}}show(path.startsWith('/contact')?'/contact':'/request-access');error('We couldn’t retrieve the saved request. Please try again before submitting new details.');}}
 window.addEventListener('popstate',()=>{if(location.pathname==='/contact/submitted'||location.pathname==='/request-access/received')restoreReceipt(location.pathname);else if(paths.includes(location.pathname)||location.pathname==='/contact')show(location.pathname);else close();});
 window.addEventListener('DOMContentLoaded',()=>{const path=location.hash.replace(/^#/,'')||location.pathname;if(path==='/contact/submitted'||path==='/request-access/received'||path==='/request-received'){restoreReceipt(path);}else if(preferredReceipt?.pending&&(path==='/contact'||path==='/request-access'))restoreReceipt(path);else if(paths.includes(path)||path==='/contact')show(path);});
})();

