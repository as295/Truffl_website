
(()=>{
 const factories={primitives:(()=>{// Truffl adaptation of the supplied Actable reference: data, orbiting hub, agent screen.
// A deterministic 12-second loop, rendered as an embedded MP4 in the HTML export.
const BLUE = '#3b66d6';
const INK = '#153471';
const BG = '#F8F9FF';
const MINT = '#A2E9B0', PEACH = '#FFC48D';
function frame(time = 0) {
  const phase = time / 12 * Math.PI * 2;
  const gear = Array.from({length: 64}, (_, i) => {
    const angle = i / 64 * Math.PI * 2;
    const r = i % 8 >= 2 && i % 8 <= 5 ? 67 : 57;
    return `${394 + Math.cos(angle)*r},${161 + Math.sin(angle)*r}`;
  }).join(' ');
  const icons = [
    '<path d="M-11-8H11V6H2L-6 12V6H-11Z"/><path d="M-5-2H5"/>',
    '<path d="M-10 9L1-2M2-11A8 8 0 0 0 11-2L5 4-4-5Z"/>',
    '<path d="M2-12L-8 2H0L-2 12 9-3H1Z"/>',
    '<path d="M-10 0L-3 7 11-8"/>'
  ];
  const orbit = icons.map((icon, i) => {
    const a = phase + i * Math.PI/2 - Math.PI/2;
    const x = 394 + Math.cos(a)*109, y = 161 + Math.sin(a)*109;
    return `<g transform="translate(${x} ${y})"><circle r="23" fill="${[BLUE,'url(#mint)', 'url(#peach)', '#E6EEFF'][i]}" stroke="${INK}" stroke-width="1.5"/><g stroke="${i===0 ? 'white' : INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">${icon}</g></g>`;
  }).join('');
  const p = (time / 6) % 1;
  // Follow the lower connector: down, around the corner, then across to the agent.
  const length = 65 + Math.PI*24/2 + 368;
  let distance = p*length, dotX=117, dotY=296;
  if(distance < 65) dotY += distance;
  else if((distance-=65) < Math.PI*24/2) {
    const a = Math.PI - distance/24;
    dotX=141+24*Math.cos(a); dotY=361+24*Math.sin(a);
  } else {dotX=141+distance-Math.PI*24/2;dotY=385;}
  const topX = 191 + ((time/3)%1)*90;
  const chart = [0,1,2,3,4].map((i)=>{
    const h=25+13*i+5*Math.sin(phase+i*.7);
    return `<rect x="${593+i*22}" y="${415-h}" width="13" height="${h}" rx="2" fill="${['#D4E1FF',MINT,'#D4E1FF',PEACH,BLUE][i]}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 800 500">
  <defs><linearGradient id="mint" x2=".6" y2="1"><stop stop-color="#DCFFE3"/><stop offset="1" stop-color="${MINT}"/></linearGradient><linearGradient id="peach" x2=".6" y2="1"><stop stop-color="#FFE4C6"/><stop offset="1" stop-color="${PEACH}"/></linearGradient><filter id="shadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#2448BD" flood-opacity=".1"/></filter></defs>
  <rect width="800" height="500" fill="${BG}"/>
  <g fill="none" stroke="#E6ECFC" stroke-width="1"><path d="M23 44H760M23 454H760M29 34V466M771 34V466"/><path d="M29 44L76 81M771 44L725 81M29 454L76 419M771 454L725 419"/></g>
  <g fill="none" stroke="#8AA5E5" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 8">
   <path d="M184 161H285"/>
   <circle cx="394" cy="161" r="109"/>
   <path d="M503 161H578Q621 161 621 205V309"/>
   <path d="M117 296V361Q117 385 141 385H509"/>
  </g>
  <circle cx="${topX}" cy="161" r="5" fill="${PEACH}" stroke="${INK}" stroke-width="1"/>
  <circle cx="${dotX}" cy="${dotY}" r="6" fill="${MINT}" stroke="${INK}" stroke-width="1"/>
  <g filter="url(#shadow)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round">
   <path d="M53 87L69 74H181L181 282 165 296H53Z" fill="#BDD0FF"/>
   <rect x="48" y="87" width="127" height="209" rx="10" fill="${BLUE}"/>
   <path d="M175 100L181 94M175 280L181 274" stroke="#7B9BFF"/>
   <g fill="white" stroke="none" font-family="Arial, sans-serif" font-size="25" text-anchor="middle">
    <text x="111" y="132">Turns</text><text x="111" y="185">Data</text><text x="111" y="238">Harness</text>
   </g>
   <g stroke="#8CA6FF"><path d="M67 150H156M67 203H156M67 256H156"/></g>
   <g stroke="none"><circle cx="88" cy="275" r="3.5" fill="${MINT}"/><circle cx="111" cy="275" r="3.5" fill="${PEACH}"/><circle cx="134" cy="275" r="3.5" fill="white"/></g>
  </g>
  <g filter="url(#shadow)"><polygon points="${gear}" fill="${BLUE}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="394" cy="161" r="43" fill="white" stroke="${INK}" stroke-width="1.5"/>
   <path d="M372 182V153A22 22 0 0 1 416 153V182H403V154A9 9 0 0 0 385 154V182Z" fill="${BLUE}"/>
   <path d="M385 182V154A9 9 0 0 1 403 154V182" fill="#D3E1FF"/>
   <path d="M386 177H402M386 171H402M386 165H402" stroke="white" stroke-width="2"/>
  </g>
  ${orbit}
  <text x="394" y="329" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${INK}">Sessions</text>
  <g filter="url(#shadow)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round">
   <path d="M520 310L531 299H740V435H520Z" fill="#B8CDFF"/>
   <rect x="510" y="310" width="230" height="127" rx="9" fill="#DFE9FF"/>
   <rect x="523" y="323" width="204" height="99" rx="3" fill="white" stroke="#B0C5F7"/>
   <path d="M497 437H753L744 450H507Z" fill="#C7D9FF"/>
   <path d="M597 437H653L649 442H601Z" fill="#88ABFF" stroke="none"/>
  </g>
  <g fill="none" stroke="#E8EDFA" stroke-width="1"><path d="M589 350H709M589 382H709M589 415H709"/></g>
  ${chart}
  <path d="M595 389L616 ${380+Math.sin(phase)*3} 639 385 661 ${356+Math.sin(phase)*4} 687 348" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="552" cy="353" r="17" fill="${PEACH}"/><path d="M552 336A17 17 0 0 1 569 353H552Z" fill="${BLUE}"/>
  <path d="M535 387H570M535 395H564M535 403H570" stroke="#B7CAEF" stroke-width="3" stroke-linecap="round"/>
  <circle cx="708" cy="412" r="14" fill="url(#mint)" stroke="${INK}" stroke-width="1"/><path d="M702 412L706 416 714 406" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="625" y="481" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${INK}">Agent</text>
 </svg>`;
}
return frame;
})(),turns:(()=>{// Adaptation of the supplied brain/circuit video to the turn lifecycle.
// Rendered as a self-contained, silent 12-second MP4; deterministic at every time.
const BLUE='#3b66d6', INK='#153471', PALE='#DCE7FF', BG='#F8F9FF';
const MINT='#A2E9B0', PEACH='#FFC48D';
const phaseAt=t=>t<2.4?0:t<5?1:t<7?2:t<9?3:4;
const captions=['Caller speaks · Agent listens','Turn committed · Agent speaks','Caller interrupts · Agent yields','Turn reopened · Listening','Response updated · Agent resumes'];
function frame(time=0){
 const phase=phaseAt(time), input=[0,2,3].includes(phase), output=[1,4].includes(phase);
 const progress=(time%1.5)/1.5;
 const bars=(x,y,count,active)=>Array.from({length:count},(_,i)=>{
  const h=active?8+28*Math.abs(Math.sin(time*5+i*.83))*Math.sin((i+1)/(count+1)*Math.PI):3;
  return `<path d="M${x+i*9} ${y-h/2}v${h}" stroke="${active?BLUE:'#AEC3F3'}" stroke-width="4" stroke-linecap="round"/>`;
 }).join('');
 const paths=['M390 117H414V76','M390 140H444V103','M390 163H472V135','M390 186H503','M390 209H466V241','M390 232H438V273','M390 255H412V294'];
 const endpoints=[[414,76],[444,103],[472,135],[503,186],[466,241],[438,273],[412,294]];
 const traces=paths.map((p,i)=>`<path d="${p}" fill="none" stroke="${output?BLUE:'#96B2F6'}" stroke-width="6" stroke-linejoin="round"/><circle cx="${endpoints[i][0]}" cy="${endpoints[i][1]}" r="6" fill="${i%3===0?MINT:i%3===1?PEACH:BG}" stroke="${output?BLUE:'#96B2F6'}" stroke-width="4"/>`).join('');
 const pulse=input?`<circle cx="${171+progress*112}" cy="167" r="5" fill="${phase===2?PEACH:MINT}" stroke="${INK}" stroke-width="1"/><circle cx="${199+((progress+.5)%1)*100}" cy="222" r="4" fill="${MINT}" stroke="${INK}" stroke-width="1"/>`:'';
 const outgoing=output?`<circle cx="${512+progress*74}" cy="186" r="5" fill="${MINT}" stroke="${INK}" stroke-width="1"/>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="608" viewBox="0 0 800 380">
 <defs><filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#3b66d6" flood-opacity=".09"/></filter></defs>
 <rect width="800" height="380" fill="${BG}"/>
 <path d="M77 196C83 108 156 49 273 50C355 16 482 44 562 73C641 86 731 128 736 204C751 295 646 324 508 318C413 338 327 305 216 317C108 330 55 276 77 196Z" fill="#F0F5FF" stroke="#CCDAF9" stroke-width="1.5"/>
 <g fill="none" stroke="#B6C9EF" stroke-width="2" stroke-linejoin="round"><path d="M169 167H282M198 222H263L286 205M256 72H278L307 108M264 282H284L304 256M510 186H586"/></g>
 ${pulse}${outgoing}
 <g filter="url(#shadow)">
  <path d="M83 100L96 88H169V249L156 261H83Z" fill="#C4D6FF" stroke="${INK}" stroke-width="1.5"/>
  <rect x="78" y="100" width="80" height="161" rx="10" fill="white" stroke="${INK}" stroke-width="1.5"/>
  <path d="M108 110H128" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <rect x="86" y="126" width="64" height="105" rx="4" fill="${input?'#E1F6EA':'#F4F7FE'}"/>
  <circle cx="118" cy="244" r="5" fill="${MINT}" stroke="${INK}" stroke-width="1"/>
  ${bars(95,178,6,input)}
 </g>
 <g stroke="#86A4E7" stroke-width="1.5"><rect x="228" y="54" width="31" height="34" rx="4" fill="${MINT}"/><circle cx="243.5" cy="65" r="5" fill="white"/><path d="M235 80C235 71 252 71 252 80" fill="white"/><path d="M230 273H266V295H249L241 302V295H230Z" fill="${PEACH}"/></g>
 <path d="M239 280H257M239 287H250" stroke="${BLUE}" stroke-width="2"/>
 <path d="M191 204C178 203 175 216 185 221C180 232 197 237 203 230C216 238 233 227 224 217C228 203 211 198 205 205C201 197 192 199 191 204Z" fill="#DCE9FF"/>
 <g filter="url(#shadow)">
  <path d="M380 72C357 59 338 69 330 87C309 79 288 95 290 115C269 123 268 146 278 160C260 182 270 207 286 215C278 238 292 258 309 258C312 279 333 285 347 275C352 294 370 298 380 283Z" fill="${BLUE}" stroke="${INK}" stroke-width="1.5"/>
  <g fill="none" stroke="#CCDBFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
   <path d="M330 88L336 109 359 112 371 97M292 117L318 120 330 145 354 137 379 146M279 161L300 164 320 147M272 190L298 188 319 207 344 188 379 193M286 215L308 226 312 252M320 208L324 239 348 244 380 226M348 245L350 273 376 270M357 112L355 137M342 189L343 166 379 161"/>
  </g>
  <g>${[[336,109],[330,145],[300,164],[298,188],[344,188],[324,239],[348,244],[376,270]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${2.5+(Math.sin(time*3-i)*.5+.5)*1.2}" fill="${i%3===0?MINT:i%3===1?PEACH:'white'}" opacity="${.45+(Math.sin(time*3-i)*.5+.5)*.55}"/>`).join('')}</g>
 </g>
 <path d="M389 72V290" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/>
 ${traces}
 <g filter="url(#shadow)">
  <path d="M586 120L599 108H714L729 123V266H586Z" fill="#BDCEFA" stroke="${INK}" stroke-width="1.5"/>
  <path d="M586 120H700L715 135V276H586Z" fill="white" stroke="${INK}" stroke-width="1.5"/>
  <path d="M700 120V135H715" fill="${PEACH}" stroke="${INK}" stroke-width="1.5"/>
  <rect x="600" y="147" width="100" height="74" rx="5" fill="${output?'#EAF0FF':'#F3F6FD'}"/>
  ${bars(615,184,9,output)}
  <g stroke="${output?BLUE:'#C4D4F3'}" stroke-width="3" stroke-linecap="round"><path d="M602 239H${output?635+Math.floor(progress*48):660}M602 251H647"/></g>
 </g>
 ${phase===2?`<g><circle cx="574" cy="186" r="15" fill="${PEACH}" stroke="${INK}" stroke-width="1"/><path d="M569 180V192M579 180V192" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>`:''}
 <g font-family="Arial, sans-serif" fill="${INK}" font-size="25" text-anchor="middle"><text x="118" y="303">Caller</text><text x="403" y="327">Turn control</text><text x="651" y="309">Agent voice</text></g>
 <text x="400" y="367" fill="${BLUE}" font-family="Arial, sans-serif" font-size="25" text-anchor="middle">${captions[phase]}</text>
 </svg>`;
}
return frame;
})(),stack:(()=>{// Floating infrastructure islands and turning gears, adapted from the user's reference.
// Five independent provider modules connect to one steady Truffl runtime.
const BLUE='#3b66d6',INK='#153471',MINT='#A2E9B0',PEACH='#FFC48D',PALE='#DCE7FF',BG='#F8F9FF';
function gear(cx,cy,r,angle){
 const points=Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2;const radius=i%6<3?r:r*.8;return `${cx+Math.cos(a)*radius},${cy+Math.sin(a)*radius}`}).join(' ');
 return `<g transform="rotate(${angle} ${cx} ${cy})" opacity=".65"><polygon points="${points}" fill="#E0EAFF" stroke="#C2D4FA" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r*.55}" fill="${BG}" stroke="#B2CAF6" stroke-width="2"/><path d="M${cx-r*.32} ${cy}h${r*.64}M${cx} ${cy-r*.32}v${r*.64}" stroke="#B2CAF6" stroke-width="2"/></g>`;
}
const icons=[
 `<path d="M-32-32H31V-4H-32Z" fill="white"/><path d="M-31-32V-9Q-15-19 0-11Q16-19 31-9M0-31V-11" fill="none" stroke="${INK}"/>
  <path d="M-41-52L0-70 42-52 0-33Z" fill="${BLUE}"/><path d="M-25-43V-27Q0-14 25-27V-43" fill="#C3D7FF"/><path d="M-41-52L0-70 42-52 0-33Z" fill="${BLUE}"/><path d="M34-48V-22" fill="none"/><circle cx="34" cy="-19" r="4" fill="${PEACH}"/>`,
 `<rect x="-17" y="-72" width="34" height="47" rx="16" fill="${MINT}"/><path d="M-27-45V-35A27 27 0 0 0 27-35V-45M0-8V2M-18 2H18" fill="none" stroke="${BLUE}" stroke-width="4"/><path d="M-8-58H8M-8-49H8M-8-40H8" stroke="${INK}" stroke-width="2"/>`,
 `<path d="M-34-52H-18L6-70V-8L-18-26H-34Z" fill="${BLUE}"/><path d="M6-70L15-64V-2L6-8Z" fill="#C6D7FF"/><path d="M28-54Q43-39 28-24M39-66Q65-39 39-12" fill="none" stroke="${PEACH}" stroke-width="5" stroke-linecap="round"/>`,
 `<path d="M-23-72L-15-79H27V-2L20 5H-23Z" fill="#C5D7FF"/><rect x="-25" y="-72" width="45" height="77" rx="6" fill="white"/><rect x="-18" y="-58" width="31" height="46" rx="3" fill="#E1F6EA" stroke="none"/><path d="M-11-44Q-8-26 8-23L12-30 4-36 0-31Q-6-34-5-40L-1-44-6-50Z" fill="${BLUE}" stroke="none"/><circle cx="-2" cy="-4" r="3" fill="${PEACH}"/>`,
 `<path d="M-13-51V-65H15V-51" fill="none" stroke-width="4"/><rect x="-36" y="-51" width="72" height="47" rx="5" fill="${MINT}"/><path d="M-36-34H36" fill="none"/><rect x="-5" y="-38" width="10" height="10" rx="2" fill="white"/><path transform="translate(12 -12) scale(.7)" d="M15-55L35-80Q31-89 38-94L40-85 47-90Q50-79 40-77L24-51Z" fill="${PEACH}"/>`
];
function frame(time=0){
 const phase=time/12*Math.PI*2;
 const modules=[['LLM',135,110],['STT',400,110],['TTS',665,110],['Telephony',190,290],['Tools',610,290]];
 const routes=[[[135,207],[68,245],[75,405],[300,420]],[[400,207],[400,270],[400,345],[400,407]],[[665,207],[732,245],[725,405],[500,420]],[[190,387],[205,420],[250,422],[300,428]],[[610,387],[595,420],[550,422],[500,428]]];
 const connections=routes.map(([p0,p1,p2,p3],i)=>{
  const t=(time/3+i*.17)%1,u=1-t;
  const x=u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0];
  const y=u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1];
  return `<path d="M${p0}C${p1} ${p2} ${p3}" fill="none" stroke="#AAC0EE" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="4.5" fill="${i%2?MINT:PEACH}" stroke="${INK}" stroke-width="1"/>`;
 }).join('');
 const islands=modules.map(([label,x,y],i)=>{
  const bob=Math.sin(phase+i*1.2)*3;
  return `<g transform="translate(${x} ${y+bob})">
   ${gear(i%2?-51:51,5,45,phase*180/Math.PI*(i%2?-1:1))}
   <g stroke="${INK}" stroke-width="1.5" stroke-linejoin="round">
    <path d="M-70 0L-40 19H36L70 0V17L47 30 28 52 8 47-6 60-30 46-46 31-60 27-70 14Z" fill="${BLUE}"/>
    <path d="M36 19L70 0V17L47 30 28 52 8 47-6 60 3 24Z" fill="#214BDA"/>
    <path d="M-70 0L-34-17H41L70 0 36 19H-40Z" fill="#D5E4FF"/>
    ${icons[i]}
   </g>
   <text y="89" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${INK}">${label}</text>
  </g>`;
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="${BG}"/>
  ${connections}
  ${islands}
  <g stroke="${INK}" stroke-width="1.5" stroke-linejoin="round">
   <path d="M285 414L319 400H488L515 414 485 465H318Z" fill="#D5E4FF"/>
   <path d="M285 414H515V452L485 473H312L285 452Z" fill="${BLUE}"/>
   <path d="M515 414V452L485 473V434Z" fill="#214BDA"/>
  </g>
  <text x="389" y="446" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" fill="white">Truffl runtime</text>
 </svg>`;
}
return frame;
})(),traces:(()=>{// Tablet inspection gesture from the supplied code-review clip, applied to execution evidence.
const BLUE='#3b66d6',INK='#153471',MINT='#A2E9B0',PEACH='#FFC48D',BG='#F8F9FF';
const stages=['Transcribe','Decide','Generate','Tools','Playback'];
const latency=[90,35,210,120,160];
function frame(time=0){
 const index=Math.min(4,Math.floor(time/2.4)),local=time%2.4;
 const previous=(index+4)%5;
 const blend=local<.35?(1-Math.cos(local/.35*Math.PI))/2:1;
 const selectedY=146+index*43;
 const fingerY=146+(previous+(index-previous)*blend)*43;
 const tilt=Math.sin(time/12*Math.PI*2)*1.6;
 const rows=stages.map((label,i)=>{
  const y=146+i*43,active=i===index;
  const starts=[0,19,31,46,70],widths=[32,20,53,36,36];
  return `<g><rect x="150" y="${y-22}" width="296" height="37" rx="4" fill="${active?'#E4F4EC':'white'}"/>
   <circle cx="160" cy="${y-4}" r="3.5" fill="${active?BLUE:'#BBD0F6'}"/>
   <text x="179" y="${y+3}" font-family="Arial, sans-serif" font-size="24" fill="${INK}">${label}</text>
   <path d="M322 ${y-5}H437" stroke="#E1E9F8" stroke-width="2"/>
   <rect x="${322+starts[i]}" y="${y-11}" width="${widths[i]}" height="12" rx="2" fill="${active?BLUE:i===3?PEACH:i===4?MINT:'#BDD0FF'}"/>
  </g>`;
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 800 500">
 <rect width="800" height="500" fill="${BG}"/>
 <g transform="rotate(${tilt} 400 250)">
  <path d="M738 550L686 348Q672 329 663 299L650 240Q647 224 660 219Q675 216 685 235L700 269Q724 274 734 301L850 503Z" fill="${PEACH}" stroke="#D39C73" stroke-width="1.5"/>
  <path d="M126 70L137 58H671L681 72V384L669 394H126Z" fill="#C7D8FF" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="70" width="550" height="324" rx="11" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>
  <path d="M131 110H659V376H131Z" fill="white"/>
  <text x="149" y="97" font-family="Arial, sans-serif" font-size="23" fill="white">Example turn</text>
  <text x="474" y="97" font-family="Arial, sans-serif" font-size="20" fill="#E1E8FF">run_01</text>
  <g stroke="none"><circle cx="603" cy="90" r="4" fill="white"/><circle cx="620" cy="90" r="4" fill="${MINT}"/><circle cx="637" cy="90" r="4" fill="${PEACH}"/></g>
  ${rows}
  <rect x="458" y="119" width="192" height="247" rx="5" fill="#EEF3FF"/>
  <g font-family="Arial, sans-serif"><text x="476" y="147" font-size="20" fill="#617AA8">EVENT</text><text x="476" y="176" font-size="26" fill="${BLUE}">evt_0${index+1}</text>
   <path d="M475 190H633" stroke="#CCD9F4"/>
   <text x="476" y="218" font-size="20" fill="#617AA8">LATENCY</text><text x="476" y="250" font-size="28" fill="${INK}">${latency[index]} ms</text>
   <text x="476" y="288" font-size="19" fill="#617AA8">CONFIG USED</text><text x="476" y="315" font-size="24" fill="${INK}">config_01</text>
   <rect x="476" y="331" width="87" height="25" rx="12" fill="${MINT}"/><text x="519" y="349" text-anchor="middle" font-size="18" fill="${INK}">Pinned</text>
  </g>
  <path d="M666 237Q668 221 680 221Q691 222 694 236L699 260Q715 278 718 301Q714 324 696 325Q681 317 676 298L654 269Q643 255 651 247Q659 239 670 250L680 262Z" fill="${PEACH}" stroke="#D39C73" stroke-width="1.5" stroke-linejoin="round"/>
  <g transform="translate(0 ${fingerY-240})">
   <path d="M9 650L40 416Q47 389 68 369L87 333Q91 309 107 291L142 239Q151 226 161 234Q172 241 162 257L143 290Q157 284 161 293Q167 306 154 321L140 344Q138 374 119 389L98 405 64 657Z" fill="${PEACH}" stroke="#D39C73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M140 296L123 319M129 329L117 344" stroke="#E5AC7D" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
  <circle cx="160" cy="${selectedY-4}" r="${7+Math.sin(local*3)*1.5}" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity=".45"/>
 </g>
 </svg>`;
}
return frame;
})(),code:(()=>{// Developer, coffee and floating code from the supplied clip, adapted to Truffl's workflow.
const BLUE='#3b66d6',INK='#153471',MINT='#A2E9B0',PEACH='#FFC48D',BG='#F8F9FF';
const stages=['Build','Test','Inspect','Deploy'];
function frame(time=0){
 const t=time%12,index=Math.floor(t/3),local=t%3;
 const sip=t<3?Math.sin(t/3*Math.PI)**2:0;
 const typing=t>3?Math.sin(t*12)*2:0;
 const nod=Math.sin(t*Math.PI/6)*1.3;
 const lines=['agent.configure(…)','checks.passed','events.inspect(…)','release.ready'];
 const colours=[BLUE,MINT,PEACH,BLUE];
 const codeRows=Array.from({length:4},(_,i)=>{
  const y=127+i*26,visible=i<index||i===index?1:.25;
  return `<g opacity="${visible}"><circle cx="466" cy="${y-6}" r="4" fill="${colours[i]}"/><text x="483" y="${y}" font-size="19" fill="${INK}" font-family="monospace">${lines[i]}</text><path d="M483 ${y+8}h${(i===index?Math.min(1,local/.8):1)*[143,118,163,130][i]}" stroke="${colours[i]}" stroke-width="3" stroke-linecap="round"/></g>`;
 }).join('');
 const tools=['REST API','SDKs','CLI','Webhooks'].map((label,i)=>`<g><rect x="${52+i*178}" y="432" width="162" height="43" rx="7" fill="${i===index?'#E4F4EC':'#EDF2FF'}" stroke="${i===index?'#96D5BA':'#C9D8FC'}"/><text x="${133+i*178}" y="460" text-anchor="middle" font-size="22" fill="${INK}" font-family="Arial, sans-serif">${label}</text></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 800 500">
 <rect width="800" height="500" fill="${BG}"/>
 <ellipse cx="390" cy="389" rx="306" ry="12" fill="#E8EEFD"/>
 <!-- Floating editor echoes the reference's growing code beside the developer. -->
 <g transform="translate(0 ${Math.sin(t*Math.PI/6)*3})">
  <rect x="445" y="61" width="294" height="192" rx="12" fill="white" stroke="#CBD9F8" stroke-width="2"/>
  <path d="M446 98H738" stroke="#DCE5F8"/>
  <circle cx="462" cy="80" r="4" fill="${BLUE}"/><circle cx="477" cy="80" r="4" fill="${MINT}"/><circle cx="492" cy="80" r="4" fill="${PEACH}"/>
  <text x="719" y="87" text-anchor="end" fill="${BLUE}" font-family="Arial, sans-serif" font-size="23">${stages[index]}</text>
  ${codeRows}
 </g>
 <!-- Soft chair behind the seated figure. -->
 <path d="M178 367L159 244Q153 216 179 207H231Q250 215 251 245L258 371" fill="#EBF1FF" stroke="#AFC2E6" stroke-width="2.5"/>
 <path d="M185 368L180 390M244 369L250 390" stroke="#AFC2E6" stroke-width="3"/>
 <!-- White overshirt and signature blue tee. -->
 <path d="M239 191Q210 192 193 213Q169 253 180 358L190 377H396L397 295Q385 225 330 207L299 191Z" fill="white" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
 <path d="M239 199L267 218L298 196L320 214L303 378H250L219 219Z" fill="${BLUE}"/>
 <path d="M237 194L216 211L234 243L246 233L268 341L250 264L259 224ZM298 197L325 211L312 241L301 231L298 279L285 339L296 224Z" fill="white" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
 <!-- Head: small attentive nod, expressive hair and glasses. -->
 <g transform="rotate(${nod} 272 195)">
  <path d="M252 158L249 195Q269 217 292 194L289 160Z" fill="${PEACH}" stroke="${INK}" stroke-width="2"/>
  <path d="M235 108Q231 88 258 83L296 98L306 137L317 153L307 159L305 178Q279 199 249 175L237 152Q223 154 223 139Q222 128 234 130Z" fill="#FFE2C3" stroke="${INK}" stroke-width="2.5"/>
  <path d="M234 133Q211 118 222 98Q203 88 218 70Q218 53 240 58Q243 35 265 47Q275 23 298 35Q318 24 331 43Q345 65 325 81Q310 105 267 100Q255 120 237 116Z" fill="${INK}" stroke="${INK}" stroke-width="2"/>
  <path d="M258 129h19v14h-19zM288 126h19v14h-19zM277 133l11-2M255 132l-16-3" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M286 151l8 3M282 170q10 4 17-2M275 164l4 10" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
 </g>
 <!-- Right arm typing behind the screen. -->
 <path d="M341 231Q375 243 399 295L424 339L404 358Q385 357 373 338L345 295" fill="white" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
 <path d="M395 343L415 335L430 348L414 364L398 358Z" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>
 <g transform="translate(0 ${typing})"><path d="M416 342Q433 339 447 348L466 359Q472 364 464 368L445 361Q458 373 449 375L428 366L413 361Z" fill="${PEACH}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></g>
 <!-- Left forearm lifts the cup for a quiet sip, then returns to the desk. -->
 <path d="M207 247Q194 269 200 304Q207 322 226 315L${302-sip*34} ${325-sip*147}L${287-sip*34} ${300-sip*147}L225 277" fill="white" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
 <g transform="translate(${-sip*34} ${-sip*147}) rotate(${-sip*13} 310 309)">
  <path d="M281 296L294 292L308 321L294 330Z" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>
  <path d="M337 299Q362 292 360 313Q358 326 340 321" fill="none" stroke="${INK}" stroke-width="4"/>
  <path d="M308 290H342L339 331Q325 340 310 330Z" fill="${MINT}" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="325" cy="290" rx="17" ry="4" fill="#EBFFF3" stroke="${INK}" stroke-width="2"/>
  <path d="M294 300L314 296Q324 298 324 302L307 308L322 308Q328 312 321 315L310 317L319 318Q324 322 317 325L304 326L296 320" fill="${PEACH}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
 </g>
 <!-- Truffl laptop and small architectural arch on its lid. -->
 <path d="M425 267H664L637 374H399Z" fill="${BLUE}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
 <path d="M430 273H656" stroke="#8FA8FF" stroke-width="2"/>
 <path d="M502 336V309Q504 290 522 290Q540 291 541 309V336H529V310Q529 303 522 303Q516 303 515 310V336Z" fill="white" transform="skewX(-13) translate(78 0)"/>
 <path d="M386 373H648L637 384H378Q370 380 386 373Z" fill="#C5D7FF" stroke="${INK}" stroke-width="2.5"/>
 <path d="M487 375H544L538 379H491Z" fill="#91B0F4"/>
 <!-- Desk and notebook echo the reference without extra clutter. -->
 <path d="M57 387H754" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
 <path d="M96 373H157V385H96Z" fill="${PEACH}" stroke="${INK}" stroke-width="2"/><path d="M104 378H151" stroke="white" stroke-width="2"/>
 <path d="M689 378L705 334L719 378Z" fill="${MINT}" stroke="${INK}" stroke-width="2"/><path d="M704 378V386" stroke="${INK}" stroke-width="3"/>
 ${tools}
 </svg>`;
}
return frame;
})()};
 // Keep actual SVG nodes in the page: no embedded-video decoder or video compositor.
 // Patch only changing attributes and text, retaining the artwork between frames.
 function reconcile(current,next){
  if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){current.replaceWith(next.cloneNode(true));return;}
  if(current.nodeType===3){if(current.nodeValue!==next.nodeValue)current.nodeValue=next.nodeValue;return;}
  if(current.nodeType!==1)return;
  for(const attr of Array.from(current.attributes))if(!next.hasAttribute(attr.name))current.removeAttribute(attr.name);
  for(const attr of Array.from(next.attributes))if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
  let i=0;
  while(i<next.childNodes.length){
   if(current.childNodes[i])reconcile(current.childNodes[i],next.childNodes[i]);
   else current.appendChild(next.childNodes[i].cloneNode(true));
   i++;
  }
  while(current.childNodes.length>next.childNodes.length)current.lastChild.remove();
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const name of ['primitives','turns','stack','traces','code']){
  const host=document.getElementById(name+'-video'),toggle=document.getElementById(name+'-motion-toggle');
  if(!host||!toggle)continue;
  const scratch=document.createElement('template');
  const phases=name==='turns'?document.querySelectorAll('#dev-turns .dev-phase-list span'):[];
  let paused=reduced.matches,inView=false,raf=0,time=0,last=0,lastPaint=0;
  function paint(){
   scratch.innerHTML=factories[name](time).replace('<svg ','<svg aria-hidden="true" focusable="false" ').replace(/id="(shadow|mint|peach)"/g,(_,id)=>'id="'+name+'-'+id+'"').replace(/url\(#(shadow|mint|peach)\)/g,(_,id)=>'url(#'+name+'-'+id+')');
   reconcile(host.firstElementChild,scratch.content.firstElementChild);
   host.dataset.time=time.toFixed(3);
   const phase=time<2.4?0:time<5?1:time<7?2:time<9?3:4;
   phases.forEach((item,i)=>item.classList.toggle('dev-phase-active',i===phase));
  }
  function tick(now){
   raf=0;
   if(last)time=(time+Math.min((now-last)/1000,.1))%12;
   last=now;
   if(now-lastPaint>=1000/24){paint();lastPaint=now;}
   raf=requestAnimationFrame(tick);
  }
  function sync(){
   if(raf)cancelAnimationFrame(raf);raf=0;last=0;
   const label=name==='turns'?'turn lifecycle':name==='stack'?'modular providers':name==='traces'?'execution trace':name==='code'?'developer workflow':'conversation primitives';
   toggle.setAttribute('aria-label',(paused?'Play':'Pause')+' '+label+' animation');
   toggle.querySelector('path').setAttribute('d',paused?'M7 4l9 6-9 6Z':'M7 5v10M13 5v10');
   if(inView&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);
  }
  toggle.addEventListener('click',()=>{paused=!paused;sync()});
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync()});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pageshow',sync);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{threshold:.15}).observe(host);
  // A complete first frame is already inline and stays visible even before scripts run.
  sync();
 }
})();
