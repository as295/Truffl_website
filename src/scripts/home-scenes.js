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

/* ===================== CONTINUOUS PAGE BACKGROUND =====================
   The two approved compositions are painted at full page size and cross-faded
   through the boundary, so each section reads exactly as designed and there is
   no edge where they meet. */
(function(){
  var cv = document.getElementById('pagebg'), ctx = cv.getContext('2d');
  var stage = document.getElementById('stage'), works = document.getElementById('works');
  if (!works) return;
  var stackEl = document.getElementById('stack');
  var heroEl = document.querySelector('.hero');
  var lastEl = document.querySelector('.hero .card');
  var PW = 0, PH = 0, BD = 1, SH = 0, WT = 0, WH = 0, TT = 0, VH = 0;
  var FEATHER = 150;                     /* half-width of the cross-fade, in px */

  function paintHero(c){
    var ox = PW*0.54, oy = SH*1.04, D = Math.sqrt(PW*PW + SH*SH);
    c.save(); c.globalCompositeOperation = 'lighter';
    if ('filter' in c) c.filter = 'blur(46px)';
    beam(c,ox,oy,-2.42,0.21,D*1.42,PAPER,0.52);
    beam(c,ox,oy,-2.10,0.14,D*1.30,PAPER,0.36);
    beam(c,ox,oy,-2.64,0.10,D*1.18,'216,214,204',0.24);
    beam(c,ox,oy,-1.62,0.17,D*1.06,PAPER,0.32);
    beam(c,ox,oy,-1.05,0.31,D*1.16,'49,92,255',0.42);
    beam(c,ox,oy,-0.72,0.25,D*0.98,'24,56,168',0.44);
    beam(c,ox,oy,-0.40,0.21,D*0.80,'24,56,168',0.28);
    var core = c.createRadialGradient(ox,oy,0,ox,oy,D*0.44);
    core.addColorStop(0,'rgba(244,241,232,0.92)');
    core.addColorStop(0.16,'rgba(244,241,232,0.34)');
    core.addColorStop(0.46,'rgba(232,237,255,0.10)');
    core.addColorStop(1,'rgba(244,241,232,0)');
    c.fillStyle = core; c.fillRect(0,0,PW,PH); c.restore();

    c.save();
    var vig = c.createRadialGradient(ox,oy,D*0.10,ox,oy,D*0.96);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.62,'rgba(0,0,0,0.30)');
    vig.addColorStop(1,'rgba(0,0,0,0.84)');
    c.fillStyle = vig; c.fillRect(0,0,PW,PH);
    var top = c.createLinearGradient(0,0,0,SH*0.34);
    top.addColorStop(0,'rgba(0,0,0,0.70)'); top.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle = top; c.fillRect(0,0,PW,SH*0.34);
    c.restore();
  }

  function paintWorks(c){
    var ox = PW*0.50, oy = WT - WH*0.10, D = Math.sqrt(PW*PW + WH*WH);
    c.save(); c.globalCompositeOperation = 'lighter';
    if ('filter' in c) c.filter = 'blur(52px)';
    beam(c,ox,oy,1.05,0.24,D*1.20,PAPER,0.34);
    beam(c,ox,oy,1.42,0.18,D*1.30,PAPER,0.42);
    beam(c,ox,oy,1.75,0.20,D*1.15,'216,214,204',0.22);
    beam(c,ox,oy,2.10,0.28,D*1.10,'49,92,255',0.36);
    beam(c,ox,oy,2.42,0.22,D*0.95,'24,56,168',0.34);
    var core = c.createRadialGradient(ox,oy,0,ox,oy,D*0.46);
    core.addColorStop(0,'rgba(244,241,232,0.70)');
    core.addColorStop(0.18,'rgba(244,241,232,0.24)');
    core.addColorStop(0.5,'rgba(232,237,255,0.07)');
    core.addColorStop(1,'rgba(244,241,232,0)');
    c.fillStyle = core; c.fillRect(0,0,PW,PH); c.restore();

    c.save();
    var vig = c.createRadialGradient(ox,oy,D*0.10,ox,oy,D*0.98);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.6,'rgba(0,0,0,0.32)');
    vig.addColorStop(1,'rgba(0,0,0,0.88)');
    c.fillStyle = vig; c.fillRect(0,0,PW,PH); c.restore();
  }

  /* The stack card's own painted field, blitted so its bottom edge lands exactly on
     the stack's bottom edge, with its final row extended past the join. Matching by
     reuse rather than by reconstruction - there is nothing left to get wrong. */
  function paintStackCarry(c){
    c.fillStyle = '#000'; c.fillRect(0,0,PW,PH);
    var f = window.TRUFFL_STACK_FIELD;
    if (!f || !f.width || !f.height) return false;
    c.drawImage(f, 0, TT - VH, PW, VH);
    /* Continue past the join by mirroring the field about TT. Row zero of the mirror
       IS the field's last row, so the two meet exactly, and what follows is the
       field's own gradient retraced - smooth, and carrying its own grain. */
    c.save();
    c.translate(0, TT + 1); c.scale(1,-1);
    c.drawImage(f, 0, -VH, PW, VH);
    c.restore();
    return true;
  }

  /* a source of its own for the far tail, faded in below the join */
  function paintTailSource(c){
    var ox = PW*0.30, oy = TT + (PH-TT)*0.16, D = Math.sqrt(PW*PW + (PH-TT)*(PH-TT));
    c.fillStyle = '#000'; c.fillRect(0,0,PW,PH);
    c.save(); c.globalCompositeOperation = 'lighter';
    if ('filter' in c) c.filter = 'blur(54px)';
    beam(c,ox,oy,0.42,0.26,D*1.20,PAPER,0.26);
    beam(c,ox,oy,0.86,0.20,D*1.30,PAPER,0.22);
    beam(c,ox,oy,-0.30,0.22,D*1.10,'216,214,204',0.12);
    beam(c,ox,oy,1.30,0.30,D*1.25,'49,92,255',0.24);
    beam(c,ox,oy,1.72,0.24,D*1.05,'24,56,168',0.22);
    var core = c.createRadialGradient(ox,oy,0,ox,oy,D*0.70);
    core.addColorStop(0,'rgba(244,241,232,0.34)');
    core.addColorStop(0.26,'rgba(244,241,232,0.12)');
    core.addColorStop(0.58,'rgba(232,237,255,0.05)');
    core.addColorStop(1,'rgba(244,241,232,0)');
    c.fillStyle = core; c.fillRect(0,0,PW,PH); c.restore();

    c.save();
    var vig = c.createRadialGradient(ox,oy,D*0.24,ox,oy,D*1.30);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.70,'rgba(0,0,0,0.16)');
    vig.addColorStop(1,'rgba(0,0,0,0.60)');
    c.fillStyle = vig; c.fillRect(0,0,PW,PH); c.restore();
  }

  /* tail = the card's light carried past the join, cross-faded into its own source */
  function paintTail(c){
    var carried = paintStackCarry(c);
    if (!carried){ paintTailSource(c); return; }
    var lay = document.createElement('canvas');
    lay.width = Math.round(PW*BD); lay.height = Math.round(PH*BD);
    var lc = lay.getContext('2d'); lc.setTransform(BD,0,0,BD,0,0);
    paintTailSource(lc);
    lc.save(); lc.globalCompositeOperation = 'destination-in';
    var m = lc.createLinearGradient(0, TT, 0, TT + Math.min(Math.max(VH*0.55, 320), VH*0.88));
    m.addColorStop(0,'rgba(0,0,0,0)'); m.addColorStop(1,'rgba(0,0,0,1)');
    lc.fillStyle = m; lc.fillRect(0,0,PW,PH); lc.restore();
    c.drawImage(lay, 0, 0, PW, PH);
    lay.width = lay.height = 0;
  }

  function build(){
    ctx.setTransform(BD,0,0,BD,0,0);
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,PW,PH);
    paintHero(ctx);

    /* works composition on its own layer, its top edge feathered away, then laid over */
    var lay = document.createElement('canvas');
    lay.width = Math.round(PW*BD); lay.height = Math.round(PH*BD);
    var lc = lay.getContext('2d'); lc.setTransform(BD,0,0,BD,0,0);
    lc.fillStyle = '#000'; lc.fillRect(0,0,PW,PH);
    paintWorks(lc);
    lc.save(); lc.globalCompositeOperation = 'destination-in';
    var m = lc.createLinearGradient(0, WT - FEATHER, 0, WT + FEATHER);
    m.addColorStop(0,'rgba(0,0,0,0)'); m.addColorStop(1,'rgba(0,0,0,1)');
    lc.fillStyle = m; lc.fillRect(0,0,PW,PH); lc.restore();
    ctx.drawImage(lay, 0, 0, PW, PH);
    lay.width = lay.height = 0;

    if (TT > 0 && TT < PH - 40){
      var t2 = document.createElement('canvas');
      t2.width = Math.round(PW*BD); t2.height = Math.round(PH*BD);
      var t2c = t2.getContext('2d'); t2c.setTransform(BD,0,0,BD,0,0);
      t2c.fillStyle = '#000'; t2c.fillRect(0,0,PW,PH);
      paintTail(t2c);
      t2c.save(); t2c.globalCompositeOperation = 'destination-in';
      var m2 = t2c.createLinearGradient(0, TT - FEATHER*2, 0, TT);
      m2.addColorStop(0,'rgba(0,0,0,0)'); m2.addColorStop(1,'rgba(0,0,0,1)');
      t2c.fillStyle = m2; t2c.fillRect(0,0,PW,PH); t2c.restore();
      ctx.drawImage(t2, 0, 0, PW, PH);
      t2.width = t2.height = 0;
    }

    /* Grain, but not twice. Below the join the carried field already has its own
       baked in, so ours ramps in exactly as the tail source does. */
    if (!GRAIN) GRAIN = makeGrain();
    var top = (TT > 0 && TT < PH) ? TT : PH;
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = ctx.createPattern(GRAIN,'repeat');
    ctx.fillRect(0,0,PW,top); ctx.restore();

    if (top < PH){
      var gh = PH - TT;
      var g2 = document.createElement('canvas');
      g2.width = Math.round(PW*BD); g2.height = Math.round(gh*BD);
      var gc = g2.getContext('2d'); gc.setTransform(BD,0,0,BD,0,0);
      gc.fillStyle = gc.createPattern(GRAIN,'repeat'); gc.fillRect(0,0,PW,gh);
      gc.globalCompositeOperation = 'destination-in';
      var gm = gc.createLinearGradient(0,0,0,Math.min(Math.max(VH*0.55,320), VH*0.88));
      gm.addColorStop(0,'rgba(0,0,0,0)'); gm.addColorStop(1,'rgba(0,0,0,1)');
      gc.fillStyle = gm; gc.fillRect(0,0,PW,gh);
      ctx.save(); ctx.globalAlpha = 0.5;
      ctx.drawImage(g2, 0, TT, PW, gh); ctx.restore();
      g2.width = g2.height = 0;
    }
  }

  function size(force){
    var w = document.documentElement.clientWidth;
    var last = document.getElementById('foot') || document.getElementById('close') || works;
    var wr = last.getBoundingClientRect();
    var h = Math.ceil(wr.bottom + (window.pageYOffset || 0));
    /* Anchor the light to where the hero content actually ends, not to the stage box.
       The hero is centred inside a full-screen stage, so its own box is the whole
       screen; the burst has to follow the content, not the container. */
    var sh;
    if (lastEl){
      var pb = parseFloat(getComputedStyle(heroEl).paddingBottom) || 0;
      sh = lastEl.offsetTop + lastEl.offsetHeight + pb;
    } else {
      sh = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : stage.offsetHeight;
    }
    var wt = works.offsetTop, wh = works.offsetHeight;
    var tt = stackEl ? stackEl.offsetTop + stackEl.offsetHeight : 0;
    var vh = window.innerHeight;
    if (!w || !h || !sh || !wh) return false;
    if (!force && w === PW && h === PH && sh === SH && wt === WT && wh === WH && tt === TT && vh === VH) return true;
    PW = w; PH = h; SH = sh; WT = wt; WH = wh; TT = tt; VH = vh;
    if (!PW || !PH) return false;
    BD = Math.min(DPR, PW*PH > 2200000 ? 1 : 1.5);
    cv.width = Math.round(PW*BD); cv.height = Math.round(PH*BD);
    cv.style.height = PH + 'px';
    build(); return true;
  }

  window.TRUFFL_BG = size;
  (function init(){ if (!size()) requestAnimationFrame(init); })();
  window.addEventListener('resize', size);
  window.addEventListener('load', function(){ size(); requestAnimationFrame(size); });
  if (window.ResizeObserver) new ResizeObserver(size).observe(document.body);
})();

