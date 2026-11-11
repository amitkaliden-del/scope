/* DEMO LAB for the sim kit. Shows every kit block plus one custom step. Not for students. */
const LAB={
 id:'kit-demo',key:'kitDemoLabV1',sim:'kit-demo',version:'1.0',title:'Kit Demo Lab',brand:'Kit Demo',
 titleHTML:'Kit <span>Demo</span> Lab',sub:'Virtual practical · Demo · Biology',welcomeImg:'setup_ok',
 mission:'This short lab only proves that the kit works. It is not for students.',
 cut:['flat','cone','mk_black','cup0','cup1','jug'],
 steps:[{n:'Safety',kind:'safety'},{n:'Prediction',kind:'predict'},{n:'Set up',kind:'lab',id:'setup',coach:'Tap an item on the shelf. Then tap where it goes. You can also drag it.'},{n:'Pack away',kind:'pack'},{n:'Results',kind:'questions'}],
 safety:{ppe:true,promises:['I will keep water away from the iPad.','If water spills, I will stop and wipe it up.','I will wash my hands at the end.'],
  remember:['<b>Demo only.</b> These safety lines are placeholders.'],
  hazards:[{id:'spill',t:'Spilled water on the floor',ic:'💧',h:1,w:'Spilled water is a slip hazard.'},{id:'glass',t:'Broken glass',ic:'🧪',h:1,w:'Broken glass can cut. Call the teacher.'},{id:'paper',t:'Filter paper',img:'flat',h:0,w:'Plain filter paper is not a hazard.'}]},
 predict:{title:'Predict before you start',prompt:'Demo question: what do you think will happen when the paper touches the water?',help:'Any sensible sentence will do in this demo.',minWords:6},
 pack:{wash:10,items:[{id:'filter',t:'Used filter cone',img:'cone',bin:'general',hint:'A used filter is solid waste. It goes in the general bin.'},{id:'water',t:'Water in the cup',img:'cup1',bin:'sink',hint:'Pour the water down the sink.'},{id:'cup',t:'Cup',img:'cup0',bin:'wash',after:'water',afterMsg:'Empty the water into the sink first.',hint:'Do not throw the cup away. Wash it in the wash tray.'}],
  bins:{general:{t:'General waste bin',img:'bin_general'},sink:{t:'Sink',img:'sink'},wash:{t:'Wash tray',img:'wash_tray'}}},
 questions:{minWords:6,skills:['Interpret','Link','Evaluate'],peer:'Demo: peer feedback stays on the paper sheet.',
  pages:[{type:'rate'},
   {type:'auto',reqs:S=>[{l:'Choose the water level',d:!!S.L.lvl,a:'<b>Q1</b>: choose the water level you used. Then press <b>Next</b>.'}],
    html:(S,strip)=>`<div class="bench" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div class="pn t5 scroll">${strip}<h2><span class="qn">Q1</span> ${dokB(1)}</h2><p class="qh">You poured water <b>${S.L.water}</b> time(s).</p><label class="lbl" for="lvl">Which water level did you use?</label><select id="lvl" data-in="lvl"><option value="">choose</option>${['shallow','deep'].map(c=>`<option ${S.L.lvl===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="pn t1"><h2>Your set-up</h2><div class="rwrap"><div class="rimg nc">${I('setup_ok','','Cone in the cup')}</div></div></div></div>`,
    input:(k,v,S)=>{if(k==='lvl')S.L.lvl=v},fill:S=>{S.L.lvl='shallow'},report:S=>`<p><b>Q1</b> Water level: ${esc(S.L.lvl)}</p>`},
   {type:'qs',qs:[{k:'a2',n:'Q2',dok:2,t:'Demo: explain what you saw.',h:'Use one observation.',sup:'I observed ___. This happened because ___.'},{k:'a3',n:'Q3',dok:3,t:'Demo: what does your result suggest?',sup:''}],ref:'Demo reference text sits here, beside the questions.'},
   {type:'qs',qs:[{k:'s1',n:'S1',dok:4,ext:1,t:'Demo extension: suggest a further test.'}]},
   {type:'exit'},{type:'summary'}]},
 fresh:()=>({water:0,placed:0,pouring:0,lvl:''}),
 summary:S=>`<p style="margin:0">Water poured: <b>${S.L.water}</b> · Cone placed: <b>${S.L.placed?'yes':'no'}</b></p>`,
 lab:{setup:{
  reqs:S=>[{l:'Pour water into the cup',d:S.L.water>0,a:'Pick up the <b>water jug</b>. Tap the <b>cup</b>.'},{l:'Put the cone in the cup',d:!!S.L.placed,a:'Pick up the <b>cone</b>. Tap the <b>cup</b>.'}],
  html:S=>{const L=S.L,tile=(id,img,t)=>`<div class="it ${HELD===id?'held':''}" data-drag="${id}" role="button" tabindex="0" aria-label="${t}">${I(img,'',t)}<span>${t}</span></div>`;
   return `<div class="bench" style="grid-template-columns:minmax(180px,260px) minmax(0,1fr) minmax(170px,240px)"><div class="pn t2"><h2>Shelf</h2><div class="itemlist" style="grid-template-columns:1fr">${tile('jug','jug','Water jug')}${L.placed?'':tile('cone','cone','Filter cone')}</div></div>
   <div class="pn t1"><h2>Bench</h2><div class="fig ${L.placed?'lt':''}" data-drop="cup" role="button" tabindex="0" style="position:relative">${L.placed?I('setup_ok','dropin','Cone in the cup'):I(L.water?'cup1':'cup0','',L.water?'Cup with water':'Empty cup')}${L.pouring?`<div class="pourfx"><div class="pj">${I('jug','','')}</div><i class="strm"></i></div>`:''}</div></div>
   <div class="pn t3"><h2>Status</h2><p class="qh">Water poured: <b>${L.water}</b><br>Cone: <b>${L.placed?'in the cup':'on the shelf'}</b></p><button class="btn sm" data-a="showhint">👁 Show my count</button></div></div>`},
  drop:(id,tg,S)=>{const L=S.L;if(tg!=='cup'){bad('That goes in the cup.');return}
   if(id==='jug'){if(L.placed){bad('The cone is already in the cup.');return}HELD=null;BUSY=1;L.pouring=1;sfx('pour');say('Pouring…');persist();setTimeout(()=>{L.pouring=0;L.water++;BUSY=0;say('Water in the cup.',false,true);persist()},1150);return}
   if(id==='cone'){if(!L.water){bad('Add water to the cup first.');return}L.placed=1;HELD=null;sfx('splash');say('Cone in the cup.',false,true);persist()}},
  action:(a,d,S)=>{if(a==='showhint')hint('Your count',[['Water poured',String(S.L.water)]])},
  fill:S=>{S.L.water=S.L.water||1;S.L.placed=1},
  report:S=>`<p>Water poured: ${S.L.water} · Cone placed: ${S.L.placed?'yes':'no'}</p>`}}
};
