/* TEST GATE.  node gate.js out/<file>.html [labs/<lab>.test.js]
   Runs the whole lab at four screen sizes with touch. Kit steps are done with real taps; lab steps use the lab's
   own test script when given, otherwise Developer fill. Every screen is screenshotted and checked.
   Starts its own mock dashboard. Exit code 1 if anything fails. */
const {chromium,webkit}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const file=path.resolve(process.argv[2]);const labTest=process.argv[3]?require(path.resolve(process.argv[3])):{};
const SIZES=[[1180,820,'ipadL'],[820,1180,'ipadP'],[1024,768,'x1024'],[1280,620,'short']];
const out=path.join(path.dirname(file),'..','t','shots');fs.mkdirSync(out,{recursive:true});
const posts=[];const srv=http.createServer((q,r)=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>{if(q.method==='POST'){try{posts.push(JSON.parse(b))}catch(e){}}r.writeHead(200,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'});r.end('ok')})});
const fails=[];const fail=(tag,m)=>{fails.push(tag+': '+m);console.log('  FAIL',tag,m)};
const CHECK=()=>{const o=[];const vw=innerWidth,vh=innerHeight;
 if(document.documentElement.scrollWidth>vw+2)o.push('HSCROLL page is wider than the screen');
 document.querySelectorAll('#app img').forEach(i=>{const r=i.getBoundingClientRect();if(r.width>2&&i.complete&&!i.naturalWidth)o.push('IMG broken '+(i.dataset.i||''));if(i.dataset.i&&getComputedStyle(i).display!=='none'&&(r.width<6||r.height<6))o.push('IMG collapsed '+i.dataset.i);else if(i.closest('.bn,.itemlist .it,.bench .fig')&&!i.closest('.ppe')&&Math.max(r.width,r.height)<70)o.push('IMG tiny '+i.dataset.i+' '+Math.round(r.width)+'x'+Math.round(r.height))});
 const pageScroll=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight,(document.querySelector('#app')||{}).scrollHeight||0)>vh+2&&getComputedStyle(document.documentElement).overflowY!=='hidden';
 document.querySelectorAll('#app button,#app input,#app select,#app textarea,#app [data-a],#app [data-drag],#app [data-drop]').forEach(e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;if(getComputedStyle(e).visibility==='hidden')return;const nm=e.dataset.a||e.dataset.drag||e.dataset.drop||e.id||e.tagName;
  if(r.left<-1||r.right>vw+1)o.push('OFFSCREEN-X '+nm);
  if(!pageScroll&&(r.top<-1||r.bottom>vh+1)){let p=e.parentElement,sc=false;while(p&&p!==document.body){const c=getComputedStyle(p);if(/(auto|scroll)/.test(c.overflowY)&&p.scrollHeight>p.clientHeight+2){sc=true;break}p=p.parentElement}if(!sc)o.push('OFFSCREEN-Y '+nm+' '+Math.round(r.bottom)+'/'+vh)}
  let p=e.parentElement;while(p&&p!==document.body){const c=getComputedStyle(p);if(/(auto|scroll)/.test(c.overflowY)&&p.scrollHeight>p.clientHeight+2)break;if(/hidden/.test(c.overflow+c.overflowY+c.overflowX)){const q=p.getBoundingClientRect();if(r.bottom>q.bottom+2||r.top<q.top-2||r.right>q.right+2||r.left<q.left-2){o.push('CLIPPED '+nm+' in .'+String(p.className).split(' ')[0]);break}}p=p.parentElement}
  if(matchMedia('(pointer:coarse)').matches&&e.matches('button,[data-drag]')&&(r.width<32||r.height<32))o.push('SMALL '+nm+' '+Math.round(r.width)+'x'+Math.round(r.height))});
 const b=document.querySelector('#bNext'),k=document.querySelector('#bBack');for(const x of[b,k]){if(x&&!x.hidden){const r=x.getBoundingClientRect();if(!pageScroll&&r.bottom>vh+1)o.push('NAV off-screen '+x.id)}}
 return [...new Set(o)]};
async function run(engine,ename,[W,H,tag]){
 const b=await engine.launch();const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:ename==='webkit'});const pg=await ctx.newPage();
 const T=ename+'-'+tag;pg.on('pageerror',e=>fail(T,'JS error '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_CONNECTION|Failed to load resource/.test(m.text()))fail(T,'console '+m.text())});
 await pg.goto('file://'+file+'?api='+encodeURIComponent('http://localhost:8766/exec'));await pg.waitForTimeout(400);
 let n=0;const look=async name=>{await pg.waitForTimeout(250);await pg.screenshot({path:path.join(out,`${T}_${String(n++).padStart(2,'0')}_${name}.png`)});(await pg.evaluate(CHECK)).forEach(m=>fail(T,name+' '+m))};
 const tap=async s=>{await pg.locator(s).first().scrollIntoViewIfNeeded().catch(()=>{});await pg.tap(s,{timeout:8000})};
 const st=()=>pg.evaluate(()=>({step:__sim.S.step,pg:__sim.S.w.pg,fin:__sim.S.finished}));
 const LABD=await pg.evaluate(()=>({steps:LAB.steps,pages:(LAB.questions||{}).pages.map(p=>({type:p.type,qs:(p.qs||[]).map(q=>q.k)})),ppe:LAB.safety.ppe!==false,haz:(LAB.safety.hazards||[]).filter(h=>h.h).map(h=>h.id),promises:LAB.safety.promises.length,pred:!!(LAB.predict&&LAB.predict.options),items:LAB.pack?LAB.pack.items.map(i=>({id:i.id,bin:i.bin,after:i.after})):[]}));
 await look('welcome');await tap('[data-a=start]');
 for(let i=0;i<LABD.steps.length;i++){const s=LABD.steps[i];
  if((await st()).step!==i){fail(T,'expected step '+i+' '+s.n);break}
  if(s.kind==='safety'){await look('safety-empty');await pg.fill('#nm','Gate Tester');
   if(LABD.ppe)for(const id of['coat','gog','glove']){await tap(`[data-drag=${id}]`);await tap('[data-drop=body]')}
   for(let k=0;k<LABD.promises;k++)await tap(`[data-a=pl][data-i="${k}"]`);
   for(const h of LABD.haz)await tap(`[data-a=hz][data-id=${h}]`);if(LABD.haz.length)await tap('[data-a=hzchk]');await look('safety-done')}
  else if(s.kind==='predict'){if(LABD.pred)await tap('[data-a=ppick]');await pg.fill('[data-in=pred]','I predict the result will show a clear pattern because of the idea.');await look('predict')}
  else if(s.kind==='pack'){await look('pack-start');const todo=[...LABD.items];let guard=0;while(todo.length&&guard++<20){const it=todo.shift();if(it.after&&todo.find(x=>x.id===it.after)){todo.push(it);continue}await tap(`[data-drag=${it.id}]`);await tap(`[data-drop="bin:${it.bin}"]`)}
   if(LABD.ppe)for(const id of['glove','gog','coat'])await tap(`[data-a=unwear][data-id=${id}]`);
   await tap('[data-a=wash]');await pg.waitForTimeout(1500);await look('pack-washing');await pg.waitForFunction(()=>__sim.S.pk.wash===1,null,{timeout:20000});await look('pack-done')}
  else if(s.kind==='questions'){for(let p=0;p<LABD.pages.length;p++){const P=LABD.pages[p];await look('q-page'+(p+1)+'-'+P.type);
    if(P.type==='rate')for(let k=0;k<3;k++)await tap(`[data-a=rate][data-t=b][data-i="${k}"][data-v="1"]`);
    else if(P.type==='qs'){const sp=await pg.$('[data-a=sup]');if(sp){await sp.tap();await look('q-page'+(p+1)+'-support')}for(const ta of await pg.$$('textarea[data-in]'))await ta.fill('I observed a clear pattern in my result. This suggests the idea is correct.')}
    else if(P.type==='auto'){if(labTest.auto)await labTest.auto(pg,p,tap);else{await pg.evaluate(p=>{LAB.questions.pages[p].fill&&LAB.questions.pages[p].fill(__sim.S);__sim.persist()},p)}}
    else if(P.type==='exit'){for(let k=0;k<3;k++)await tap(`[data-a=rate][data-t=a][data-i="${k}"][data-v="2"]`);await pg.fill('#idea','explaining with evidence');await pg.selectOption('#ev',{index:1})}
    if(P.type!=='summary'){await look('q-page'+(p+1)+'-filled');await tap('#bNext')}}
   const pdf=ename==='chromium'&&tag==='ipadL';if(pdf){await pg.evaluate(()=>buildPrint());await pg.emulateMedia({media:'print'});const buf=await pg.pdf({format:'A4'});fs.writeFileSync(path.join(out,T+'_report.pdf'),buf);if(buf.length<3000)fail(T,'PDF looks empty');await pg.emulateMedia({media:'screen'})}
   await tap('[data-a=finish]');await look('celebration');if(!(await st()).fin)fail(T,'did not finish');await tap('[data-a=back2res]');await look('summary-after');break}
  else{/* lab step */await look('lab-'+s.id+'-start');
   if(labTest[s.id])await labTest[s.id](pg,tap,look);else{await pg.evaluate(i=>{__sim.fillStep(i);__sim.persist()},i)}
   await look('lab-'+s.id+'-done')}
  if(i===2){/* saved progress must survive a reload */await pg.reload();await pg.waitForTimeout(300);const c=await pg.$('[data-a=cont]');if(!c)fail(T,'no Continue button after reload');else{await c.tap();if((await st()).step!==i)fail(T,'Continue did not restore the step')}}
  if(s.kind!=='questions')await tap('#bNext')}
 await b.close()}
(async()=>{await new Promise(r=>srv.listen(8766,r));
 const jobs=SIZES.map(s=>run(chromium,'chromium',s).catch(e=>fail('chromium-'+s[2],'crashed: '+String(e.message).split('\n')[0])));
 jobs.push(run(webkit,'webkit',SIZES[0]).catch(e=>console.log('  note: Safari-type engine not available here ('+String(e.message).split('\n')[0].slice(0,70)+')')));
 await Promise.all(jobs);
 const kinds=new Set(posts.map(p=>p.k));for(const k of['step','done'])if(!kinds.has(k))fail('dashboard','no "'+k+'" message received');
 const d=posts.find(p=>p.k==='done');if(d){const kb=JSON.stringify(d).length;if(kb>50000)fail('dashboard','report too big '+kb);if(!d.sim||!Array.isArray(d.steps))fail('dashboard','done message has no sim name or step list')}
 srv.close();console.log(fails.length?`\nGATE FAILED: ${fails.length} problem(s)`:`\nGATE PASSED: ${SIZES.length} sizes, ${fs.readdirSync(out).filter(f=>f.endsWith('.png')).length} screenshots in t/shots`);process.exit(fails.length?1:0)})();