/* ============================ HERO PULSE OVERLAY ============================ */
(function(){
  var cv = document.getElementById('burst'), ctx = cv.getContext('2d');
  var stage = document.getElementById('stage'), LINE = document.getElementById('line');
  var W = 0, H = 0;

  function size(){
    W = stage.clientWidth; H = stage.clientHeight;
    if (!W || !H) return false;
    cv.width = W*DPR; cv.height = H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    return true;
  }

  /* transparent overlay, the page field shows through; this only adds the cobalt
     swell while an interaction plays */
  function draw(pulse){
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    if (pulse > 0){
      var ox = W*0.54, oy = H*1.04, D = Math.sqrt(W*W + H*H);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var g = ctx.createRadialGradient(ox,oy,0,ox,oy,D*(0.30 + pulse*0.34));
      g.addColorStop(0,'rgba(49,92,255,'+(0.28*pulse).toFixed(3)+')');
      g.addColorStop(1,'rgba(49,92,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H); ctx.restore();
    }
  }

  (function init(){ if (size()) draw(0); else requestAnimationFrame(init); })();
  window.addEventListener('resize', function(){ if (size()) draw(0); });
  if (window.ResizeObserver) new ResizeObserver(function(){ if (size()) draw(0); }).observe(stage);

  /* ---- interaction card ---- */
  var SC = [
    { line:'Hi, I need to reach a customer about their pending order.',
      reply:'Calling now. I will confirm the delivery window, log the outcome and hand over if they ask for a person.' },
    { line:'A customer left a ₹3,499 co-ord set in their cart yesterday.',
      reply:'I will ask what stopped them, check delivery to their postcode and send an approved checkout link if they agree.' },
    { line:'I bought this jacket online. It is too small. Can I exchange it at the Indiranagar store tomorrow?',
      reply:'Yes. Your order is eligible and a medium is available at Indiranagar. Shall I hold it until 7 PM tomorrow?' }
  ];
  var cur = 2, playing = false;

  function run(){
    playing = true;
    var t0 = performance.now();
    LINE.textContent = SC[cur].line;
    (function step(ts){
      var p = Math.min(1, (ts - t0) / 3400);
      draw(Math.sin(p * Math.PI));
      if (p >= 0.62 && LINE.textContent === SC[cur].line) LINE.textContent = SC[cur].reply;
      if (p < 1 && playing) requestAnimationFrame(step); else { playing = false; draw(0); }
    })(performance.now());
  }

  document.getElementById('play').addEventListener('click', function(){
    if (RM) LINE.textContent = SC[cur].reply; else run();
  });

  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function(b){
    b.addEventListener('click', function(){
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function(o){
        o.setAttribute('aria-pressed','false');
      });
      b.setAttribute('aria-pressed','true');
      cur = +b.dataset.i;
      if (RM) LINE.textContent = SC[cur].reply; else run();
    });
  });
})();

