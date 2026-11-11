/* ===== SIM KIT core. Loaded AFTER the lab file, which defines: const LAB={...} and IMG (assets). =====
   Step kinds handled by the kit: safety, predict, pack, questions. Kind 'lab' is drawn by LAB.lab[id]. */
const KIT_VERSION='1.0';
const STEPS=LAB.steps.map(s=>s.n),KEY=LAB.key,CUT=new Set(LAB.cut||[]);
const API=(()=>{try{const u=new URLSearchParams(location.search).get('api');return u&&(/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u)||/^http:\/\/localhost:\d+\/exec$/.test(u))?u:null}catch(e){return null}})();
const PPEN=[['coat','Lab coat'],['gog','Goggles'],['glove','Gloves']];
const QZ=LAB.questions||{},NWORDS=QZ.minWords||6,SK=QZ.skills||['Interpret','Link','Evaluate'];
const LV=[['0','Need help','🆘'],['1','Partly','🌗'],['2','Independently','🚀']];
const PAGES=QZ.pages||[];
const ALLQ=PAGES.flatMap(p=>p.type==='qs'?p.qs:[]);
const words=s=>(String(s||'').trim().match(/\S+/g)||[]).length;
const kindOf=i=>LAB.steps[i]?LAB.steps[i].kind:null;
const stepIx=k=>LAB.steps.findIndex(s=>s.kind===k);
const labOf=i=>{const s=LAB.steps[i];return s&&s.kind==='lab'?LAB.lab[s.id]:null};
const LAST=LAB.steps.length-1;
/* ===== state ===== */
function fresh(){return{v:1,kv:KIT_VERSION,step:-1,max:0,name:'',cls:'10A',gr:'10',let:'A',t0:Date.now(),errs:0,errLog:{},dev:0,
 ppe:[],pledge:(LAB.safety.promises||[]).map(()=>0),haz:{sel:[],chk:0,ok:0},
 pred:{pick:null,text:''},pk:{done:{},wash:0},
 w:{pg:0,b:SK.map(()=>-1),a:SK.map(()=>-1),ans:{},idea:'',ev:'',sh:{}},hints:0,finished:0,celeb:0,L:LAB.fresh?LAB.fresh():{}}}
let S=fresh(),HELD=null,NOCLICK=0,WASH=null,DRG=null,BUSY=0,LASTP={x:innerWidth/2,y:innerHeight/2},LASTN={s:-9,n:0};
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const I=(n,c,alt)=>`<img data-i="${n}" class="${(c||'')+(CUT.has(n)?' co':'')}" alt="${esc(alt||'')}" draggable="false">`;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const j=localStorage.getItem(KEY);if(j){const o=JSON.parse(j);if(o&&o.v===1){const f=fresh();for(const k in f)if(o[k]==null)o[k]=f[k];for(const k in f.w)if(o.w[k]==null)o.w[k]=f.w[k];if(LAB.migrate)LAB.migrate(o);return o}}}catch(e){}return null}
function say(t,isBad,good){const m=$('#msg');if(!m)return;m.textContent=t||coach();m.className=isBad?'bad':good?'good':'';if(isBad){void m.offsetWidth;m.classList.add('flash');S.errs++;S.errLog[t]=(S.errLog[t]||0)+1;sfx('bad')}}
const bad=t=>say(t,true);
function coach(){const s=LAB.steps[S.step];if(!s)return '';if(s.coach)return s.coach;
 return {safety:'Dress the student, tick your promises and spot the hazards.',predict:'Write your prediction. Then go to the next step.',pack:'Put every item in the right place. Then wash your hands.',questions:'Answer the questions on each page. Then finish the lab.'}[s.kind]||''}
/* ===== sound (made in the browser, no files) ===== */
let AC=null,MUTE=false;try{MUTE=localStorage.getItem(KEY+'m')==='1'}catch(e){}
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});return AC}
document.addEventListener('pointerdown',()=>{ac()},true);
function tone(f,t0,d,type,g,f2){const c=AC,T=c.currentTime+t0,o=c.createOscillator(),n=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,T);if(f2)o.frequency.exponentialRampToValueAtTime(f2,T+d);n.gain.setValueAtTime(.0001,T);n.gain.linearRampToValueAtTime(g||.15,T+.012);n.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(n);n.connect(c.destination);o.start(T);o.stop(T+d+.05)}
let NB=null;
function noise(t0,d,type,f,g,f2){const c=AC,T=c.currentTime+t0;if(!NB){NB=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
 const s=c.createBufferSource();s.buffer=NB;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,T);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,T+d);fl.Q.value=type==='bandpass'?1.4:.7;const n=c.createGain();n.gain.setValueAtTime(.0001,T);n.gain.linearRampToValueAtTime(g||.1,T+Math.min(.05,d/4));n.gain.exponentialRampToValueAtTime(.0001,T+d);s.connect(fl);fl.connect(n);n.connect(c.destination);s.start(T);s.stop(T+d+.05)}
const SFX=Object.assign({
 pop(){tone(480,0,.13,'sine',.2,900)},
 good(){tone(660,0,.1,'triangle',.15);tone(990,.09,.18,'triangle',.15)},
 bad(){tone(190,0,.25,'sawtooth',.08,110)},
 tap(){tone(700,0,.05,'triangle',.07)},
 scribble(){for(let i=0;i<8;i++)noise(i*.11,.1,'bandpass',2200+(i%2)*1100,.08)},
 pour(){noise(0,1.05,'lowpass',700,.14,2200);for(let i=0;i<6;i++)tone(500+Math.random()*500,.4+i*.1,.07,'sine',.04)},
 splash(){noise(0,.4,'bandpass',1800,.18,400);tone(150,0,.28,'sine',.22,55)},
 fold(){noise(0,.2,'highpass',2600,.1);noise(.12,.12,'highpass',3600,.06)},
 wash(){noise(0,1,'bandpass',1700,.07);for(let i=0;i<5;i++)tone(380+Math.random()*700,i*.2,.07,'sine',.05,800)},
 done(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.12,.5,'triangle',.14))}},LAB.sfx||{});
