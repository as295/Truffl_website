(function(){
 'use strict';
 // Only known routes are sent; query strings, form fields and contact details
 // never become analytics parameters. The tag is not loaded without consent.
 const paths={home:'/',platform:'/platform/voice-ai-studio',pricing:'/pricing',rr:'/solutions/revenue-recovery',cx:'/solutions/cx-support',ent:'/enterprise',vision:'/vision',trust:'/trust',evals:'/platform/evals-studio',appstudio:'/platform/app-studio',privacy:'/privacy',terms:'/terms',cookies:'/cookies',refunds:'/refund-policy',delivery:'/delivery-policy'};
 let id=null,allowed=false,loaded=false,currentView=document.body.dataset.view||'home',lastPage=null;
 const valid=x=>/^G-[A-Z0-9]+$/.test(x||'');
 const event=(name,params={})=>{if(!allowed||!id||!loaded)return;window.gtag('event',name,params);};
 const page=()=>{if(!allowed||!loaded)return;const path=paths[currentView]||'/';if(path===lastPage)return;const referrer=lastPage?location.origin+lastPage:(document.referrer?new URL(document.referrer).origin:'');lastPage=path;event('page_view',{page_title:document.title,page_location:location.origin+path,page_referrer:referrer});};
 function configure(measurementId,consent){
  if(!valid(measurementId))return;id=measurementId;const next=consent===true;
  if(!next){if(loaded){window.gtag('consent','update',{analytics_storage:'denied'});window['ga-disable-'+id]=true;}allowed=false;lastPage=null;return;}
  allowed=true;window['ga-disable-'+id]=false;
  if(!loaded){
   window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   window.gtag('consent','update',{analytics_storage:'granted'});
   window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+(paths[currentView]||'/'),page_referrer:document.referrer?new URL(document.referrer).origin:''});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(script);loaded=true;
  }else window.gtag('consent','update',{analytics_storage:'granted'});
  page();
 }
 window.trufflAnalytics={configure,event};
 window.addEventListener('truffl:view',e=>{currentView=e.detail?.name||'home';page();});
 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href="/contact"],a[href="/request-access"]');if(a)event('demo_cta_click',{placement:currentView});},true);
})();