/* ====================== HOW TRUFFL WORKS ====================== */
(function(){
  var sec = document.getElementById('works');
  if (!sec) return;
  var V = [0,1,2,3].map(function(i){ return document.getElementById('v'+i); });
  var VC = V.map(function(c){ return c.getContext('2d'); });
  var W = [0,0,0,0], H = [0,0,0,0];

  /* Each panel diagram is drawn in a logical design space and scaled as a whole, so its
     labels grow with the panel instead of staying pinned at 7-8px on a wide screen.
     REF is the width the diagrams were drawn at; below it nothing changes. */
  var VREF = 470, LW = [], LH = [];
  function sizeVZ(){
    V.forEach(function(c,i){
      W[i] = c.clientWidth; H[i] = c.clientHeight;
      var S = Math.min(1.6, Math.max(1, W[i]/VREF));
      LW[i] = W[i]/S; LH[i] = H[i]/S;
      c.width = W[i]*DPR; c.height = H[i]*DPR;
      VC[i].setTransform(DPR*S,0,0,DPR*S,0,0);
    });
  }

  function lbl(c,x,y,t,a,sz){
    c.font = (sz||8)+'px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba('+PAPER+','+a+')'; c.fillText(t,x,y);
  }

  /* extruded slab, dark offset body, face on top, lit upper edge */
  function slab(c,x,y,w,h,txt,inv,act,dep){
    dep = dep || 3;
    c.fillStyle = 'rgba(0,0,0,.9)'; c.fillRect(x+dep, y+dep, w, h);
    if (inv){
      c.fillStyle = 'rgba('+PAPER+',1)'; c.fillRect(x,y,w,h);
      c.fillStyle = '#151515'; c.font = 'bold 8px Arial';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(txt, x+w/2, y+h/2+.5);
    } else {
      c.fillStyle = 'rgba(0,0,0,.8)'; c.fillRect(x,y,w,h);
      c.strokeStyle = act ? COB : HAIR; c.lineWidth = 1;
      c.strokeRect(x+.5, y+.5, w-1, h-1);
      c.strokeStyle = 'rgba('+PAPER+',.22)';
      c.beginPath(); c.moveTo(x+1,y+.5); c.lineTo(x+w-1,y+.5); c.stroke();
      lbl(c, x+w/2, y+h/2, txt, .9);
    }
  }

  function person(c,x,y,s,col){
    c.fillStyle = col;
    c.beginPath(); c.arc(x, y - s*0.52, s*0.33, 0, 6.3); c.fill();
    c.beginPath(); c.moveTo(x - s*0.60, y + s*0.60);
    c.bezierCurveTo(x - s*0.58, y - s*0.16, x + s*0.58, y - s*0.16, x + s*0.60, y + s*0.60);
    c.closePath(); c.fill();
  }

  /* --- BUILD: modules docking onto the agent --- */
  function d0(c,i,act,p){
    var w = LW[i], h = LH[i], cx = w/2, cy = h/2 + 6;
    var R = Math.min(w*0.32, h*0.36), RY = R*0.46;
    c.clearRect(0,0,w,h);
    c.strokeStyle = 'rgba(216,214,204,.14)'; c.lineWidth = 1; c.setLineDash([3,4]);
    c.beginPath(); c.ellipse(cx,cy,R,RY,0,0,6.3); c.stroke();
    c.beginPath(); c.ellipse(cx,cy,R*0.62,RY*0.62,0,0,6.3); c.stroke();
    c.setLineDash([]);
    var mods = [['Workflows',-Math.PI/2],['Tools',0],['Policies',Math.PI/2],['Voices',Math.PI]];
    mods.forEach(function(m,k){
      var t = act ? Math.max(0, Math.min(1,(p - k*0.16)/0.34)) : 1;
      var e = t < 1 ? 1 - Math.pow(1-t,3) : 1;
      var f = 1 + (1-e)*0.8, a = m[1];
      var mx = cx + Math.cos(a)*R*f, my = cy + Math.sin(a)*RY*f - (1-e)*24;
      c.globalAlpha = 0.28 + e*0.72;
      c.strokeStyle = (e >= 1 && act) ? 'rgba(49,92,255,.75)' : HAIR; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(mx,my); c.stroke();
      slab(c, mx-31, my-10, 62, 20, m[0], false, false);
      c.globalAlpha = 1;
    });
    c.fillStyle = 'rgba(0,0,0,.9)'; c.beginPath(); c.ellipse(cx,cy+8,25,10.5,0,0,6.3); c.fill();
    c.fillStyle = 'rgba(49,92,255,.24)'; c.beginPath(); c.ellipse(cx,cy,25,10.5,0,0,6.3); c.fill();
    c.strokeStyle = COB; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(cx,cy,25,10.5,0,0,6.3); c.stroke();
    lbl(c,cx,cy,'Agent',1,9);
  }

  /* --- TEST: a person running simulated paths --- */
  function d1(c,i,act,p){
    var w = LW[i], h = LH[i], px = 44, py = h/2;
    c.clearRect(0,0,w,h);
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(px,py+30,20,5,0,0,6.3); c.fill();
    c.fillStyle = 'rgba(0,0,0,.86)'; c.beginPath(); c.arc(px,py,22,0,6.3); c.fill();
    c.strokeStyle = act ? COB : HAIR; c.lineWidth = 1.2;
    c.beginPath(); c.arc(px,py,22,0,6.3); c.stroke();
    person(c, px, py+2, 26, 'rgba('+PAPER+',.9)');
    lbl(c, px, py+36, 'Tester', .6, 7.5);

    var ex = w - 58, fail = 2, pad = h*0.16, gap = (h - pad*2)/3;
    for (var k=0; k<4; k++){
      var g = act ? Math.max(0, Math.min(1,(p - k*0.13)/0.42)) : 1;
      if (g <= 0) continue;
      var ey = pad + k*gap;
      c.strokeStyle = k === fail ? 'rgba('+PAPER+',.5)' : 'rgba(49,92,255,.5)';
      c.lineWidth = 1.3; c.beginPath(); c.moveTo(px+24, py);
      var c1x = px + 84, c2x = ex - 46;
      for (var s=1; s<=26; s++){
        var t = (s/26)*g, mt = 1 - t;
        c.lineTo(
          mt*mt*mt*(px+24) + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*ex,
          mt*mt*mt*py + 3*mt*mt*t*py + 3*mt*t*t*ey + t*t*t*ey
        );
      }
      c.stroke();
      if (g >= 1) slab(c, ex+4, ey-10, 46, 20, k === fail ? '✕ fail' : '✓ pass', k === fail, false);
    }
  }

  /* --- RUN: context converging into one verified action --- */
  function d2(c,i,act,p){
    var w = LW[i], h = LH[i], cx = w*0.46, cy = h/2 - 2, R = Math.min(h*0.30, 44);
    c.clearRect(0,0,w,h);
    c.fillStyle = 'rgba(0,0,0,.55)';
    c.beginPath(); c.ellipse(cx, cy+R+11, R*0.82, R*0.16, 0, 0, 6.3); c.fill();
    c.strokeStyle = 'rgba(216,214,204,.3)'; c.lineWidth = 1;
    c.beginPath(); c.arc(cx,cy,R,0,6.3); c.stroke();
    for (var k=1; k<=3; k++){
      var rx = R*Math.cos(k*Math.PI/4);
      c.beginPath(); c.ellipse(cx,cy,Math.abs(rx),R,0,0,6.3); c.stroke();
    }
    for (var k2=-2; k2<=2; k2++){
      var yy = cy + k2*R*0.36, rr = R*Math.cos(Math.asin((yy-cy)/R));
      c.beginPath(); c.ellipse(cx,yy,rr,rr*0.22,0,0,6.3); c.stroke();
    }
    var src = [['History',-2.5],['Rules',-1.2],['Permissions',1.2],['Live data',2.5]];
    src.forEach(function(s,k){
      var a = s[1]*0.42 + Math.PI, d = R + 32;
      var sx = cx + Math.cos(a)*d, sy = cy + Math.sin(a)*d;
      slab(c, sx-31, sy-9, 62, 18, s[0], false, false);
      if (act){
        var q = (p - 0.12 - k*0.05)/0.4;
        if (q > 0 && q < 1){
          var t = q*q*(3 - 2*q);
          c.fillStyle = COB; c.beginPath();
          c.arc(sx + (cx-sx)*t, sy + (cy-sy)*t, 2.8, 0, 6.3); c.fill();
        }
      }
    });
    var lit = !act || p > 0.66, ax = w - 52;
    c.strokeStyle = lit ? COB : 'rgba(216,214,204,.2)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(cx+R, cy); c.lineTo(ax-3, cy); c.stroke();
    slab(c, ax, cy-10, 48, 20, '✓ action', false, lit);
    if (act && p > 0.58 && p < 0.76){
      var t2 = (p - 0.58)/0.18;
      c.fillStyle = COB; c.beginPath();
      c.arc(cx + R + (ax-3-cx-R)*t2, cy, 3.2, 0, 6.3); c.fill();
    }
  }

  /* --- LEARN: evaluated turns produce a new agent version --- */
  function d3(c,i,act,p){
    var w = LW[i], h = LH[i];
    c.clearRect(0,0,w,h);
    var rows = [['Customer turn',0,0],['Agent turn',1,0],['Customer turn',0,1],['Agent turn',1,0]];
    var tw = w*0.40, x0 = 16, pad = h*0.13, gap = (h - pad*2 - 18)/3;
    rows.forEach(function(r,k){
      var y = pad + k*gap, show = !act || p > (k+1)*0.13;
      var x = x0 + (r[1] ? 18 : 0);
      c.globalAlpha = show ? 1 : .18;
      c.fillStyle = 'rgba(0,0,0,.9)'; c.fillRect(x+3, y+3, tw, 18);
      c.fillStyle = 'rgba(0,0,0,.8)'; c.fillRect(x, y, tw, 18);
      c.strokeStyle = r[1] ? 'rgba(49,92,255,.5)' : HAIR; c.lineWidth = 1;
      c.strokeRect(x+.5, y+.5, tw-1, 17);
      c.font = '7.5px Arial'; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillStyle = 'rgba('+PAPER+',.8)'; c.fillText(r[0], x+7, y+9.5);
      if (r[2] === 1){
        c.fillStyle = 'rgba('+PAPER+',1)'; c.fillRect(x+tw-19, y+3, 15, 12);
        c.fillStyle = '#151515'; c.font = 'bold 7px Arial'; c.textAlign = 'center';
        c.fillText('✕', x+tw-11.5, y+9.5);
      } else {
        c.fillStyle = 'rgba('+PAPER+',.75)'; c.font = '8px Arial'; c.textAlign = 'center';
        c.fillText('✓', x+tw-11, y+9.5);
      }
      c.globalAlpha = 1;
    });
    var vx = w - 108, vy = h/2;
    var t = act ? Math.max(0, Math.min(1,(p - 0.55)/0.34)) : 1;
    c.strokeStyle = t > 0 ? COB : 'rgba(216,214,204,.2)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(x0+tw+16, vy);
    c.lineTo(x0+tw+16 + (vx-6-x0-tw-16)*Math.max(t,0.001), vy); c.stroke();
    if (t > 0.9){
      c.beginPath(); c.moveTo(vx-12, vy-4); c.lineTo(vx-4, vy); c.lineTo(vx-12, vy+4); c.stroke();
    }
    c.fillStyle = 'rgba(0,0,0,.9)'; c.fillRect(vx+3, vy-16, 96, 32);
    c.fillStyle = 'rgba(49,92,255,.16)'; c.fillRect(vx, vy-19, 96, 32);
    c.strokeStyle = COB; c.lineWidth = 1.2; c.strokeRect(vx+.5, vy-18.5, 95, 31);
    c.font = '7px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba('+PAPER+',.6)'; c.fillText('AGENT VERSION', vx+48, vy-10);
    c.font = '12px Arial'; c.fillStyle = 'rgba('+PAPER+',1)';
    c.fillText(t > 0.92 ? 'v14  →  v15' : 'v14', vx+48, vy+4);
  }

  var DR = [d0,d1,d2,d3];
  var bx = [0,1,2,3].map(function(i){ return document.getElementById('b'+i); });
  var STEP = 2300, t0 = null;

  function frame(ts){
    if (!t0) t0 = ts;
    var el = (ts - t0) % (STEP*4);
    var i = Math.floor(el/STEP), p = (el % STEP)/STEP;
    bx.forEach(function(b,n){ b.classList.toggle('on', n === i); });
    for (var n=0; n<4; n++) DR[n](VC[n], n, n === i, p);
    requestAnimationFrame(frame);
  }

  (function init(){
    sizeVZ();
    if (!W[0]){ requestAnimationFrame(init); return; }
    if (RM){
      bx.forEach(function(b){ b.classList.add('on'); });
      for (var n=0; n<4; n++) DR[n](VC[n], n, false, 1);
    } else {
      requestAnimationFrame(frame);
    }
  })();

  function reflow(){ sizeVZ(); if (window.TRUFFL_BG) window.TRUFFL_BG(); }
  window.addEventListener('resize', reflow);
  if (window.ResizeObserver) new ResizeObserver(reflow).observe(sec);
})();