function sfx(n){if(MUTE)return;try{if(ac()&&SFX[n])SFX[n]()}catch(e){}}
function setMute(v){MUTE=v;try{localStorage.setItem(KEY+'m',v?'1':'0')}catch(e){}const b=$('#mute');if(b){b.textContent=v?'🔇':'🔊';b.setAttribute('aria-pressed',v?'true':'false')}}
/* ===== sparkles and progress pop ===== */
function burst(x,y,n){n=n||14;const cols=['var(--lime)','var(--mag)','var(--vio)','var(--orange)','var(--teal)'];for(let i=0;i<n;i++){const e=document.createElement('i');e.className='spk';const a=Math.random()*6.28,r=40+Math.random()*70;e.style.cssText=`left:${x}px;top:${y}px;background:${cols[i%5]};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px`;document.body.appendChild(e);setTimeout(()=>e.remove(),800)}}
function elCentre(sel){const e=$(sel);if(!e)return LASTP;const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}
function checkProgress(){if(S.step<0){LASTN={s:S.step,n:0};return}let n=0;try{n=reqs().filter(x=>x.d).length}catch(e){}
 const id=S.step+'.'+(kindOf(S.step)==='questions'?S.w.pg:0);
 if(LASTN.s===id&&n>LASTN.n){sfx('good');burst(LASTP.x,LASTP.y);const t=$('.todo');if(t){t.classList.remove('popd');void t.offsetWidth;t.classList.add('popd')}}
 LASTN={s:id,n}}
document.addEventListener('pointerdown',e=>{LASTP={x:e.clientX,y:e.clientY}},true);
/* ===== tracking (teacher dashboard, only when the link has ?api=) ===== */
function track(kind,extra){
 if(!API||!S.name||!S.name.trim()||S.step<0)return;
 let pg=0,pm=0;try{const r=reqs();pm=r.length;pg=r.filter(x=>x.d).length}catch(e){}
 const p=Object.assign({k:kind,sim:LAB.sim,simTitle:LAB.title,ver:LAB.version,steps:STEPS,id:S.cls+'|'+S.name.trim().toLowerCase().replace(/\s+/g,' ').slice(0,30),name:S.name.trim(),sid:'',cls:S.cls,step:S.step,stepName:STEPS[S.step],done:!!S.finished,t0:S.t0,prog:pg,progMax:pm,errs:S.errs||0,adv:0,ts:Date.now()},extra||{});
 try{fetch(API,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(p),keepalive:kind!=='done'}).catch(()=>{})}catch(e){}}
setInterval(()=>{if(S.step>=0&&!S.finished)track('beat')},20000);
/* ===== requirements ===== */
const hazOK=()=>(LAB.safety.hazards||[]).every(h=>S.haz.sel.includes(h.id)===!!h.h);
function pageReqs(pg){const p=PAGES[pg],w=S.w,R=[];if(!p)return R;
 if(p.type==='rate')R.push({l:'Rate your skills (before)',d:w.b.every(x=>x>=0),a:'Rate each skill <b>0, 1 or 2</b> before you write. Then press <b>Next</b>.'});
 if(p.type==='auto'&&p.reqs)R.push(...p.reqs(S));
 if(p.type==='qs')p.qs.forEach(q=>R.push({l:q.n,d:words(w.ans[q.k])>=NWORDS,a:`Answer <b>${q.n}</b> (${words(w.ans[q.k])}/${NWORDS} words).`}));
 if(p.type==='exit'){R.push({l:'Rate your skills again',d:w.a.every(x=>x>=0),a:'Rate each skill <b>0, 1 or 2</b> again.'});
  R.push({l:'One idea I improved',d:words(w.idea)>=3,a:'Write <b>one idea you improved</b> (3+ words).'});
  R.push({l:'Evidence question',d:!!w.ev,a:'Choose the question that shows your improvement.'})}
 return R}
const allPages=()=>PAGES.every((p,i)=>pageReqs(i).every(x=>x.d));
function reqs(){const R=[],k=kindOf(S.step),sf=LAB.safety;
 if(k==='safety'){R.push({l:'Type your name',d:S.name.trim().length>1,a:'Type your <b>name</b> and choose your <b>class</b>.'});
  if(sf.ppe!==false){const nx=PPEN[S.ppe.length];R.push({l:'Dress the student',d:S.ppe.length===3,a:nx?`Drag the <b>${nx[1].toLowerCase()}</b> onto the student, or tap it and then tap the student.`:''})}
  R.push({l:'Tick the safety promises',d:S.pledge.every(Boolean),a:'Tick every <b>safety promise</b>.'});
  if((sf.hazards||[]).length)R.push({l:'Spot the hazards',d:!!S.haz.ok,a:'Tap every <b>hazard</b>. Then press <b>Check</b>.'})}
 else if(k==='predict'){const p=LAB.predict;if(p.options)R.push({l:p.pickLabel||'Choose',d:!!S.pred.pick,a:p.pickHelp||'Choose one.'});
  R.push({l:'Write your prediction',d:words(S.pred.text)>=(p.minWords||NWORDS),a:`Write your <b>prediction</b> (${words(S.pred.text)}/${p.minWords||NWORDS} words).`})}
 else if(k==='pack'){const left=LAB.pack.items.filter(i=>!S.pk.done[i.id]).length;
  R.push({l:'Sort all lab items',d:left===0,a:`Drag each item to the right place, or tap it and then tap the place. <b>${left} left</b>.`});
  if(sf.ppe!==false)R.push({l:'Take off your PPE',d:S.ppe.length===0,a:left?'':'Take off your PPE in reverse order: <b>gloves</b>, <b>goggles</b>, <b>lab coat</b>. Tap each one.'});
  R.push({l:'Wash your hands',d:!!S.pk.wash,a:'Press <b>Wash hands (10 s)</b>.'})}
 else if(k==='questions')return pageReqs(S.w.pg);
 else if(k==='lab'){const L=labOf(S.step);return L.reqs?L.reqs(S):[]}
 return R}
