
(function(){
 var menu=document.getElementById('mobile-navigation'),opener=null;
 function close(restore){if(!menu.open)return;menu.close();document.body.classList.remove('mobile-menu-open');if(restore&&opener)opener.focus();}
 window.trufflCloseMobileMenu=function(){var wasOpen=menu.open;close(false);if(wasOpen)requestAnimationFrame(function(){var heading=document.querySelector('.view.on h1');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}});};
 document.querySelectorAll('.mobile-menu-toggle').forEach(function(button){button.addEventListener('click',function(){opener=button;var view=document.body.getAttribute('data-view')||'home';menu.querySelectorAll('[data-nav]').forEach(function(a){if(a.dataset.nav===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});menu.showModal();document.body.classList.add('mobile-menu-open');});});
 menu.querySelector('.mobile-nav-close').addEventListener('click',function(){close(true);});
 menu.addEventListener('click',function(e){if(e.target===menu){var r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(true);}});
 menu.addEventListener('close',function(){document.body.classList.remove('mobile-menu-open');});
 window.matchMedia('(min-width:901px)').addEventListener('change',function(e){if(e.matches)close(false);});
})();