/* ===================== DEVELOPER SCROLL NAVIGATION ===================== */
(function(){
  var section = document.getElementById('k2c');
  if (!section) return;
  var nav = section.querySelector('.dev-nav');
  var panels = Array.prototype.slice.call(section.querySelectorAll('.dev-panel'));
  if (!nav || !panels.length) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame = null, current = -1;
  function sync(){
    frame = null;
    if (!section.getClientRects().length) return;
    var marker = Math.max(180,window.innerHeight * .32), active = 0;
    panels.forEach(function(panel,index){
      if (panel.getBoundingClientRect().top <= marker) active = index;
    });
    if (active === current) return;
    current = active;
    links.forEach(function(link,index){
      if (index === active) link.setAttribute('aria-current','step');
      else link.removeAttribute('aria-current');
      panels[index].classList.toggle('is-active',index === active);
    });
    // Keep the current item in view inside the small-screen navigation only.
    if (nav.scrollWidth > nav.clientWidth) {
      var item = links[active], itemRect = item.getBoundingClientRect(), navRect = nav.getBoundingClientRect();
      var delta = itemRect.left < navRect.left ? itemRect.left-navRect.left : itemRect.right > navRect.right ? itemRect.right-navRect.right : 0;
      if (delta) nav.scrollTo({left:nav.scrollLeft+delta,behavior:motion.matches?'auto':'smooth'});
    }
  }
  function schedule(){if (frame === null) frame = requestAnimationFrame(sync);}
  links.forEach(function(link,index){
    link.addEventListener('click',function(event){
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      panels[index].scrollIntoView({behavior:motion.matches?'auto':'smooth',block:'start'});
      if (event.detail === 0) panels[index].focus({preventScroll:true});
    });
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',function(){current=-1;schedule();});
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(section);
  sync();
})();

/* ---- extend the page's light field into the stack ----
   The join is not matched by eye. Layer A is the works composition continued into
   the card's own coordinates, so at the card's top edge it is the same function of
   the same geometry the works section ends on - identical by construction. Layer B
   is a new source below the frame, faded in over the first 45% of the card so the
   card still carries a gradient. Same technique as the scroll 1 -> 2 join. */
(function(){
  var stack = document.getElementById('stack'), works = document.getElementById('works');
  if (!stack || !works) return;
  var cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  var W = 0, H = 0, PW = 0, WT = 0, WH = 0, ST = 0;

  /* the works source, expressed in this card's coordinate space */
  function paintCarry(c){
    var ox = PW*0.50, oy = (WT - WH*0.10) - ST, D = Math.sqrt(PW*PW + WH*WH);
    c.fillStyle = '#000'; c.fillRect(0,0,W,H);
    c.save(); c.globalCompositeOperation = 'lighter';
    if ('filter' in c) c.filter = 'blur(52px)';
    beam(c,ox,oy,1.05,0.24,D*1.20,PAPER,0.34);
    beam(c,ox,oy,1.42,0.18,D*1.30,PAPER,0.42);
    beam(c,ox,oy,1.75,0.20,D*1.15,'216,214,204',0.22);
    beam(c,ox,oy,2.10,0.28,D*1.10,'49,92,255',0.36);
    beam(c,ox,oy,2.42,0.22,D*0.95,'24,56,168',0.34);
    var core = c.createRadialGradient(ox,oy,0,ox,oy,D*0.46);
    core.addColorStop(0,'rgba(244,241,232,0.70)');
    core.addColorStop(0.18,'rgba(244,241,232,0.24)');
    core.addColorStop(0.5,'rgba(232,237,255,0.07)');
    core.addColorStop(1,'rgba(244,241,232,0)');
    c.fillStyle = core; c.fillRect(0,0,W,H); c.restore();

    c.save();
    var vig = c.createRadialGradient(ox,oy,D*0.10,ox,oy,D*0.98);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.6,'rgba(0,0,0,0.32)');
    vig.addColorStop(1,'rgba(0,0,0,0.88)');
    c.fillStyle = vig; c.fillRect(0,0,W,H); c.restore();
  }

  /* a fresh source below the frame, so the card is lit rather than in falloff */
  function paintNear(c){
    var ox = W*0.52, oy = H*1.22, D = Math.sqrt(W*W + H*H);
    c.fillStyle = '#000'; c.fillRect(0,0,W,H);
    c.save(); c.globalCompositeOperation = 'lighter';
    if ('filter' in c) c.filter = 'blur(52px)';
    beam(c,ox,oy,-2.30,0.30,D*1.35,'49,92,255',0.26);
    beam(c,ox,oy,-2.62,0.24,D*1.20,'24,56,168',0.24);
    beam(c,ox,oy,-1.96,0.14,D*1.30,'216,214,204',0.13);
    beam(c,ox,oy,-1.40,0.20,D*1.50,PAPER,0.26);
    beam(c,ox,oy,-1.02,0.24,D*1.40,PAPER,0.22);
    var core = c.createRadialGradient(ox,oy,0,ox,oy,D*1.05);
    core.addColorStop(0,'rgba(244,241,232,0.34)');
    core.addColorStop(0.30,'rgba(244,241,232,0.12)');
    core.addColorStop(0.60,'rgba(232,237,255,0.05)');
    core.addColorStop(0.86,'rgba(244,241,232,0.016)');
    core.addColorStop(1,'rgba(244,241,232,0)');
    c.fillStyle = core; c.fillRect(0,0,W,H); c.restore();

    c.save();
    var vig = c.createRadialGradient(ox,oy,D*0.26,ox,oy,D*1.34);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.70,'rgba(0,0,0,0.10)');
    vig.addColorStop(1,'rgba(0,0,0,0.34)');
    c.fillStyle = vig; c.fillRect(0,0,W,H); c.restore();
  }

  function build(){
    cv.width = W; cv.height = H;
    ctx.setTransform(1,0,0,1,0,0);
    paintCarry(ctx);

    var lay = document.createElement('canvas');
    lay.width = W; lay.height = H;
    var lc = lay.getContext('2d');
    paintNear(lc);
    lc.save(); lc.globalCompositeOperation = 'destination-in';
    var m = lc.createLinearGradient(0, 0, 0, H*0.45);
    m.addColorStop(0,'rgba(0,0,0,0)'); m.addColorStop(1,'rgba(0,0,0,1)');
    lc.fillStyle = m; lc.fillRect(0,0,W,H); lc.restore();
    ctx.drawImage(lay, 0, 0);
    lay.width = lay.height = 0;

    if (!GRAIN) GRAIN = makeGrain();
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = ctx.createPattern(GRAIN,'repeat');
    ctx.fillRect(0,0,W,H); ctx.restore();

    try {
      stack.style.setProperty('--stack-bg', 'url("' + cv.toDataURL('image/jpeg', 0.84) + '")');
    } catch(e){ /* leave the CSS fallback in place */ }
    /* hand the exact pixels to the page background so the join below the stack
       continues this field rather than an approximation of it */
    window.TRUFFL_STACK_FIELD = cv;
    if (window.TRUFFL_BG) window.TRUFFL_BG(true);
  }

  function size(){
    var w = document.documentElement.clientWidth, h = window.innerHeight;
    var wt = works.offsetTop, wh = works.offsetHeight, st = stack.offsetTop;
    if (!w || !h || !wh) return false;
    if (w === W && h === H && wt === WT && wh === WH && st === ST) return true;
    W = w; H = h; PW = w; WT = wt; WH = wh; ST = st;
    build(); return true;
  }
  (function init(){ if (!size()) requestAnimationFrame(init); })();
  window.addEventListener('resize', size);
  window.addEventListener('load', size);
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) size(); });
})();