function todoHTML(){const r=reqs(),n=r.filter(x=>x.d).length,cur=r.find(x=>!x.d),q=kindOf(S.step)==='questions';
 const tx=cur?cur.a:(q?(S.finished?'Lab finished. Your answers are saved with this lab.':(S.w.pg<PAGES.length-1?'Page done. Press <b>Next</b>.':'All answered. Press <b>Finish lab</b>.')):'All done here. Press <b>Next</b>.');
 return `<div class="todo"><div class="tl">NEXT</div><div class="tx" id="act">${tx}</div><div class="tp"><b id="cnt">${n}/${r.length}</b><div class="bar"><i style="width:${r.length?n/r.length*100:0}%"></i></div></div></div>`}
function refreshTodo(){if(S.step<0)return;checkProgress();const t=$('.todo');if(t){const d=document.createElement('div');d.innerHTML=todoHTML();t.replaceWith(d.firstChild)}nudge()}
function nudge(){const b=$('#bNext');if(b)b.classList.toggle('nudge',S.step>=0&&!b.hidden&&!reqs().find(x=>!x.d))}
/* ===== kit pages ===== */
function welcome(){const sv=load();
 return `<div class="welcome"><div class="pic">${LAB.welcomeImg?I(LAB.welcomeImg,'',LAB.title):''}</div>
 <div><div class="sub">${esc(LAB.sub||'')}</div><h1>${LAB.titleHTML||esc(LAB.title)}</h1><p><b>Mission:</b> ${LAB.mission||''}</p>
 <div class="row"><button class="btn pri bigbtn" data-a="start">Start lab</button>${sv&&sv.step>=0&&!sv.finished?`<button class="btn bigbtn" data-a="cont">Welcome back${sv.name?', '+esc(sv.name):''}: Continue</button>`:''}</div>
 <p class="tip" style="margin-top:10px">Works on iPad and computers. Progress saves on this device. <span class="ver">${esc(LAB.id)} v${esc(LAB.version)} · kit ${KIT_VERSION}</span></p></div></div>`}
function nameFields(){return `<div class="field"><label class="lbl" for="nm">Your name</label><input id="nm" data-in="name" value="${esc(S.name)}" autocomplete="off"></div>
 <div class="field"><span class="lbl">Your class</span><div class="row" style="flex-wrap:nowrap"><select aria-label="Grade" data-in="gr" style="flex:1">${(LAB.grades||['9','10']).map(g=>`<option ${S.gr===g?'selected':''}>${g}</option>`).join('')}</select><select aria-label="Class letter" data-in="let" style="flex:1">${'ABCDEFGH'.split('').map(c=>`<option ${S.let===c?'selected':''}>${c}</option>`).join('')}</select></div></div>`}
function safetyHTML(){const sf=LAB.safety,n=S.ppe.length,H=S.haz,hz=sf.hazards||[];
 const left=sf.ppe!==false?`<div class="pn t1"><h2>Dress the student</h2><div class="fig lt drop" data-drop="body">${I('fig'+n,'','Student wearing '+n+' of 3 pieces of PPE')}</div>
  <div class="ppe">${PPEN.map(([id,t],k)=>`<div class="it lt ${S.ppe.includes(id)?'gone':''} ${HELD===id?'held':''}" data-drag="${id}" role="button" tabindex="0" aria-label="${t}">${I('ic_'+id,'',t)}<span>${k+1} ${t}</span></div>`).join('')}</div></div>`
  :`<div class="pn t1"><h2>What you will use</h2><div class="benchstrip" style="grid-template-columns:1fr 1fr;grid-auto-rows:minmax(0,1fr)">${(sf.use||[]).map(([i,t])=>`<div class="tile it" style="cursor:default">${I(i,'',t)}<span>${t}</span></div>`).join('')}</div></div>`;
 const mid=`<div class="pn t3 scroll"><h2>Before you start</h2>${nameFields()}<div class="lbl">Safety promises</div>
  ${sf.promises.map((t,i)=>`<button class="pl ${S.pledge[i]?'on':''}" data-a="pl" data-i="${i}"><i>✓</i><span>${t}</span></button>`).join('')}
  ${(sf.remember||[]).length?`<div class="lbl">Remember</div><ul class="rem">${sf.remember.map(r=>`<li>${r}</li>`).join('')}</ul>`:''}</div>`;
 const right=hz.length?`<div class="pn t2"><h2>Spot the hazards</h2><p class="tip" style="margin:0">Tap everything that is a hazard in this lab.</p><div class="hz">${hz.map(h=>{const sel=H.sel.includes(h.id);let c=sel?'sel':'';if(H.chk){c=sel&&h.h?'good':sel&&!h.h?'bad':!sel&&h.h?'miss':''}
   return `<div class="hc ${c}" data-a="hz" data-id="${h.id}" role="button" tabindex="0">${h.img?I(h.img,'',h.t):`<div class="ic">${h.ic}</div>`}<span>${h.t}</span>${H.chk&&(c==='bad'||c==='miss')?`<small>${h.w}</small>`:''}</div>`}).join('')}</div>
  <div class="row"><button class="btn pri" data-a="hzchk">Check</button>${H.ok?'<span class="pill ok">All hazards found</span>':''}</div></div>`:'';
 return `<div class="bench safe" ${right?'':'style="grid-template-columns:minmax(190px,280px) minmax(0,1fr)"'}>${left}${mid}${right}</div>`}
