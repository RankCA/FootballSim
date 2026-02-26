// ════════════════════════════════════════════════════════════
//  ProPath v4 — engine.js
// ════════════════════════════════════════════════════════════

const E = {
  rand:(a,b)=>Math.floor(Math.random()*(b-a+1))+a,
  pick:arr=>arr[Math.floor(Math.random()*arr.length)],
  clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
  chance:p=>Math.random()<p,

  calcOVR(attrs,pos){
    const w=POS_WEIGHTS[pos]||POS_WEIGHTS.CM;
    let s=0,ws=0;
    Object.keys(w).forEach(k=>{s+=(attrs[k]||50)*w[k];ws+=w[k];});
    return E.clamp(Math.round(s/ws),30,99);
  },

  buildAttrs(pos,age,traitIdx){
    const base=POS_BASE[pos]||POS_BASE.CM;
    const trait=TRAITS[traitIdx];
    const dev=Math.max(0,age-15);
    const ageFactor=dev<=8?dev*1.4:8*1.4+(dev-8)*0.8;
    const attrs={};
    ['pace','shooting','passing','dribbling','defending','physical'].forEach(k=>{
      let v=base[k]+Math.round(ageFactor*.7)+E.rand(-3,3);
      if(trait?.boosts?.[k]) v+=trait.boosts[k];
      attrs[k]=E.clamp(v,28,99);
    });
    return attrs;
  },

  calcPotential(ovr,age){
    const bonus=Math.max(0,27-age)*1.8+E.rand(3,10);
    return E.clamp(Math.round(ovr+bonus),ovr+2,99);
  },

  trainCost(cur){
    if(cur<40)return 400; if(cur<50)return 1200; if(cur<55)return 2800;
    if(cur<60)return 5500; if(cur<65)return 10000; if(cur<70)return 18000;
    if(cur<75)return 35000; if(cur<80)return 70000; if(cur<85)return 140000;
    if(cur<90)return 280000; if(cur<95)return 500000; return 900000;
  },

  // FIX: Use real month lengths starting Jul(31) Aug(31) Sep(30) Oct(31) Nov(30) Dec(31) Jan(31) Feb(28) Mar(31) Apr(30) May(31) Jun(30)
  _ML:[31,31,30,31,30,31,31,28,31,30,31,30],
  getDayLabel(day){
    day=Math.max(0,Math.floor(day))%366;
    let m=0,rem=day;
    while(m<11&&rem>=E._ML[m]){rem-=E._ML[m];m++;}
    return `${MONTHS[m]} ${rem+1}`;
  },
  getSeasonPhase(day){
    day=Math.max(0,Math.floor(day))%366;
    let m=0,rem=day;
    while(m<11&&rem>=E._ML[m]){rem-=E._ML[m];m++;}
    if(m===0||m>=10)return 'off-season';
    return 'season';
  },

  generateLeague(tier,myClubName){
    const size=LEAGUES.find(l=>l.tier===tier)?.size||14;
    const pool=[...(CLUBS[tier]||CLUBS[3])].filter(c=>c!==myClubName);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    const aiClubs=pool.slice(0,size-1);
    // FIX: Use tier-appropriate OVR ranges so Prem clubs are 76-90 not 54-82
    const ranges={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]};
    const [lo,hi]=ranges[tier]||[54,82];
    const teams=[{name:myClubName,isPlayer:true,ovr:E.rand(lo,hi),pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]}];
    for(const name of aiClubs)teams.push({name,isPlayer:false,ovr:E.rand(lo,hi),pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]});
    return teams;
  },

  simulateAIMatch(home,away){
    const diff=(home.ovr-away.ovr)/10;
    const hg=Math.random()<0.55+diff*.12?E.rand(0,3):E.rand(0,2);
    const ag=Math.random()<0.45-diff*.12?E.rand(0,3):E.rand(0,2);
    return{hg,ag};
  },

  selectPlayer(playerOVR,teamAvgOVR){
    const diff=playerOVR-teamAvgOVR;
    if(diff>=3)return 'start';
    if(diff>=-2)return Math.random()<.7?'start':'bench';
    if(diff>=-6)return Math.random()<.35?'bench':'out';
    return 'out';
  },

  scheduleLeague(tier,totalDays){
    const league=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
    const size=league.size;
    const numMatches=(size-1)*2;
    const start=35,end=275;
    const spread=Math.floor((end-start)/numMatches);
    const days=[];
    for(let i=0;i<numMatches;i++)days.push(start+i*spread+E.rand(0,Math.max(1,spread-2)));
    days.sort((a,b)=>a-b);
    return days;
  },

  scheduleCups(tier){
    const cups={};
    CUPS.forEach(cup=>{
      if(tier>cup.minTier)return;
      const baseDays={fa_cup:[128,156,184,220,258,285],league_cup:[95,116,145,185,240,268],euro_cup:[62,90,118,160,200,248]};
      const days=(baseDays[cup.id]||[]).map(d=>d+E.rand(-2,2));
      cups[cup.id]={...cup,stage:0,eliminated:false,winner:false,matchDays:days};
    });
    return cups;
  },

  managerOpinion(playerOVR,teamAvgOVR){
    const diff=playerOVR-teamAvgOVR;
    if(diff>=8)return{opinion:'favourable',text:'The manager considers you one of the best players at the club.'};
    if(diff>=3)return{opinion:'good',text:'The manager rates you highly and trusts you in big moments.'};
    if(diff>=-2)return{opinion:'neutral',text:"You're in the manager's thoughts, but nothing is guaranteed."};
    if(diff>=-6)return{opinion:'sceptical',text:"The manager is not fully convinced yet — you're on the fringes."};
    return{opinion:'poor',text:"The manager doesn't see you as part of the long-term plan."};
  },
};
