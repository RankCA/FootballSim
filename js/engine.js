// ════════════════════════════════════════════════════════════
//  ProPath v4 — engine.js
// ════════════════════════════════════════════════════════════

// ── Cup bracket round builder (used by scheduleCups) ─────────────
// Pairs participants, simulates all AI matches, marks player match as TBD.
function _buildCupRound(participants, playerClubName, roundName){
  const roundMatches=[];
  const pool=[...participants];
  const pi=pool.indexOf(playerClubName);
  if(pi>0){[pool[0],pool[pi]]=[pool[pi],pool[0]];}
  for(let i=0;i<pool.length-1;i+=2){
    const h=pool[i],a=pool[i+1];
    if(h===playerClubName||a===playerClubName){
      const home=playerClubName;
      const away=(h===playerClubName)?a:h;
      roundMatches.push({home,away,homeScore:null,awayScore:null,winner:null,isPlayer:true});
    } else {
      let hg=Math.random()<0.55?Math.floor(Math.random()*4):Math.floor(Math.random()*2);
      let ag=Math.random()<0.45?Math.floor(Math.random()*4):Math.floor(Math.random()*2);
      let w;
      if(hg>ag)w=h; else if(ag>hg)w=a;
      else{w=Math.random()<0.5?h:a; if(w===h)hg++;else ag++;}
      roundMatches.push({home:h,away:a,homeScore:hg,awayScore:ag,winner:w,isPlayer:false});
    }
  }
  if(pool.length%2!==0){
    const byeTeam=pool[pool.length-1];
    roundMatches.push({home:byeTeam,away:'BYE',homeScore:1,awayScore:0,winner:byeTeam,isPlayer:false});
  }
  return{roundName,matches:roundMatches};
}

