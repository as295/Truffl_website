
(function(){
 var demo=document.getElementById('creator-demo');if(!demo||demo.closest('[inert]'))return;
 var tabs=Array.from(demo.querySelectorAll('[data-creator-tab]'));
 var panels=Array.from(demo.querySelectorAll('.creator-spotlight'));
 var dots=Array.from(demo.querySelectorAll('.creator-progress i'));
 var chips=['Your voice. Your instructions.','Grounded in your business.','Actions inside your policies.','Build. Test. Refine.'];
 var selected=0, timer=null, visible=false, paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 var pause=document.getElementById('creator-pause');
 function select(index){selected=(index+tabs.length)%tabs.length;tabs.forEach(function(t,i){t.setAttribute('aria-selected',i===selected?'true':'false');t.tabIndex=i===selected?0:-1;panels[i].hidden=i!==selected;dots[i].classList.toggle('on',i===selected);});document.getElementById('creator-chip-text').textContent=chips[selected];}
 function schedule(){clearInterval(timer);timer=null;if(!paused&&visible&&!document.hidden)timer=setInterval(function(){if(!demo.contains(document.activeElement))select(selected+1);},6500);}
 function sync(){demo.classList.toggle('is-paused',paused);pause.textContent=paused?'Play ▷':'Pause Ⅱ';pause.setAttribute('aria-label',paused?'Play animated preview':'Pause animated preview');schedule();}
 tabs.forEach(function(t,i){t.addEventListener('click',function(){select(i);paused=true;sync();});t.addEventListener('keydown',function(e){var n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(n);tabs[n].focus();paused=true;sync();});});
 pause.addEventListener('click',function(){paused=!paused;sync();});
 if('IntersectionObserver' in window){new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(demo);}else{visible=true;}
 document.addEventListener('visibilitychange',schedule);sync();
})();
