/* node palshots.js <lab>  -> t/pal/<palette>_<n>.png  three real screens per palette */
const {chromium}=require('playwright');const fs=require('fs');const lab=process.argv[2];
const pals=['violet','navy','forest','plum','volcano','arctic','daylight'];
(async()=>{fs.mkdirSync('t/pal',{recursive:true});const b=await chromium.launch();
 for(const p of pals){const pg=await b.newPage({viewport:{width:1180,height:820}});await pg.goto('file://'+process.cwd()+`/out/${lab}-${p}.html`);
  await pg.evaluate(()=>{const S=__sim.S;S.name='Sara';S.step=0;S.ppe=['coat','gog'];S.pledge[0]=1;S.haz.sel=[LAB.safety.hazards[0].id];__sim.persist()});await pg.waitForTimeout(300);await pg.screenshot({path:`t/pal/${p}_0.png`});
  await pg.evaluate(()=>{const i=LAB.steps.findIndex(s=>s.kind==='lab');__sim.S.step=i;__sim.S.max=9;__sim.persist()});await pg.waitForTimeout(300);await pg.screenshot({path:`t/pal/${p}_1.png`});
  await pg.evaluate(()=>{const i=LAB.steps.findIndex(s=>s.kind==='questions');const S=__sim.S;S.step=i;S.w.pg=LAB.questions.pages.findIndex(x=>x.type==='qs');S.w.ans[LAB.questions.pages[S.w.pg].qs[0].k]='I observed a clear pattern in my result.';__sim.persist()});await pg.waitForTimeout(300);await pg.screenshot({path:`t/pal/${p}_2.png`});
  await pg.evaluate(()=>{const S=__sim.S;S.w.pg=0;S.w.b=[1,2,-1];__sim.persist()});await pg.waitForTimeout(300);await pg.screenshot({path:`t/pal/${p}_3.png`});await pg.close()}
 await b.close()})();
