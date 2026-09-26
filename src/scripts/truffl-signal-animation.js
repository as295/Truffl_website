
(function(){
 'use strict';
 const home=document.getElementById('v-home'),stage=document.getElementById('stage'),canvas=document.getElementById('signal-field');
 if(!home||!stage||!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const toggle=stage.querySelector('.motion-toggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // A quiet perspective corridor, drawn entirely in the logo's Truffl blue.
 const logo=stage.querySelector('.mark svg g[fill="#3b66d6"]');
 const logoBlue=logo?getComputedStyle(logo).fill:getComputedStyle(home).getPropertyValue('--signal').trim();
 // The pricing page's architecture illustration is no longer projected onto the corridor walls.
 const architecture=null,textures=[];
 function prepareTextures(){
  if(!architecture||!architecture.naturalWidth)return;
  const crops=[[0,0,1536,1024],[110,180,830,830],[800,0,720,720]];
  crops.forEach(([x,y,w,h])=>{
   const tile=document.createElement('canvas');tile.width=384;tile.height=384;
   const brush=tile.getContext('2d');brush.fillStyle=logoBlue;brush.fillRect(0,0,384,384);
   const scale=Math.min(354/w,354/h),dw=w*scale,dh=h*scale;
   brush.drawImage(architecture,x,y,w,h,(384-dw)/2,(384-dh)/2,dw,dh);textures.push(tile);
  });
  if(width)paint();
 }
 function textureTriangle(texture,a,b,c,pa,pb,pc){
  const ax=a[0]*384,ay=a[1]*384,bx=b[0]*384,by=b[1]*384,cx=c[0]*384,cy=c[1]*384;
  const d=ax*(by-cy)+bx*(cy-ay)+cx*(ay-by);
  const matrix=(p,q,r)=>[(p*(by-cy)+q*(cy-ay)+r*(ay-by))/d,(p*(cx-bx)+q*(ax-cx)+r*(bx-ax))/d,(p*(bx*cy-cx*by)+q*(cx*ay-ax*cy)+r*(ax*by-bx*ay))/d];
  const x=matrix(pa.x,pb.x,pc.x),y=matrix(pa.y,pb.y,pc.y);
  ctx.save();polygon([pa,pb,pc]);ctx.clip();ctx.transform(x[0],y[0],x[1],y[1],x[2],y[2]);ctx.drawImage(texture,0,0);ctx.restore();
 }
 let width=0,height=0,heroHeight=0,frame=0,last=0,time=0,inView=true,paused=false;
 let pointerX=0,pointerY=0,driftX=0,driftY=0,quietAreas=[];
 function polygon(points){
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
 }
 function paint(){
  ctx.clearRect(0,0,width,height);
  if(!width||!height)return;
  const mobile=width<621;
  const cx=width*.5+(mobile?0:driftX*10),cy=heroHeight*.43+(mobile?0:driftY*7);
  const project=(x,y,z)=>({x:cx+x*width*.66/z,y:cy+y*heroHeight*.79/z});
  const stroke=(a,b,opacity)=>{
   ctx.globalAlpha=opacity;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  };
  ctx.strokeStyle=logoBlue;ctx.fillStyle=logoBlue;ctx.lineWidth=mobile?.65:.8;
  // The floor, ceiling and side walls converge on the same quiet vanishing point.
  for(let i=0;i<=6;i++){
   const u=-1.18+i*2.36/6;
   stroke(project(u,-.88,.65),project(u,-.88,5.8),.16);
   stroke(project(u,.88,.65),project(u,.88,5.8),.16);
  }
  for(let i=1;i<5;i++){
   const v=-.88+i*1.76/5;
   stroke(project(-1.18,v,.65),project(-1.18,v,5.8),.16);
   stroke(project(1.18,v,.65),project(1.18,v,5.8),.16);
  }
  const flow=(time*.025)%1;
  for(let i=0;i<9;i++){
   const z=.77*Math.pow(1.42,i-flow);
   const corners=[project(-1.18,-.88,z),project(1.18,-.88,z),project(1.18,.88,z),project(-1.18,.88,z)];
   ctx.globalAlpha=.22*Math.max(0,1-z/7);polygon(corners);ctx.stroke();
  }
  // The pricing page's blue-and-white architecture inhabits the corridor's planes.
  const panels=[
   ['left',-.54,-.13,1.42,2.0,0],['left',.25,.61,1.13,1.62,1],
   ['right',-.63,-.23,1.27,1.83,2],['right',.16,.59,1.26,1.84,0],
   ['top',-.72,-.23,1.34,1.94,1],['top',.34,.88,1.16,1.65,2],
   ['bottom',-.69,-.20,1.35,1.96,2],['bottom',.28,.73,1.17,1.64,1]
  ];
  const drawPanel=([wall,start,end,near,far,motif],index,strength=1)=>{
   const breathe=1+.035*Math.sin(time*(strength<1?.095:.19)+index*.9);
   const point=(u,v)=>{
    const across=start+(end-start)*u,z=(near+(far-near)*v)*breathe;
    return wall==='left'?project(-1.18,across,z):wall==='right'?project(1.18,across,z):wall==='top'?project(across,-.88,z):project(across,.88,z);
   };
   const q=[point(0,0),point(1,0),point(1,1),point(0,1)];
   ctx.save();polygon(q);ctx.clip();
   ctx.globalAlpha=.05*strength;ctx.fillStyle=logoBlue;ctx.fill();
   if(textures.length){
    const map=(u,v)=>wall==='left'?point(v,1-u):wall==='right'?point(v,u):wall==='bottom'?point(u,1-v):point(u,v);
    const steps=mobile||strength<1?2:4,texture=textures[motif];
    ctx.globalAlpha=(mobile?.72:.9)*strength;
    for(let row=0;row<steps;row++)for(let col=0;col<steps;col++){
     const a=[col/steps,row/steps],b=[(col+1)/steps,row/steps],c=[(col+1)/steps,(row+1)/steps],d=[col/steps,(row+1)/steps];
     textureTriangle(texture,a,b,c,map(...a),map(...b),map(...c));
     textureTriangle(texture,a,c,d,map(...a),map(...c),map(...d));
    }
    ctx.restore();ctx.strokeStyle='#dbe6ff';ctx.globalAlpha=.38*strength;ctx.lineWidth=.8;polygon(q);ctx.stroke();return;
   }
   ctx.strokeStyle=logoBlue;ctx.lineWidth=mobile?.8:1.1;
   if(motif===0){
    for(let j=0;j<25;j++){
     const u=.13+j*.74/24,amplitude=.05+.21*Math.pow(Math.sin(j*.69+index),2);
     stroke(point(u,.5-amplitude),point(u,.5+amplitude),.38);
    }
   }else if(motif===1){
    for(let ring=0;ring<4;ring++){
     ctx.beginPath();
     for(let j=0;j<=64;j++){
      const angle=j*Math.PI/32,r=.13+ring*.065;
      const p=point(.5+Math.cos(angle)*r,.5+Math.sin(angle)*r);
      j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);
     }
     ctx.globalAlpha=.13+ring*.045;ctx.stroke();
    }
   }else{
    const nodes=[[.22,.28],[.67,.20],[.49,.51],[.25,.78],[.77,.72]];
    [[0,1],[0,2],[1,2],[2,3],[2,4],[3,4]].forEach(([a,b])=>stroke(point(...nodes[a]),point(...nodes[b]),.24));
    nodes.forEach(([u,v])=>{const p=point(u,v);ctx.globalAlpha=.65;ctx.fillStyle=logoBlue;ctx.beginPath();ctx.arc(p.x,p.y,mobile?1.5:2.4,0,Math.PI*2);ctx.fill();});
   }
   ctx.restore();ctx.strokeStyle=logoBlue;ctx.lineWidth=.75;ctx.globalAlpha=.2;polygon(q);ctx.stroke();
  };
  panels.forEach((panel,index)=>drawPanel(panel,index));
  // Keep a calm, solid-blue centre behind the white copy.
  ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1;
  ctx.translate(width*.5,heroHeight*.47);ctx.scale(width*(mobile?.62:.45),heroHeight*.51);
  const clear=ctx.createRadialGradient(0,0,.20,0,0,1);
  clear.addColorStop(0,'#000');clear.addColorStop(.58,'#000');clear.addColorStop(.84,'#000000b3');clear.addColorStop(1,'#00000000');
  ctx.fillStyle=clear;ctx.fillRect(-2,-2,4,4);ctx.restore();ctx.globalAlpha=1;
  // A second, quieter room sits inward from the existing edge portals.
  // Exclude the actual text and controls, without altering their layout or styling.
  ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);
  quietAreas.forEach(r=>ctx.rect(r.x,r.y,r.width,r.height));ctx.clip('evenodd');
  ctx.strokeStyle=logoBlue;ctx.lineWidth=.65;
  [2.23,2.85].forEach((depth,index)=>{
   const z=depth*(1+.018*Math.sin(time*.09+index));
   polygon([project(-1.18,-.88,z),project(1.18,-.88,z),project(1.18,.88,z),project(-1.18,.88,z)]);
   ctx.globalAlpha=mobile?.06:.105-index*.02;ctx.stroke();
  });
  if(textures.length){
   const innerPanels=[
    ['left',-.53,-.16,2.24,2.82,1],['right',-.49,-.12,2.3,2.92,2],
    ['top',-.42,.02,2.37,2.96,0],['bottom',.46,.91,2.12,2.65,1]
   ];
   innerPanels.forEach((panel,index)=>{
    if(mobile&&panel[0]!=='top')return;
    drawPanel(panel,index+11,mobile?.13:.21);
   });
  }
  ctx.restore();ctx.globalAlpha=1;
  // A light, ambient wash of the logo blue sits under everything instead of a solid block.
  ctx.save();ctx.globalCompositeOperation='destination-over';
  const wash=ctx.createLinearGradient(0,0,width*.4,height);
  wash.addColorStop(0,'#f3f6ff');wash.addColorStop(.55,'#dfe8ff');wash.addColorStop(1,'#c9d9ff');
  ctx.fillStyle=wash;ctx.fillRect(0,0,width,height);ctx.restore();
 }
 function allowed(){return width>0&&inView&&!document.hidden&&!reduced.matches&&!paused;}
 function tick(now){
  frame=0;if(!allowed()){last=0;return;}
  if(!last)last=now;
  if(now-last>=30){time+=Math.min(now-last,80)/1000;driftX+=(pointerX-driftX)*.045;driftY+=(pointerY-driftY)*.045;last=now;paint();}
  frame=requestAnimationFrame(tick);
 }
 function sync(){
  const stopped=paused||reduced.matches;
  toggle.setAttribute('aria-pressed',String(stopped));
  toggle.setAttribute('aria-label',stopped?'Play background animation':'Pause background animation');
  if(allowed()&&!frame){last=0;frame=requestAnimationFrame(tick);}
  else if(!allowed()&&frame){cancelAnimationFrame(frame);frame=0;last=0;}
  if(reduced.matches){time=0;driftX=0;driftY=0;paint();}
 }
 function resize(){
  width=home.clientWidth;heroHeight=stage.offsetHeight;
  if(!width||!heroHeight){sync();return;}
  // End before the developer controls, with a short tail beside the introductory heading.
  const layout=home.querySelector('#k2c .dev-layout');
  const layoutTop=layout?layout.getBoundingClientRect().top-home.getBoundingClientRect().top:heroHeight+180;
  height=Math.round(Math.min(heroHeight+160,layoutTop-48));
  canvas.style.setProperty('--field-height',height+'px');
  canvas.style.setProperty('--field-fade-start',Math.max(150,heroHeight-240)+'px');
  canvas.style.setProperty('--field-clear-end',(heroHeight+24)+'px');
  const origin=home.getBoundingClientRect();
  quietAreas=Array.from(stage.querySelectorAll('.site-head,.hero h1,.thesis,.ctas,#herocard')).map(element=>{
   const r=element.getBoundingClientRect(),padding=12;
   return {x:r.left-origin.left-padding,y:r.top-origin.top-padding,width:r.width+padding*2,height:r.height+padding*2};
  });
  const ratio=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);paint();sync();
 }
 toggle.addEventListener('click',()=>{paused=!paused;sync();});
 stage.addEventListener('pointermove',event=>{const rect=stage.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;},{passive:true});
 stage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
 reduced.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('resize',resize,{passive:true});
 const sizeObserver=new ResizeObserver(resize);
 sizeObserver.observe(stage);
 const intro=home.querySelector('#k2c>.dev-inner');if(intro)sizeObserver.observe(intro);
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();}).observe(canvas);
 if(architecture){if(architecture.complete)prepareTextures();else architecture.addEventListener('load',prepareTextures,{once:true});}
 resize();sync();
})();

