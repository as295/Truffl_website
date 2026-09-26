
(function(){
 const root=document.getElementById('v-pricing');if(!root)return;
 let rates=null,boot=null,requestVersion=0,timer=null,pending=null,accessToken=null;
 const pricingReady=window.trufflReady||fetch('/api/bootstrap',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error();return r.json();});
 const calculator=document.getElementById('pricing-calculator');
 const calculatorToggle=root.querySelector('.pricing-toggle');
 const gate=document.getElementById('calculator-gate'),accessForm=document.getElementById('calculator-access-form'),accessError=document.getElementById('calculator-access-error');
 function lockCalculator(){clearTimeout(timer);requestVersion++;accessToken=null;pending=null;calculator.hidden=true;calculatorToggle.setAttribute('aria-expanded','false');}
 function openGate(){lockCalculator();accessForm.reset();accessError.hidden=true;if(!gate.open)gate.showModal();accessForm.elements.name.focus();}
 calculatorToggle.addEventListener('click',()=>{if(!calculator.hidden)lockCalculator();else openGate();});
 gate.querySelector('.calculator-gate-close').addEventListener('click',()=>gate.close());
 accessForm.addEventListener('submit',async e=>{
  e.preventDefault();const button=accessForm.querySelector('button[type=submit]');if(button.disabled)return;
  const name=accessForm.elements.name.value.trim(),email=accessForm.elements.email.value.trim();
  if(!name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)){accessError.textContent='Enter your name and a valid email address.';accessError.hidden=false;return;}
  button.disabled=true;button.textContent='Opening…';
  try{await pricingReady;const response=await fetch('/api/pricing/access',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email}),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok)throw Error(result.message||'Please try again.');if(!gate.open||!root.classList.contains('on'))return;accessToken=result.token;gate.close();calculator.hidden=false;calculatorToggle.setAttribute('aria-expanded','true');if(!rates)boot=initialize();else queueUpdate();document.getElementById('pricing-calculator-heading').focus({preventScroll:true});calculator.scrollIntoView({behavior:'smooth',block:'start'});}
  catch(error){accessError.textContent=error.message;accessError.hidden=false;}
  finally{button.disabled=false;button.textContent='Open calculator →';}
 });
 new MutationObserver(()=>{if(!root.classList.contains('on')){lockCalculator();if(gate.open)gate.close();}}).observe(root,{attributes:true,attributeFilter:['class']});
 const $=id=>document.getElementById('pc-'+id);
 const form=document.getElementById('pricing-form');
 const money=(v,d=2)=>v===null?'—':v.toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
 function options(key,label){rates[key].forEach((m,i)=>{const o=document.createElement('option');o.value=i;o.textContent=label(m);$(key).append(o);});}
 async function initialize(){try{await pricingReady;const r=await fetch('/api/pricing/models');if(!r.ok)throw Error();rates=await r.json();options('llm',m=>m.name+' · '+m.route);options('stt',m=>m.provider==='Deepgram'?'Deepgram '+m.name:m.name);options('tts',m=>m.name);queueUpdate();}catch{boot=null;showError('The calculator could not load. Close and reopen it to try again.');}}
 const keys=['calls','duration','inputTokens','outputTokens','share','buffer','chars','bytes','fx'];
 function read(){const p={};for(const key of keys){const el=$(key);el.removeAttribute('aria-invalid');if(el.disabled){p[key]=key==='chars'?900:1388.888888888889;continue;}if(el.value.trim()===''||!el.validity.valid){el.setAttribute('aria-invalid','true');throw new Error('Check “'+el.closest('label').textContent.trim()+'” in your usage inputs.');}p[key]=Number(el.value);}for(const key of ['llm','stt','tts'])p[key]=Number($(key).value);
  if(rates.llm[p.llm].kind==='realtime')for(const key of ['audioInputTokens','audioOutputTokens']){const el=$(key);el.removeAttribute('aria-invalid');if(el.validity.badInput||!el.validity.valid){el.setAttribute('aria-invalid','true');throw Error('Enter a valid audio token count or leave it blank for an estimate.');}p[key]=el.value.trim()===''?null:Number(el.value);}return p;}
 async function update(version){
  if(!rates||calculator.hidden||!accessToken)return;
  const l=rates.llm[Number($('llm').value)],s=rates.stt[Number($('stt').value)],t=rates.tts[Number($('tts').value)];
  const realtime=l.kind==='realtime';
  for(const key of ['stt','tts']){$(key).disabled=realtime;$(key).closest('.pricing-model').hidden=realtime;}
  for(const key of ['chars','bytes']){$(key).disabled=realtime;$(key).closest('label').hidden=realtime;}
  root.querySelectorAll('[data-realtime-input]').forEach(el=>el.hidden=!realtime);
  $('realtime-note').hidden=!realtime;
  $('llm-rate').textContent='$'+l.input+' input / $'+l.output+' output per 1M '+(realtime?'text ':'')+'tokens · Uncached input rates'+(realtime?' · Audio: $'+l.audioInput+' input / $'+l.audioOutput+' output per 1M tokens':'');
  $('stt-rate').textContent=(s.currency==='INR'?'₹':'$')+Number(s.rate.toFixed(6))+' per audio minute';
  $('tts-rate').textContent=t.kind==='plan'?'Lowest-cost paid monthly plan + overage, calculated for your volume':(t.currency==='INR'?'₹':'$')+t.rate+' per '+(t.divisor===1000?'1,000 characters':'1M UTF-8 bytes');
  try{
   const p=read(),signature=JSON.stringify(p);
   if(pending?.signature!==signature)pending={signature,id:crypto.randomUUID()};
   const response=await fetch('/api/pricing/quotes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Calculator-Access':accessToken},body:JSON.stringify({idempotencyKey:pending.id,inputs:p}),signal:AbortSignal.timeout(30000)});
   const result=await response.json();if(!response.ok)throw Error(result.message||'Your estimate could not be calculated. Please try again.');
   if(version!==requestVersion)return;
   const c=result.quote;$('error').hidden=true;$('retry').hidden=true;
   $('sheet-status').textContent=result.sheetStatus==='synced'?'Estimate saved.':'Estimate saved. We’re retrying the connection to our records.';
   $('per-minute').textContent=c.perMinute===null?'—':'₹'+money(c.perMinute,4);
   $('total').textContent='₹'+money(c.total);
   $('usage').textContent=money(p.calls,0)+' connected calls · '+money(c.minutes,1)+' call minutes / month';
   const rows=[...(c.realtime?[['Realtime text','Text input + output',c.llm],['Realtime audio input','Caller audio',c.audioInput],['Realtime audio output','Agent audio',c.audioOutput]]:[['Language model','Token usage',c.llm],['Speech to text','Connected audio',c.stt],['Text to speech',c.plan?'Monthly plan + overage':'Agent speech',c.tts]]),['Model subtotal',c.realtime?'GPT Realtime Mini':'LLM + STT + TTS',c.provider],['Truffl platform','₹1 once per calculation total',c.platform],['Combined total','',c.total]];
   $('breakdown').innerHTML=rows.map(r=>'<tr><td>'+r[0]+(r[1]?'<small>'+r[1]+'</small>':'')+'</td><td>'+money(c.minutes>0?r[2]/c.minutes:null,4)+'</td><td>'+money(r[2])+'</td></tr>').join('');
   $('plan').textContent=c.plan?'Cartesia '+c.plan.name+': $'+c.plan.fee+' monthly subscription with '+money(c.plan.included,0)+' included credits; overage included in the estimate.':'';
  }catch(e){if(version===requestVersion)showError(e.message);}
 }
 function showError(message){$('retry').hidden=false;$('error').textContent=message;$('error').hidden=false;$('per-minute').textContent='—';$('total').textContent='—';$('breakdown').innerHTML='';$('usage').textContent='';$('plan').textContent='';}
 function queueUpdate(){clearTimeout(timer);const version=++requestVersion;if(!rates||calculator.hidden)return;$('retry').hidden=true;$('error').hidden=true;$('per-minute').textContent='—';$('total').textContent='—';$('breakdown').innerHTML='';$('plan').textContent='';$('usage').textContent='Calculating…';timer=setTimeout(()=>update(version),600);}
 $('retry').addEventListener('click',()=>{if(!rates)boot=initialize();else queueUpdate();});
 form.addEventListener('submit',e=>{e.preventDefault();queueUpdate();});form.addEventListener('input',queueUpdate);form.addEventListener('change',queueUpdate);
})();

