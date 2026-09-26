(function(){
(function(){
  var targets=[].slice.call(document.querySelectorAll('.fcell,.fwide,.tcards'));
  function show(e){e.classList.add('in')}
  if(!('IntersectionObserver' in window)){targets.forEach(show);return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},
    {threshold:0,rootMargin:'0px 0px -5% 0px'});
  targets.forEach(function(e){io.observe(e)});
  /* safety net: if the observer never fires -- an embedded frame, a scroll
     container we do not own -- the copy must not sit at opacity 0 forever */
  setTimeout(function(){targets.forEach(function(e){
    if(!e.classList.contains('in') && e.getBoundingClientRect().top < innerHeight*1.6) show(e);
  });},1400);
  addEventListener('scroll',function once(){targets.forEach(function(e){
    if(!e.classList.contains('in') && e.getBoundingClientRect().top < innerHeight) show(e);
  });},{passive:true});
})();

})();