function predHTML(){const p=LAB.predict;
 const opts=p.options?`<div class="pn t1"><h2>${p.pickTitle||'Choose'}</h2><div class="mkgrid">${p.options.map(o=>`<div class="mkc ${S.pred.pick===o.id?'on':''}" data-a="ppick" data-id="${o.id}" role="button" tabindex="0">${o.img?I(o.img,'',o.t):''}<span>${esc(o.t)}</span></div>`).join('')}</div></div>`:(p.img?`<div class="pn t1"><div class="rwrap"><div class="rimg nc">${I(p.img,'',p.imgAlt||'')}</div></div></div>`:'');
 return `<div class="bench" style="grid-template-columns:${opts?'minmax(0,1fr) minmax(0,1fr)':'minmax(0,1fr)'}">${opts}<div class="pn t3"><h2>${p.title||'Predict before you start'}</h2><p class="qh"><b>${p.prompt}</b>${p.help?`<small>${p.help}</small>`:''}</p><textarea class="ta" data-in="pred" data-min="${p.minWords||NWORDS}" aria-label="Prediction">${esc(S.pred.text)}</textarea><div class="stat">${words(S.pred.text)} words (need ${p.minWords||NWORDS}+)</div></div></div>`}
const WASHSVG='<svg class="wsvg" viewBox="0 0 200 150" aria-hidden="true"><rect x="64" y="6" width="72" height="12" rx="6" fill="#9aa6d6"/><rect x="92" y="16" width="16" height="20" rx="4" fill="#b7c1ea"/><line class="wat" x1="100" y1="38" x2="100" y2="92" stroke="#6fe0ff" stroke-width="7" stroke-linecap="round" stroke-dasharray="9 8"/><g class="hl"><rect x="40" y="86" width="86" height="30" rx="15" fill="#f1bd94"/><rect x="108" y="90" width="38" height="9" rx="4.5" fill="#f1bd94"/><rect x="108" y="100" width="40" height="9" rx="4.5" fill="#e9b186"/></g><g class="hr"><rect x="74" y="92" width="86" height="30" rx="15" fill="#f7cfae"/><rect x="54" y="96" width="38" height="9" rx="4.5" fill="#f7cfae"/><rect x="52" y="106" width="40" height="9" rx="4.5" fill="#efc09b"/></g><g class="foam"><circle cx="70" cy="96" r="7" fill="#fff"/><circle cx="104" cy="84" r="9" fill="#e9f7ff"/><circle cx="132" cy="100" r="7" fill="#fff"/><circle cx="90" cy="118" r="8" fill="#e9f7ff"/><circle cx="118" cy="120" r="6" fill="#fff"/><circle cx="58" cy="112" r="6" fill="#e9f7ff"/></g></svg>';
function packHTML(){const pk=S.pk,P=LAB.pack,left=P.items.filter(i=>!pk.done[i.id]),ppe=LAB.safety.ppe!==false;
 const tile=i=>`<div class="it ${HELD===i.id?'held':''}" data-drag="${i.id}" role="button" tabindex="0" aria-label="${esc(i.t)}">${I(i.img,'',i.t)}<span>${esc(i.t)}</span></div>`;
 const cnt=k=>P.items.filter(i=>i.bin===k&&pk.done[i.id]).length;
 const bub=Array.from({length:14},(_,i)=>`<i class="bub" style="left:${6+i*6.5}%;animation-delay:${(i*.37)%2.2}s">🫧</i>`).join('');
 const ready=!left.length&&(!ppe||S.ppe.length===0);
 const off=ppe&&!left.length&&S.ppe.length?`<div class="ppe">${PPEN.map(([id,t])=>`<div class="it lt ${S.ppe.includes(id)?'':'gone'}" data-a="unwear" data-id="${id}" role="button" tabindex="0" aria-label="Take off ${t}">${I('ic_'+id,'',t)}<span>${t}</span></div>`).join('')}</div>`:'';
 return `<div class="bench" style="grid-template-columns:minmax(200px,300px) minmax(0,1fr) minmax(170px,240px)">
 <div class="pn t2"><h2>Lab items · ${left.length} left</h2><div class="itemlist" style="grid-template-columns:1fr">${left.map(tile).join('')}</div></div>
 <div class="pn t1"><h2>Where does it go?</h2><div class="bins2">${Object.entries(P.bins).map(([k,b])=>`<div class="bn" data-drop="bin:${k}" role="button" tabindex="0">${I(b.img,'',b.t)}<span>${esc(b.t)}</span>${cnt(k)?`<b class="cnt">${cnt(k)}</b>`:''}</div>`).join('')}</div></div>
 <div class="pn t3"><h2>You</h2>${off}<div class="fig hands ${pk.wash?'clean':''}" id="hands" style="flex-direction:column;gap:6px;text-align:center;padding:10px">${bub}${WASHSVG}<b>${pk.wash?'Clean hands!':'Sort the items'+(ppe?', take off your PPE,':'')+' then wash your hands for 10 seconds.'}</b></div><button class="btn ${ready?'pri':'dis'}" data-a="wash" id="washB">${pk.wash?'✓ Hands washed':'Wash hands (10 s)'}</button></div></div>`}
