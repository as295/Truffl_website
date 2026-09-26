
/* ---------- view router: the two pages, one document ----------
   Deliberately does NOT depend on location.hash assignment or on click
   delegation from document: an artifact host may sandbox history/hash, and
   may intercept anchor clicks in the capture phase before a bubbled
   document listener would ever run. So each link gets a direct listener,
   the view switch is pure DOM, and the URL update is best-effort. */
(function(){
  var V={evals:document.getElementById('v-evals'),appstudio:document.getElementById('v-appstudio'),notfound:document.getElementById('v-notfound'),unavailable:document.getElementById('v-unavailable'),privacy:document.getElementById('v-privacy'),terms:document.getElementById('v-terms'),cookies:document.getElementById('v-cookies'),pricing:document.getElementById('v-pricing'), platform:document.getElementById('v-platform'), home:document.getElementById('v-home'), rr:document.getElementById('v-rr'),
         cx:document.getElementById('v-cx'),
         ent:document.getElementById('v-ent'), vision:document.getElementById('v-vision'), trust:document.getElementById('v-trust')};
  var TITLE={evals:'Evals Studio | Truffl',appstudio:'App Studio | Truffl',notfound:'Page not found | Truffl',unavailable:'Temporarily unavailable | Truffl',privacy:'Privacy Policy | Truffl',terms:'Terms of Service | Truffl',cookies:'Cookie Notice | Truffl',pricing:'Pricing calculator | Truffl', auth:'Login | Truffl', platform:'AI Orchestration Platform | Truffl', home:'Truffl', rr:'Revenue Recovery for D2C Commerce | Truffl',
             cx:'Voice CX Support for Retail | Truffl', ent:'Enterprise | Truffl', vision:'Vision | Truffl', trust:'Trust & Security | Truffl'};
  var HASH={evals:'#/platform/evals-studio',appstudio:'#/platform/app-studio',privacy:'#/privacy',terms:'#/terms',cookies:'#/cookies',pricing:'#/pricing',platform:'#/platform/voice-ai-studio', home:'#/', rr:'#/solutions/revenue-recovery',
            cx:'#/solutions/cx-support', ent:'#/enterprise', vision:'#/vision', trust:'#/trust'};
  var ROUTE={'#/platform/evals-studio':'evals','#/platform/app-studio':'appstudio','#/service-unavailable':'unavailable','#/privacy':'privacy','#/terms':'terms','#/cookies':'cookies','#/pricing':'pricing','#/platform/voice-ai-studio':'platform','#/vision':'vision','#/trust':'trust','':'home','#':'home','#/':'home',
             '#/solutions/revenue-recovery':'rr',
             '#/solutions/cx-support':'cx','#/enterprise':'ent'};

  function paint(){
    /* The hidden view measured zero at load, so its canvases must repaint on
       show. Fire immediately (the handlers read getBoundingClientRect, which
       forces layout, so this is already accurate), then again on rAF and on
       timers -- rAF alone is not dependable when the frame is throttled. */
    function fire(){ try{ dispatchEvent(new Event('resize')); }catch(e){} }
    fire();
    if(window.requestAnimationFrame)
      requestAnimationFrame(function(){ fire(); requestAnimationFrame(fire); });
    setTimeout(fire,60); setTimeout(fire,260);
  }
  function show(name){
    if(!V[name]) name='home';
    for(var k in V) V[k].classList.toggle('on', k===name);
    document.body.setAttribute('data-view', name);
    try{ document.title=TITLE[name]; }catch(e){}
    try{ window.scrollTo(0,0); }catch(e){}
    paint();
  }
  window.trufflShowSiteView=show;
  function go(name){
    if(window.trufflCloseAuthModal) window.trufflCloseAuthModal();
    if(window.trufflAuthPaths && window.trufflAuthPaths.includes(location.pathname)) history.pushState({},'','/');
    if(window.trufflCloseMobileMenu) window.trufflCloseMobileMenu();
    closeMenus();
    var path=(HASH[name]||'#/').slice(1);
    if(location.pathname!==path||location.hash){
      try{history.pushState({},'',location.protocol==='file:'?'#'+path:path);}catch(e){}
    }
    show(name);
    var title=V[name]&&V[name].querySelector('h1');
    if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
  }

  function closeMenus(){
    [].forEach.call(document.querySelectorAll('.navsol.open'), function(n){
      n.classList.remove('open');
      var t=n.querySelector('.navsol-t'); if(t) t.setAttribute('aria-expanded','false');
    });
  }

  function target(e){
    var authLink=e.target && e.target.closest && e.target.closest('a[href]');
    if(authLink && window.trufflAuthPaths && (window.trufflAuthPaths.includes(authLink.getAttribute('href')) || authLink.getAttribute('href')==='/contact')) return null;
    var n=e.target && e.target.closest && e.target.closest('[data-nav]');
    if(n) return n.getAttribute('data-nav');
    var a=e.target && e.target.closest && e.target.closest('a[href]');
    if(!a) return null;
    var h=a.getAttribute('href');
    if(h==='/solutions/revenue-recovery') return 'rr';
    if(h==='/solutions/cx-support') return 'cx';
    if(h==='/privacy') return 'privacy';
    if(h==='/terms') return 'terms';
    if(h==='/cookies') return 'cookies';
    if(h==='/pricing') return 'pricing';
    if(h==='/enterprise') return 'ent';
    if(h==='/platform/voice-ai-studio') return 'platform';
    return h==='/' ? 'home' : null;
  }
  /* Registered routes exist. Every other href beginning with "/" is a page that has
     not been built yet -- /contact, /vision, /login, /blog and the rest. Left
     alone they navigate the review copy away to a 404, so the click is
     swallowed on click only (preventDefault on touchstart would block the
     scroll). Nothing here changes how the links look; delete a path from
     BUILT as each page lands. */
  var BUILT={'/privacy':1,'/terms':1,'/cookies':1,'/pricing':1,'/platform/voice-ai-studio':1,'/':1,'/solutions/revenue-recovery':1,
             '/solutions/cx-support':1,'/enterprise':1};
  function unbuilt(e){
    var authLink=e.target && e.target.closest && e.target.closest('a[href]');
    if(authLink && window.trufflAuthPaths && (window.trufflAuthPaths.includes(authLink.getAttribute('href')) || authLink.getAttribute('href')==='/contact')) return false;
    var a=e.target && e.target.closest && e.target.closest('a[href]');
    if(!a) return false;
    var h=a.getAttribute('href')||'';
    return h.charAt(0)==='/' && !BUILT[h];   /* in-page anchors and http(s) links untouched */
  }
  function nav(e){
    if(e.target.closest&&e.target.closest('[data-footer-developers]')){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.button!==undefined&&e.button!==0))return;
      e.preventDefault();e.stopPropagation();go('home');history.replaceState({},'',location.protocol==='file:'?'#k2c':'/#k2c');
      requestAnimationFrame(function(){var section=document.getElementById('k2c');if(section){section.scrollIntoView({block:'start'});var title=section.querySelector('h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}});return;
    }
    var name=target(e);
    if(!name) return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.button!==undefined&&e.button!==0))return;
    e.preventDefault(); e.stopPropagation(); go(name);
  }
  /* One activation per click, including keyboard and mobile taps.
     Keep pointer presses free so dragging and scrolling never navigate. */
  addEventListener('click', nav, true);

  /* the Solutions menu, also window capture-phase */
  addEventListener('click', function(e){
    var t=e.target && e.target.closest && e.target.closest('.navsol-t');
    if(t){
      var box=t.parentNode, wasOpen=box.classList.contains('open');
      closeMenus();
      if(!wasOpen){ box.classList.add('open'); t.setAttribute('aria-expanded','true'); }
      e.preventDefault(); e.stopPropagation(); return;
    }
    if(!(e.target && e.target.closest && e.target.closest('.navsol'))) closeMenus();
  }, true);

  addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenus(); });
  /* only act on a hash this router actually owns; anything else is the host's */
  addEventListener('hashchange', function(){
    var h=''; try{ h=location.hash; }catch(e){}
    if(!h||ROUTE.hasOwnProperty(h)) show(routeFromLocation());
  });

  function routeFromLocation(){if(location.protocol==='file:')return ROUTE[location.hash]||'home';var p=location.pathname;return (location.hash&&ROUTE[location.hash])||ROUTE['#'+p]||(['/login','/contact','/contact/submitted','/request-access','/request-access/received','/request-received','/activate-account','/invitation-expired','/invitation-sent','/forgot-password','/reset-password','/reset-expired','/reset-email-sent','/reset-complete'].includes(p)?'home':'notfound');}
  addEventListener('popstate',function(){if(!location.hash||ROUTE[location.hash])show(routeFromLocation());});
  show(routeFromLocation());
})();
