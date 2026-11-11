// real-tap script for the demo lab's custom step
module.exports={setup:async(pg,tap,look)=>{await tap('[data-drag=jug]');await tap('[data-drop=cup]');await pg.waitForTimeout(500);await look('pouring');await pg.waitForTimeout(900);await tap('[data-drag=cone]');await tap('[data-drop=cup]');await tap('[data-a=showhint]');await look('hint');await tap('[data-a=peekx]')},
 auto:async(pg,p,tap)=>{await pg.selectOption('#lvl','shallow')}};