/* ----- question pages ----- */
const pgStrip=()=>`<div class="pgs" aria-label="Page ${S.w.pg+1} of ${PAGES.length}">${PAGES.map((p,i)=>`<i class="${i<S.w.pg?'d':''} ${i===S.w.pg?'c':''}"></i>`).join('')}<span>Page ${S.w.pg+1} of ${PAGES.length}</span></div>`;
const rateRows=t=>SK.map((s,i)=>`<div class="rate"><b>${s}</b><div class="rb">${LV.map(([v,l,e])=>`<button class="rp ${S.w[t][i]===+v?'on':''}" data-a="rate" data-t="${t}" data-i="${i}" data-v="${v}"><span class="re" aria-hidden="true">${e}</span><span class="rn">${v}</span><small>${l}</small></button>`).join('')}</div></div>`).join('');
const dokB=n=>n?`<span class="dok" title="Depth of Knowledge level ${n}">DOK ${n}</span>`:'';
function pqHTML(q,cls,first){const w=S.w,sh=w.sh[q.k];
 return `<div class="pn ${cls}"><h2><span class="qn">${q.n}</span> ${q.ext?'<span class="ext">Extension question</span>':''} ${dokB(q.dok)}</h2>${first?pgStrip():''}<p class="qh"><b>${q.t}</b>${q.h?`<small>${q.h}</small>`:''}</p>${q.sup?`<div><button class="btn sm ${sh?'on':''}" data-a="sup" data-k="${q.k}">💡 Support</button></div>${sh?`<div class="supbox">${q.sup}</div>`:''}`:''}<textarea class="ta" data-in="ans.${q.k}" aria-label="${q.n}">${esc(w.ans[q.k])}</textarea><div class="stat">${words(w.ans[q.k])} words (need ${NWORDS}+)</div></div>`}
const narrow=h=>`<div class="bench" style="grid-template-columns:minmax(0,1fr)"><div class="pn t5 scroll" style="max-width:760px;margin:0 auto;width:100%">${pgStrip()}${h}</div></div>`;
function growthHTML(){const w=S.w;return `<div class="growth"><h2 style="margin:0">Skill growth</h2>${SK.map((s,i)=>{const b=w.b[i],a=w.a[i],d=a>=0&&b>=0?a-b:null;return `<div class="gr"><b>${s}</b><span class="gb">${b<0?'–':b}</span><i class="ga">→</i><span class="gb ${d>0?'up':''}">${a<0?'–':a}</span><em>${d==null?'':d>0?'▲ +'+d:d<0?'▼ '+d:'same'}</em></div>`}).join('')}</div>`}
function questionsHTML(){const w=S.w,p=PAGES[w.pg];if(!p)return '';
 if(p.type==='rate')return narrow(`<h2>Before you write</h2><p class="qh">How confident are you with these skills right now? Be honest. <small>0 = need help, 1 = partly, 2 = independently</small></p>${rateRows('b')}`);
 if(p.type==='auto')return p.html(S,pgStrip());
 if(p.type==='qs')return `<div class="bench qs" ${p.qs.length+(p.ref?1:0)<3?`style="grid-template-columns:repeat(${p.qs.length+(p.ref?1:0)},minmax(0,1fr))"`:''}>${p.qs.map((q,i)=>pqHTML(q,'t'+[5,3,4][i%3],i===0)).join('')}${p.ref?`<div class="pn t1"><h2>Reference</h2><p class="qh">${p.ref}</p></div>`:''}</div>`;
 if(p.type==='exit')return narrow(`${QZ.peer?`<h2>Peer feedback and tidy up</h2><div class="supbox">${QZ.peer}</div>`:''}<h2>Exit ticket</h2><p class="qh">Rate again. <small>0 = need help, 1 = partly, 2 = independently</small></p>${rateRows('a')}
  <label class="lbl" for="idea">One idea I improved</label><input id="idea" data-in="idea" value="${esc(w.idea)}" autocomplete="off" style="width:100%">
  <label class="lbl" for="ev">Evidence of my improvement is in question</label><select id="ev" data-in="ev" aria-label="Evidence question"><option value="">choose</option>${ALLQ.map(q=>`<option ${w.ev===q.n?'selected':''}>${q.n}</option>`).join('')}</select>`);
 const tc=Math.round((Date.now()-S.t0)/60000);
 return narrow(`<h2>${esc(S.name||'Student')} · ${S.cls}</h2>${LAB.summary?LAB.summary(S):''}${PAGES.some(x=>x.type==='rate')?growthHTML():''}<p class="stat">Time ${tc} min · mistakes ${S.errs}${S.hints?' · hints used '+S.hints:''}</p>
  <div class="row"><button class="btn" data-a="copy">Copy answers</button>${/github\.io$/.test(location.hostname)?'<button class="btn pri" data-a="print">Print / Save as PDF</button><button class="btn" data-a="dl">Download answers</button>':'<span class="tip">The Print / Save as PDF button appears on the published (github.io) version.</span>'}</div>
  ${S.finished?`<div class="ok-box"><b>Lab finished.</b> Your answers are saved with this lab.</div>`:`<button class="btn pri bigbtn" data-a="finish">Finish lab</button>`}`)}
function doneHTML(){const cols=['#2ee6a8','#ffd166','#ff6b9d','#6ec1ff','#b79cff','#ff9f43'];let cf='';for(let i=0;i<70;i++){const l=(i*37+11)%100,d=((i*53)%40)/10,du=3.2+((i*29)%30)/10,c=cols[i%6],w=6+(i*7)%7,r=(i*47)%360;cf+=`<i class="cf" style="left:${l}%;background:${c};width:${w}px;height:${w*1.6}px;animation-delay:${d}s;animation-duration:${du}s;--r:${r}deg"></i>`}
 let fw='';[[18,28],[78,22],[50,14],[30,62],[70,60]].forEach((p,k)=>{let r='';for(let j=0;j<12;j++)r+=`<b style="--a:${j*30}deg;background:${cols[(j+k)%6]}"></b>`;fw+=`<div class="fw" style="left:${p[0]}%;top:${p[1]}%;animation-delay:${k*0.7}s">${r}</div>`});
 return `<div class="bench celeb" style="grid-template-columns:minmax(0,1fr)"><div class="cel-fx" aria-hidden="true">${cf}${fw}</div>
 <div class="pn cel-card"><div class="cel-ic" aria-hidden="true">🏆</div><h1 class="cel-t">You’re done! 🎉</h1>
 <p class="cel-p">Well done, <b>${esc(S.name||'Student')}</b>. Your lab is finished.</p><p class="cel-s">You can close this page <b>OR</b></p>
 <button class="btn pri bigbtn" data-a="back2res">Back to my results</button></div></div>`}