const E = {
  rand:(a,b)=>Math.floor(Math.random()*(b-a+1))+a,
  pick:arr=>arr[Math.floor(Math.random()*arr.length)],
  clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
  chance:p=>Math.random()<p,
  randTierOVR(tier){const r={1:[76,88],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[tier]||[54,74];return E.rand(r[0],r[1]);},

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

  generateAllLeagues(playerClubName, playerTier){
    // Build a simulated standings table for every league tier.
    // The player's own league uses the real G.league data (not this).
    // This is purely for display in the "All Leagues" tab view.
    const result = {};
    LEAGUES.forEach(l=>{
      const tier = l.tier;
      const size = l.size;
      const pool = [...(CLUBS[tier]||CLUBS[3])];
      // Shuffle pool
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      const teams = pool.slice(0,size).map(name=>({
        name, isPlayer:false,
        ovr:E.randTierOVR(tier),
        pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]
      }));
      // Simulate ~half a season of fixtures so tables aren't empty from the start
      const fixtures = Math.floor(size * 4);
      for(let i=0;i<fixtures;i++){
        const a=teams[Math.floor(Math.random()*teams.length)];
        let b=teams[Math.floor(Math.random()*teams.length)];
        if(b===a) b=teams[(teams.indexOf(a)+1)%teams.length];
        const res=E.simulateAIMatch(a,b);
        const applyR=(t,sc,co)=>{
          t.played++;t.gf+=sc;t.ga+=co;t.gd=t.gf-t.ga;
          if(sc>co){t.won++;t.pts+=3;t.form.push('W');}
          else if(sc===co){t.drawn++;t.pts+=1;t.form.push('D');}
          else{t.lost++;t.form.push('L');}
          if(t.form.length>5)t.form.shift();
        };
        applyR(a,res.hg,res.ag);applyR(b,res.ag,res.hg);
      }
      result[tier]={name:l.name,tier,teams};
    });
    return result;
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
    // Each team plays every other team home and away = (size-1)*2 matchdays per team
    // Prem (20 teams) = 38 games. Spread evenly from day 35 (Aug 8) to day 310 (May 17)
    const league=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
    const size=league.size;
    const numMatchdays=(size-1)*2; // 38 for Prem, 26 for L1/L2, etc.
    const start=35, end=310;       // Aug–May
    const slotSize=(end-start)/numMatchdays;
    const days=[];
    for(let i=0;i<numMatchdays;i++){
      // Each matchday slot gets a small random jitter to avoid all games on same day
      const slotStart=Math.floor(start+i*slotSize);
      const slotEnd=Math.floor(start+(i+1)*slotSize)-1;
      days.push(E.rand(slotStart,Math.min(slotEnd,end-1)));
    }
    days.sort((a,b)=>a-b);
    return days;
  },

  scheduleCups(tier, playerClubName, prevLeaguePos){
    const cups={};
    CUPS.forEach(cup=>{
      if(tier>cup.minTier)return;
      if(cup.euroQualify){
        const qualified=(tier===1&&(prevLeaguePos||99)<=4);
        if(!qualified)return;
      }
      const rounds=cup.rounds||[];
      // Spread cup rounds across the season (between league slots) with big enough gaps
      // Cup offset ensures different cups don't clash on the same day
      const seasonStart=50, seasonEnd=305;
      const spread=Math.floor((seasonEnd-seasonStart)/Math.max(rounds.length,1));
      const cupOffset={fa_cup:0,league_cup:18,euro_cup:9}[cup.id]||0;
      const days=rounds.map((_,i)=>{
        const base=seasonStart+cupOffset+i*spread;
        return E.clamp(base+E.rand(-4,4), seasonStart, seasonEnd);
      });

      // ── Generate draw with correct power-of-2 participant count ───────────
      let participantPool=[];
      if(cup.id==='euro_cup'){
        const premTop=[...(CLUBS[1]||[])].slice(0,10);
        const laLiga=(typeof FOREIGN_LEAGUES!=='undefined'?FOREIGN_LEAGUES:[]).find(l=>l.id==='LL1')?.clubs?.slice(0,8)||[];
        const serieA=(typeof FOREIGN_LEAGUES!=='undefined'?FOREIGN_LEAGUES:[]).find(l=>l.id==='SA1')?.clubs?.slice(0,8)||[];
        participantPool=[...premTop,...laLiga,...serieA];
      } else if(cup.id==='league_cup'){
        participantPool=[...(CLUBS[1]||[]),...(CLUBS[2]||[]).slice(0,10),...(CLUBS[3]||[]).slice(0,6)];
      } else {
        participantPool=[...(CLUBS[1]||[]),...(CLUBS[2]||[]),...(CLUBS[3]||[]),...(CLUBS[4]||[]).slice(0,8)];
      }
      // Remove player's club so we insert fresh, shuffle rest
      participantPool=participantPool.filter(c=>c!==playerClubName);
      for(let i=participantPool.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [participantPool[i],participantPool[j]]=[participantPool[j],participantPool[i]];
      }
      // Pick power-of-2 count suitable for the number of rounds
      // rounds.length=6 (FA Cup) → 32 teams, =5 (League Shield/Euro) → 16 teams
      const targetSize=rounds.length>=6?32:16;
      const numOtherTeams=targetSize-1;
      const allParticipants=[playerClubName,...participantPool.slice(0,numOtherTeams)];

      // ── Generate Round 1 of the bracket only ─────────────────────────────
      // Subsequent rounds are generated dynamically in _advanceCupBracket()
      // called from simulateCupMatch() after each round completes.
      const bracketRounds=[];
      const round1=_buildCupRound(allParticipants, playerClubName, rounds[0]||'Round 1');
      bracketRounds.push(round1);

      cups[cup.id]={
        ...cup,
        stage:0,
        eliminated:false,
        winner:false,
        matchDays:days,
        participants:allParticipants,
        bracketRounds,
      };
    });
    return cups;
  },

  // OVR-based wage calculation: salary scales tightly with player quality
  // A 60-OVR player in Prem gets ~£12k/wk; an 85-OVR gets ~£80k/wk
  ovrWage(ovr, tier){
    // Base wage per OVR point (exponential growth between 40-99)
    const t=E.clamp(ovr,40,99);
    // Exponential: base wage roughly doubles every 10 OVR points
    const base=Math.round(250 * Math.pow(1.12, t-40));
    // Tier multiplier: Prem = 1.0x, down to National = 0.12x
    const tierMult={1:1.0, 2:0.55, 3:0.28, 4:0.14, 5:0.07}[tier]||0.28;
    // Slight random variance ±15%
    const variance=0.85 + Math.random()*0.30;
    return Math.round(base * tierMult * variance / 100) * 100; // round to nearest £100
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
