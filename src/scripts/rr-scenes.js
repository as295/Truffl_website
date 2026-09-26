(function(){
/* ---------- shared helpers ---------- */
var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var DPR = Math.min(window.devicePixelRatio || 1, 2);
var PAPER = '244,241,232', COB = '#3b66d6', HAIR = 'rgba(216,214,204,.34)';

function makeGrain(){
  var g = document.createElement('canvas'); g.width = g.height = 140;
  var c = g.getContext('2d'), d = c.createImageData(140,140);
  for (var i=0; i<d.data.length; i+=4){
    var v = 200 + Math.random()*55;
    d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=Math.random()*36;
  }
  c.putImageData(d,0,0); return g;
}
var GRAIN = null;

function beam(c, ox, oy, ang, spread, len, col, a0){
  c.save(); c.translate(ox,oy); c.rotate(ang);
  var g = c.createLinearGradient(0,0,len,0);
  g.addColorStop(0,'rgba('+col+','+a0+')');
  g.addColorStop(0.38,'rgba('+col+','+(a0*0.42).toFixed(3)+')');
  g.addColorStop(1,'rgba('+col+',0)');
  c.fillStyle = g;
  var t = Math.tan(spread)*len;
  c.beginPath(); c.moveTo(0,0); c.lineTo(len,-t); c.lineTo(len,t); c.closePath(); c.fill();
  c.restore();
}

/* one continuous light field for the whole page */
(function(){
  var cv=document.getElementById('rrbg'); if(!cv) return;
  var ctx=cv.getContext('2d'), PW=0,PH=0,BD=1;
  function build(){
    ctx.setTransform(BD,0,0,BD,0,0);
    ctx.fillStyle='#000'; ctx.fillRect(0,0,PW,PH);
    var hero=document.getElementById('rr-hero');
    var SH=hero?hero.offsetHeight:PH*0.4;
    /* the hero paints its own gradient, so the field begins beneath it */
    [[PW*0.30,SH+(PH-SH)*0.18,Math.sqrt(PW*PW+SH*SH),0.95],
     [PW*0.74,SH+(PH-SH)*0.58,Math.sqrt(PW*PW+SH*SH),0.8],
     [PW*0.24,SH+(PH-SH)*0.90,Math.sqrt(PW*PW+SH*SH),0.7]].forEach(function(o,i){
      var ox=o[0],oy=o[1],D=o[2],k=o[3];
      ctx.save(); ctx.globalCompositeOperation='lighter';
      if('filter' in ctx) ctx.filter='blur(50px)';
      var up = i===0 ? -1 : (i===1 ? -1 : -1);
      beam(ctx,ox,oy,-2.42,0.22,D*1.30,PAPER,0.30*k);
      beam(ctx,ox,oy,-1.94,0.16,D*1.20,PAPER,0.24*k);
      beam(ctx,ox,oy,-1.10,0.28,D*1.24,'49,92,255',0.28*k);
      beam(ctx,ox,oy,-0.74,0.22,D*1.05,'24,56,168',0.24*k);
      var core=ctx.createRadialGradient(ox,oy,0,ox,oy,D*0.50);
      core.addColorStop(0,'rgba(244,241,232,'+(0.34*k).toFixed(3)+')');
      core.addColorStop(0.24,'rgba(244,241,232,'+(0.11*k).toFixed(3)+')');
      core.addColorStop(0.58,'rgba(232,237,255,'+(0.04*k).toFixed(3)+')');
      core.addColorStop(1,'rgba(244,241,232,0)');
      ctx.fillStyle=core; ctx.fillRect(0,0,PW,PH); ctx.restore();
    });
    ctx.save();
    var lr=ctx.createLinearGradient(0,0,PW*0.16,0);
    lr.addColorStop(0,'rgba(0,0,0,0.55)'); lr.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=lr; ctx.fillRect(0,0,PW*0.16,PH);
    var rr=ctx.createLinearGradient(PW,0,PW*0.84,0);
    rr.addColorStop(0,'rgba(0,0,0,0.55)'); rr.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rr; ctx.fillRect(PW*0.84,0,PW*0.16,PH);
    var tp=ctx.createLinearGradient(0,SH,0,SH+220);
    tp.addColorStop(0,'rgba(0,0,0,1)'); tp.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=tp; ctx.fillRect(0,SH,PW,220);
    var bt=ctx.createLinearGradient(0,PH,0,PH-PH*0.06);
    bt.addColorStop(0,'rgba(0,0,0,1)'); bt.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bt; ctx.fillRect(0,PH-PH*0.06,PW,PH*0.06);
    ctx.restore();
    if(!GRAIN) GRAIN=makeGrain();
    ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle=ctx.createPattern(GRAIN,'repeat');
    ctx.fillRect(0,0,PW,PH); ctx.restore();
  }
  function size(){
    var w=document.documentElement.clientWidth;
    var f=document.getElementById('rrfoot');
    if(!f) return true; /* The shared footer replaces this retired background anchor. */
    var h=Math.ceil(f.getBoundingClientRect().bottom+(window.pageYOffset||0));
    if(!w||!h) return false;
    if(w===PW&&h===PH) return true;
    PW=w;PH=h;BD=Math.min(DPR, PW*PH>2200000?1:1.5);
    cv.width=Math.round(PW*BD); cv.height=Math.round(PH*BD); cv.style.height=PH+'px';
    build(); return true;
  }
  (function init(){ if(!size()) requestAnimationFrame(init); })();
  addEventListener('resize',size); addEventListener('load',size);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) size(); });
})();