/* hint pop-up any lab can use: hint('Your water times',[['Water start','08:05'],['Water stop','08:25']]) */
function hint(title,pairs,note){S.hints=(S.hints||0)+1;save();const o=document.createElement('div');o.id='peekbox';o.innerHTML=`<div class="pkb"><h2>${esc(title)}</h2><div class="pkt">${pairs.map(([l,v])=>`<span>${esc(l)}<b>${esc(v)}</b></span>`).join('')}</div><p>${esc(note||'Using this hint is recorded in your report.')}</p><button class="btn pri" data-a="peekx">Close</button></div>`;document.body.appendChild(o)}
/* ===== render ===== */
function stageHTML(){if(S.step<0)return welcome();const k=kindOf(S.step);
 return k==='safety'?safetyHTML():k==='predict'?predHTML():k==='pack'?packHTML():k==='questions'?(S.celeb?doneHTML():questionsHTML()):labOf(S.step).html(S)}
function hydrate(root){(root||document).querySelectorAll('img[data-i]').forEach(i=>{if(!i.getAttribute('src'))i.src=IMG[i.dataset.i]||''})}
function devSel(){const sel=$('#dsel');if(sel&&!sel.options.length)STEPS.forEach((n,i)=>sel.add(new Option((i+1)+' '+n,i)))}
function render(){const st=S.step,q=kindOf(st)==='questions';
 $('#steps').innerHTML=st<0?'':STEPS.map((n,i)=>`<div class="chip ${i<st?'done':''} ${i===st?'cur':''}" ${i<=S.max&&i!==st?`data-a="goto" data-i="${i}" role="button" tabindex="0"`:''}><i>${i+1}</i>${n}</div>`).join('');
 const sg=$('#stage');sg.className=st<0?'full':'';sg.innerHTML=(st<0?'':todoHTML())+stageHTML();hydrate(sg);
 $('#bBack').hidden=st<=0;$('#bNext').hidden=st<0||(q&&(S.w.pg>=PAGES.length-1||S.celeb))||(st===LAST&&!q);$('#bar').hidden=st<0;
 const dv=$('#dev');dv.hidden=!(S.dev&&st>=0);if(!dv.hidden)devSel();
 const mg=$('#msg');if(!mg.textContent.trim())mg.textContent=coach();nudge();checkProgress();
 const L=labOf(st);if(L&&L.after)L.after(S)}
function persist(){save();render()}
function canNext(){const u=reqs().find(x=>!x.d);if(u){bad('Not yet: '+u.l+'.');return false}return true}
function goStep(n){S.step=n;if(n>S.max)S.max=n;HELD=null;setTimeout(()=>track('step'),0);say('');persist()}
setInterval(()=>{const L=labOf(S.step);if(L&&L.tick)L.tick(S)},250);
/* ===== actions ===== */
function pick(id){HELD=HELD===id?null:id;say(HELD?'Now tap where it goes.':'');document.querySelectorAll('[data-drag]').forEach(x=>x.classList.toggle('held',x.dataset.drag===HELD))}
function wear(id){const nx=PPEN[S.ppe.length];if(!PPEN.some(p=>p[0]===id)||S.ppe.includes(id))return;
 if(!nx||nx[0]!==id){bad('Wrong order. Put on the '+nx[1].toLowerCase()+' first.');return}
 S.ppe.push(id);HELD=null;sfx('pop');say(nx[1]+' on.',false,true);persist()}
function doDrop(id,tg,e,el){if(BUSY)return;const k=kindOf(S.step);
 if(k==='safety'){if(tg==='body')wear(id);return}
 if(k==='pack'){packDrop(id,tg);return}
 if(k==='lab'){const L=labOf(S.step);if(L.drop)L.drop(id,tg,S,e,el)}}
function packDrop(id,k){const P=LAB.pack,it=P.items.find(i=>i.id===id);if(!it)return;const b=k.replace('bin:','');
 if(it.bin===b){if(it.after&&!S.pk.done[it.after]){bad(it.afterMsg||'Do the other item first.');return}S.pk.done[id]=1;HELD=null;say(it.t+': right place.',false,true);persist();return}
 const bn=document.querySelector(`[data-drop="${k}"]`);if(bn){bn.classList.add('flashbad');setTimeout(()=>bn.classList.remove('flashbad'),600)}bad(it.hint||'That is not the right place. Try another.')}
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('[data-drag]');if(!el||(e.button&&e.button>0))return;DRG={id:el.dataset.drag,el,x:e.clientX,y:e.clientY,moved:0,ghost:null}});
document.addEventListener('pointermove',e=>{if(!DRG)return;const dx=e.clientX-DRG.x,dy=e.clientY-DRG.y;
 if(!DRG.moved&&Math.hypot(dx,dy)>8){DRG.moved=1;const g=document.createElement('div');g.className='ghost';const im=DRG.el.querySelector('img');g.innerHTML=im?`<img src="${im.src}" alt="">`:'';document.body.appendChild(g);DRG.ghost=g}
 if(DRG.ghost){DRG.ghost.style.left=e.clientX+'px';DRG.ghost.style.top=e.clientY+'px';document.querySelectorAll('.over').forEach(x=>x.classList.remove('over'));const t=document.elementFromPoint(e.clientX,e.clientY),dz=t&&t.closest('[data-drop]');if(dz)dz.classList.add('over')}});
