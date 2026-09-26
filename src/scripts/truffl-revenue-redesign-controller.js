
(()=>{
const root=document.getElementById('truffl-recovery-concept');if(!root)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const state={hero:'Blue',playing:!reduce.matches,speed:0.7};
const control=root.querySelector('#tr-motion-pause');
const animation=globalThis.lottie?.loadAnimation({container:root.querySelector('#tr-revenue-motion'),renderer:'svg',loop:true,autoplay:false,animationData:JSON.parse(document.getElementById('tr-revenue-data').textContent)});
let ready=false,visible=true;
function render(){root.dataset.hero='Blue';root.dataset.playing=String(state.playing&&visible&&!document.hidden);const overlay=root.querySelector('.tr-agent-overlay');if(overlay){state.playing&&visible&&!document.hidden?overlay.unpauseAnimations():overlay.pauseAnimations()}control.textContent=state.playing?'Ⅱ':'▶';control.setAttribute('aria-label',state.playing?'Pause animation':'Play animation');if(animation&&ready){animation.setSpeed(state.speed);state.playing&&visible&&!document.hidden?animation.play():animation.pause()}}
if(animation)animation.addEventListener('DOMLoaded',()=>{ready=true;animation.goToAndStop(60,true);render()});
control.addEventListener('click',()=>{state.playing=!state.playing;render()});
const obs=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;render()},{threshold:0});obs.observe(root.querySelector('#tr-revenue-motion'));
document.addEventListener('visibilitychange',render);
reduce.addEventListener('change',()=>{state.playing=!reduce.matches;render()});
const stages=[
{title:'Start with the right context.',copy:'Use cart, customer and campaign context to decide when to reach out and which recovery policy applies.',label:'Illustrative recovery context',a:'Cart context · Customer history · Campaign policy',b:'Contact rules checked before reaching out.',note:'Prioritisation follows your recovery policy.'},
{title:'Understand what stopped the purchase.',copy:'Speak naturally, handle interruptions and respond to hesitation or changing intent. A conversation can uncover what another reminder cannot.',label:'Illustrative conversation',a:'Was there anything stopping you from completing your order?',b:'I wanted to check the delivery date first.',note:'Check serviceability before making a promise.'},
{title:'Take the permitted next step.',copy:'Verify facts in connected systems and carry out only the actions you allow. Confirm before acting, or hand over with context.',label:'Illustrative action flow',a:'Check delivery → Confirm the details → Offer a checkout link',b:'Send through the approved channel, with permission.',note:'No invented availability, offers or discounts.'},
{title:'Keep the outcome and the reason.',copy:'Record reasons, attempts, conversion, refusal, follow-up and escalation. Each conversation becomes evidence for improving the next.',label:'Illustrative outcome record',a:'Reason · Delivery question',b:'Next step · Follow up on checkout outcome',note:'A sent link is recorded separately from a completed purchase.'}
];
const tabs=[...root.querySelectorAll('.tr-step')];
function selectStage(i){const s=stages[i];tabs.forEach((b,n)=>b.setAttribute('aria-selected',String(n===i)));root.querySelector('#tr-journey-detail').setAttribute('aria-labelledby','tr-tab-'+i);for(const [id,key] of [['tr-stage-title','title'],['tr-stage-copy','copy'],['tr-scene-label','label'],['tr-scene-a','a'],['tr-scene-b','b'],['tr-scene-note','note']])root.querySelector('#'+id).textContent=s[key];}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>selectStage(i));b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:3))%4;tabs[n].focus();selectStage(n)}})});
render();
})();