/* ===================== FAQ ===================== */
(function(){
  var list = document.querySelector('#faq .faq-list');
  if (!list) return;
  var items = [].slice.call(list.querySelectorAll('li'));
  items.forEach(function(li){
    var btn = li.querySelector('button');
    btn.addEventListener('click', function(){
      var open = li.classList.contains('open');
      /* one open at a time, so the list never runs away down the page */
      items.forEach(function(o){
        o.classList.remove('open');
        o.querySelector('button').setAttribute('aria-expanded','false');
        o.querySelector('.faq-a').setAttribute('aria-hidden','true');
      });
      if (!open){ li.classList.add('open'); btn.setAttribute('aria-expanded','true'); li.querySelector('.faq-a').setAttribute('aria-hidden','false'); }
    });
  });
})();

/* ===================== CLOSING PANEL =====================
   Two light forms reaching in from either side and stopping just short of touching:
   human intent on the left in Paper, execution on the right in Cobalt. The gap is
   the point - it is the interaction layer the headline is about. */
(function(){
  var cv = document.getElementById('closebg');
  if (!cv) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0;

  function build(){
    var BD = Math.min(DPR, 1.5);
    cv.width = Math.round(W*BD); cv.height = Math.round(H*BD);
    ctx.setTransform(BD,0,0,BD,0,0);
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
    var cy = H*0.52, gap = Math.min(W*0.05, 62), D = Math.sqrt(W*W + H*H);

    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if ('filter' in ctx) ctx.filter = 'blur(46px)';

    var lx = -W*0.10, rx = W*1.10;
    beam(ctx,lx,cy,0.09,0.13,W*0.62,PAPER,0.46);
    beam(ctx,lx,cy,-0.13,0.09,W*0.56,PAPER,0.34);
    beam(ctx,lx,cy,0.28,0.08,W*0.50,'216,214,204',0.22);
    beam(ctx,rx,cy,3.15,0.13,W*0.62,'49,92,255',0.50);
    beam(ctx,rx,cy,3.29,0.09,W*0.56,'24,56,168',0.38);
    beam(ctx,rx,cy,3.00,0.08,W*0.50,'49,92,255',0.26);

    var a = ctx.createRadialGradient(W*0.5 - gap, cy, 0, W*0.5 - gap, cy, W*0.24);
    a.addColorStop(0,'rgba(244,241,232,0.46)');
    a.addColorStop(0.26,'rgba(244,241,232,0.14)');
    a.addColorStop(1,'rgba(244,241,232,0)');
    ctx.fillStyle = a; ctx.fillRect(0,0,W,H);
    var b = ctx.createRadialGradient(W*0.5 + gap, cy, 0, W*0.5 + gap, cy, W*0.24);
    b.addColorStop(0,'rgba(49,92,255,0.44)');
    b.addColorStop(0.26,'rgba(24,56,168,0.15)');
    b.addColorStop(1,'rgba(49,92,255,0)');
    ctx.fillStyle = b; ctx.fillRect(0,0,W,H);
    ctx.restore();

    ctx.save();
    var vig = ctx.createRadialGradient(W*0.5, cy, D*0.10, W*0.5, cy, D*0.80);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.58,'rgba(0,0,0,0.26)');
    vig.addColorStop(1,'rgba(0,0,0,0.86)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);
    var top = ctx.createLinearGradient(0,0,0,H*0.34);
    top.addColorStop(0,'rgba(0,0,0,0.72)'); top.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = top; ctx.fillRect(0,0,W,H*0.34);
    /* the footer below is flat Jet Black, so land on it rather than cutting to it */
    var bot = ctx.createLinearGradient(0,H,0,H*0.62);
    bot.addColorStop(0,'rgba(0,0,0,1)'); bot.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = bot; ctx.fillRect(0,H*0.62,W,H*0.38);
    ctx.restore();

    if (!GRAIN) GRAIN = makeGrain();
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = ctx.createPattern(GRAIN,'repeat');
    ctx.fillRect(0,0,W,H); ctx.restore();
  }

  function size(){
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return false;
    if (w === W && h === H) return true;
    W = w; H = h; build(); return true;
  }
  (function init(){ if (!size()) requestAnimationFrame(init); })();
  window.addEventListener('resize', size);
  window.addEventListener('load', size);
  if (window.ResizeObserver) new ResizeObserver(size).observe(cv.parentNode);
})();

})();