function endDrag(e,cancel){if(!DRG)return;const d=DRG;DRG=null;
 if(d.moved){NOCLICK=Date.now();d.ghost&&d.ghost.remove();document.querySelectorAll('.over').forEach(x=>x.classList.remove('over'));
  if(cancel)return;const t=document.elementFromPoint(e.clientX,e.clientY),dz=t&&t.closest('[data-drop]');
  if(dz){HELD=d.id;doDrop(d.id,dz.dataset.drop,e,dz)}else say('Drop it on the place it belongs.',true)}}
document.addEventListener('pointerup',e=>endDrag(e,false));
document.addEventListener('pointercancel',e=>endDrag(e,true));
function fillStep(i){const k=kindOf(i),w=S.w;
 if(k==='safety'){S.name=S.name||'Developer';S.ppe=LAB.safety.ppe!==false?['coat','gog','glove']:[];S.pledge=S.pledge.map(()=>1);S.haz.sel=(LAB.safety.hazards||[]).filter(h=>h.h).map(h=>h.id);S.haz.ok=1;S.haz.chk=1}
 else if(k==='predict'){if(LAB.predict.options)S.pred.pick=S.pred.pick||LAB.predict.options[0].id;S.pred.text=S.pred.text||'I predict that the result will show a clear pattern because of the science idea in this lab.'}
 else if(k==='pack'){LAB.pack.items.forEach(x=>S.pk.done[x.id]=1);S.ppe=[];S.pk.wash=1}
 else if(k==='questions'){w.b=SK.map(()=>1);w.a=SK.map(()=>2);ALLQ.forEach(q=>w.ans[q.k]=w.ans[q.k]||'I observed a clear pattern in my result. This suggests the idea is correct because the evidence matches it.');w.idea='explaining with evidence';w.ev=ALLQ[0]?ALLQ[0].n:'';PAGES.forEach(p=>p.fill&&p.fill(S));w.pg=PAGES.length-1}
 else if(k==='lab'){const L=labOf(i);if(L.fill)L.fill(S)}}
document.addEventListener('click',e=>{
 if(Date.now()-NOCLICK<150){e.stopPropagation();e.preventDefault();return}
 const k=kindOf(S.step),q=k==='questions';
 const dg=e.target.closest('[data-drag]');if(dg){pick(dg.dataset.drag);return}
 const dz=e.target.closest('[data-drop]');if(dz){if(!HELD){say(k==='safety'?'Tap a piece of PPE first. Then tap the student.':'Tap an item first. Then tap the place it goes.');return}doDrop(HELD,dz.dataset.drop,e,dz);return}
 const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,d=el.dataset;
 switch(a){
 case 'start':S=fresh();S.t0=Date.now();S.step=0;say('');persist();track('step');return;
 case 'cont':{const o=load();if(o)S=o;say('');render();return}
 case 'back':if(q&&S.w.pg>0&&!S.celeb){S.w.pg--;say('');sfx('tap');persist();return}if(S.step>0)goStep(S.step-1);return;
 case 'next':if(q){if(canNext()){S.w.pg=Math.min(PAGES.length-1,S.w.pg+1);say('');sfx('good');persist()}return}if(canNext())goStep(S.step+1);return;
 case 'gonext':if(canNext())goStep(S.step+1);return;
 case 'goto':goStep(+d.i);return;
 case 'mute':setMute(!MUTE);if(!MUTE)sfx('pop');return;
 case 'pl':S.pledge[+d.i]=S.pledge[+d.i]?0:1;say('');persist();return;
 case 'hz':{const i=S.haz.sel.indexOf(d.id);if(i<0)S.haz.sel.push(d.id);else S.haz.sel.splice(i,1);S.haz.chk=0;S.haz.ok=0;sfx('tap');persist();return}
 case 'hzchk':{S.haz.chk=1;if(hazOK()){S.haz.ok=1;say('All hazards found. Well spotted.',false,true);persist()}else{S.haz.ok=0;persist();bad('Not all correct yet. Read the notes on the cards and try again.')}return}
 case 'ppick':S.pred.pick=d.id;sfx('tap');say('');persist();return;
 case 'unwear':{const last=S.ppe[S.ppe.length-1];if(d.id!==last){bad('Reverse order: take off the '+PPEN.find(p=>p[0]===last)[1].toLowerCase()+' first.');return}S.ppe.pop();sfx('pop');say('');persist();return}
 case 'wash':{const ppe=LAB.safety.ppe!==false;if(!LAB.pack.items.every(i=>S.pk.done[i.id])){bad('Sort the lab items first.');return}if(ppe&&S.ppe.length){bad('Take off your PPE first.');return}if(S.pk.wash||WASH)return;
  let n=LAB.pack.wash||10;const b=$('#washB');b.textContent='Washing… '+n;const h=$('#hands');if(h){h.classList.add('washing');const bt=h.querySelector('b');if(bt)bt.textContent='Rub palms, backs of hands and between your fingers.'}sfx('wash');
  WASH=setInterval(()=>{n--;const x=$('#washB');if(x)x.textContent='Washing… '+n;if(n>0)sfx('wash');if(n<=0){clearInterval(WASH);WASH=null;S.pk.wash=1;sfx('good');persist()}},1000);return}
 case 'rate':S.w[d.t][+d.i]=+d.v;sfx('pop');persist();return;
 case 'sup':S.w.sh[d.k]=S.w.sh[d.k]?0:1;sfx('tap');persist();return;
 case 'peekx':{const o=$('#peekbox');if(o)o.remove();render();return}
 case 'copy':copyAns();return;
 case 'print':buildPrint();try{window.print()}catch(x){}return;
 case 'dl':try{const bl=new Blob([ansText()],{type:'text/plain'}),u=URL.createObjectURL(bl),a2=document.createElement('a');a2.href=u;a2.download=LAB.id+'-results.txt';a2.click()}catch(x){}return;
 case 'finish':{const u=reqs().find(x=>!x.d);if(u){bad('Not yet: '+u.l+'.');return}if(!allPages()){bad('Some earlier pages are not finished. Press Back to check them.');return}S.finished=1;S.celeb=1;sfx('done');persist();track('done',{report:reportHTML()});return}
 case 'back2res':S.celeb=0;persist();return;
 case 'dgo':{const t=+$('#dsel').value;for(let i=0;i<t;i++)fillStep(i);S.step=t;if(t>S.max)S.max=t;HELD=null;S.finished=0;S.celeb=0;if(kindOf(t)==='questions')S.w.pg=0;persist();say('Developer: jumped to '+STEPS[t]+'.');$('#dsel').value=t;return}
 case 'dfill':fillStep(S.step);persist();say('Developer: step filled.');return;
 case 'dnext':fillStep(S.step);if(S.step<LAST)goStep(S.step+1);else persist();return;
 case 'dexit':S.dev=0;persist();return}
 if(k==='lab'){const L=labOf(S.step);if(L.action)L.action(a,d,S,e,el)}
 else if(q){const p=PAGES[S.w.pg];if(p&&p.action)p.action(a,d,S,e,el)}});
