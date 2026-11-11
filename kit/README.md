# Sim kit (Amit's virtual labs) — kit 1.0

A new lab = one lab file (`labs/<lab>.js`) + one assets file (`labs/<lab>.assets.json`, image key -> data URI).
The kit supplies: welcome page, full safety page (dress the student, promises, spot the hazards), prediction,
pack away + PPE off in reverse + animated hand wash, question pages with Next (ratings, DOK tags, Support,
extension, exit ticket, summary, celebration), NEXT box and step gating, drag AND tap, autosave/Continue,
sounds + mute, sparkles, hint pop-up (counted in the report), developer mode (name "Developer"),
dashboard messages (sim name + step list sent, so one dashboard can serve all labs), report/print/copy.

## Build
    python3 build.py <lab> <palette>        # -> out/<lab>-<palette>.html
Palettes: violet, navy, forest, plum, volcano, arctic, daylight (light). Show Amit real screens of each
(`node palshots.js <lab>`) and let him choose. He does not want the same palette for every lab.

## Test gate (run before he sees anything; every change)
    node gate.js out/<lab>-<palette>.html labs/<lab>.test.js
4 sizes with touch, real taps on kit steps, the lab's own taps on lab steps (else Developer fill), every screen
screenshotted to t/shots, checks: JS errors, off-screen/clipped/small controls, broken/collapsed/tiny images,
page wider than screen, saved progress after reload, PDF export, dashboard step/done messages and report size.
Then `python3 sheet.py ipadL` (and ipadP, x1024, short) and LOOK at every sheet. The gate does not judge looks.
Safari-type engine is not installed in the cloud workspace, so real iPad Safari stays untested.

## Lab file contract (see labs/demo.js)
LAB = { id, key, sim, version, title, titleHTML, brand, sub, mission, welcomeImg, cut:[cut-out image keys],
  steps:[{n:'Safety',kind:'safety'},{n:'Prediction',kind:'predict'},{n:'<any name>',kind:'lab',id:'x',coach:'...'},
         {n:'Pack away',kind:'pack'},{n:'Results',kind:'questions'}],     // each lab names its own steps
  safety:{ppe:true, promises:[], remember:[], hazards:[{id,t,img|ic,h:1|0,w}]},
  predict:{title,prompt,help,minWords, options?:[{id,t,img}], pickTitle,pickLabel,pickHelp},
  pack:{wash:10, items:[{id,t,img,bin,hint,after?,afterMsg?}], bins:{key:{t,img}}},
  questions:{minWords, skills:[3 names], peer:'text', pages:[{type:'rate'},{type:'auto',html,reqs,input,fill,report},
             {type:'qs',qs:[{k,n,dok,t,h,sup,ext}],ref:'text'},{type:'exit'},{type:'summary'}]},
  fresh:()=>({...lab state, lives in S.L}), migrate(o), summary(S), sfx:{name(){...}},
  lab:{ x:{ html(S), reqs(S), drop(id,target,S), action(a,dataset,S), input(key,value,S), tick(S), after(S), fill(S), report(S) } } }
Helpers a lab may call: I(img,cls,alt), esc, say/bad, sfx, burst, persist, hint(title,[[label,value]]), HELD, BUSY, dokB, words.

## Not in the kit yet (port when a lab needs them)
Microscope view (osmosis), ruler + Rf calculator (spinach), animated bottle pours / water + ice bath / bubble counter /
graph (yeast), colour-bloom result and big labelling screen (marker). The marker lab itself is NOT rebuilt on the kit.