/* closing panel light */
(function(){
  var cv=document.getElementById('ctabg'); if(!cv) return;
  var ctx=cv.getContext('2d'), W=0,H=0;
  function build(){
    var BD=Math.min(DPR,1.5);
    cv.width=Math.round(W*BD); cv.height=Math.round(H*BD); ctx.setTransform(BD,0,0,BD,0,0);
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    var cy=H*0.52, gap=Math.min(W*0.05,62), D=Math.sqrt(W*W+H*H);
    ctx.save(); ctx.globalCompositeOperation='lighter';
    if('filter' in ctx) ctx.filter='blur(46px)';
    beam(ctx,-W*0.10,cy,0.09,0.13,W*0.62,PAPER,0.46);
    beam(ctx,-W*0.10,cy,-0.13,0.09,W*0.56,PAPER,0.34);
    beam(ctx,W*1.10,cy,3.15,0.13,W*0.62,'49,92,255',0.50);
    beam(ctx,W*1.10,cy,3.29,0.09,W*0.56,'24,56,168',0.38);
    var a=ctx.createRadialGradient(W*0.5-gap,cy,0,W*0.5-gap,cy,W*0.24);
    a.addColorStop(0,'rgba(244,241,232,0.46)'); a.addColorStop(0.26,'rgba(244,241,232,0.14)');
    a.addColorStop(1,'rgba(244,241,232,0)'); ctx.fillStyle=a; ctx.fillRect(0,0,W,H);
    var b=ctx.createRadialGradient(W*0.5+gap,cy,0,W*0.5+gap,cy,W*0.24);
    b.addColorStop(0,'rgba(49,92,255,0.44)'); b.addColorStop(0.26,'rgba(24,56,168,0.15)');
    b.addColorStop(1,'rgba(49,92,255,0)'); ctx.fillStyle=b; ctx.fillRect(0,0,W,H); ctx.restore();
    ctx.save();
    var vig=ctx.createRadialGradient(W*0.5,cy,D*0.10,W*0.5,cy,D*0.80);
    vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(0.58,'rgba(0,0,0,0.26)');
    vig.addColorStop(1,'rgba(0,0,0,0.86)'); ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    var tp=ctx.createLinearGradient(0,0,0,H*0.30);
    tp.addColorStop(0,'rgba(0,0,0,0.80)'); tp.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=tp; ctx.fillRect(0,0,W,H*0.30);
    var bt=ctx.createLinearGradient(0,H,0,H*0.62);
    bt.addColorStop(0,'rgba(0,0,0,1)'); bt.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bt; ctx.fillRect(0,H*0.62,W,H*0.38); ctx.restore();
    if(!GRAIN) GRAIN=makeGrain();
    ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle=ctx.createPattern(GRAIN,'repeat');
    ctx.fillRect(0,0,W,H); ctx.restore();
  }
  function size(){ var w=cv.clientWidth,h=cv.clientHeight;
    if(!w||!h) return false; if(w===W&&h===H) return true; W=w;H=h; build(); return true; }
  (function init(){ if(!size()) requestAnimationFrame(init); })();
  addEventListener('resize',size); addEventListener('load',size);
  if(window.ResizeObserver) new ResizeObserver(size).observe(cv.parentNode);
})();


})();