document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.in;if(!k)return;const v=e.target.value;
 if(k==='name'){S.name=v;if(/^developer$/i.test(v.trim())&&!S.dev){S.dev=1;$('#dev').hidden=false;devSel()}}
 else if(k==='gr'||k==='let'){if(k==='gr')S.gr=v;else S.let=v;S.cls=S.gr+S.let}
 else if(k==='pred')S.pred.text=v;else if(k==='idea'||k==='ev')S.w[k]=v;else if(k.startsWith('ans.'))S.w.ans[k.slice(4)]=v;
 else{const L=labOf(S.step),p=kindOf(S.step)==='questions'?PAGES[S.w.pg]:null;if(L&&L.input)L.input(k,v,S,e.target);else if(p&&p.input)p.input(k,v,S)}
 if(e.target.tagName==='TEXTAREA'){const st=e.target.parentElement.querySelector('.stat');if(st)st.textContent=words(v)+' words (need '+(e.target.dataset.min||NWORDS)+'+)'}
 save();refreshTodo()});
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.in;if(k&&S.step>=0){save();refreshTodo()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=$('#peekbox');if(o)o.remove()}if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.chip[data-a],.mkc,.bn,.hc,.it[data-drag],.it[data-a]')){e.preventDefault();e.target.click()}});
/* ===== answers, print, report ===== */
function qaBlocks(){const w=S.w,hasR=PAGES.some(x=>x.type==='rate');
 return `${hasR?`<p><b>Skills before:</b> ${SK.map((s,i)=>s+' '+w.b[i]).join(' &nbsp; ')}</p>`:''}${PAGES.map(p=>p.type==='auto'&&p.report?p.report(S):p.type==='qs'?p.qs.map(q=>`<h2>${q.n}${q.ext?' (extension)':''}${q.dok?' · DOK '+q.dok:''}</h2><p class="ps">${q.t}</p><div class="ans">${esc(w.ans[q.k])}</div>`).join(''):'').join('')}
 ${PAGES.some(x=>x.type==='exit')?`<p><b>Skills after:</b> ${SK.map((s,i)=>s+' '+w.a[i]).join(' &nbsp; ')}</p><p><b>One idea I improved:</b> ${esc(w.idea)} &nbsp; <b>Evidence in:</b> ${esc(w.ev)}</p>`:''}`}
function buildPrint(noimg){const p=LAB.predict,tc=Math.round((Date.now()-S.t0)/60000);
 const labs=LAB.steps.map(s=>s.kind==='lab'&&LAB.lab[s.id].report?`<h2>${esc(s.n)}</h2>${LAB.lab[s.id].report(S,noimg)}`:'').join('');
 const h=`<h1>${esc(LAB.title)}</h1><p><b>Name:</b> ${esc(S.name)} &nbsp; <b>Class:</b> ${esc(S.cls)} &nbsp; <b>Date:</b> ${new Date().toLocaleDateString()}</p>
 ${p?`<h2>Prediction</h2>${p.options&&S.pred.pick?`<p><b>${esc(p.pickLabel||'Choice')}:</b> ${esc((p.options.find(o=>o.id===S.pred.pick)||{}).t)}</p>`:''}<div class="ans">${esc(S.pred.text)}</div>`:''}
 ${labs}${qaBlocks()}<p class="ps">Time ${tc} min · mistakes ${S.errs} · hints used ${S.hints||0} · ${esc(LAB.id)} v${esc(LAB.version)}</p>`;
 if(!noimg){const pr=$('#prt');pr.innerHTML=h;hydrate(pr)}return h}
function reportHTML(){return buildPrint(1).replace(/<img[^>]*>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'')}
function ansText(){const d=document.createElement('div');d.innerHTML=reportHTML().replace(/<\/(h1|h2|p|div|tr)>/g,'\n').replace(/<\/t[dh]>/g,'  ');return d.textContent.replace(/\n{3,}/g,'\n\n').trim()}
function copyAns(){const t=ansText();const ok=()=>say('Answers copied.',false,true);try{navigator.clipboard.writeText(t).then(ok,()=>{say('Copy did not work here. Select the text and copy it.')})}catch(x){say('Copy did not work here.')}}
/* ===== start ===== */
document.title=LAB.title;{const b=document.querySelector('#hdr .brand span');if(b)b.textContent=LAB.brand||LAB.title}
setMute(MUTE);render();
window.__sim={get S(){return S},set S(v){S=v},render,persist,fillStep,reqs,goStep};
