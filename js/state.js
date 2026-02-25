// ════════════════════════════════════════════════════════════
//  ProPath v3 — state.js
//  Game state, day simulation, season logic, event handlers
// ════════════════════════════════════════════════════════════

let G={};  // global game state

// ── Init ──────────────────────────────────────────────────────
function initGame(draft){
  const attrs=E.buildAttrs(draft.position,draft.age,draft.trait);
  const ovr=E.calcOVR(attrs,draft.position);
  const pot=E.calcPotential(ovr,draft.age);
  const startClub=assignStartClub(draft.age,ovr);
  const league=LEAGUES.find(l=>l.tier===startClub.tier)||LEAGUES[0];
  const year=new Date().getFullYear();
  const managerName=E.pick(MANAGER_NAMES);

  G={
    player:{
      firstName:draft.firstName,lastName:draft.lastName,nickname:draft.nickname||'',
      age:draft.age,nation:draft.nation,position:draft.position,foot:draft.foot,trait:draft.trait,
      attrs,overall:ovr,potential:pot,
    },
    club:{name:startClub.clubName,tier:startClub.tier,leagueId:league.id,contractYears:3,isFreeAgent:false},
    manager:{name:managerName,favouriteOf:false,teamAvgOVR:E.rand(58,74)},
    wallet:startClub.salary*6,
    weeklySalary:startClub.salary,
    passiveIncome:0,
    investments:[],
    season:{number:1,startYear:year,dayOfSeason:0,totalDays:365,finished:false},
    seasonStats:{goals:0,assists:0,apps:0,motm:0,yellows:0,reds:0,wins:0,draws:0,losses:0,ratingSum:0,ratingCount:0,avgRating:0,cleanSheets:0},
    careerStats:{goals:0,assists:0,apps:0,motm:0,seasons:0,trophies:0,reds:0,bestOVR:ovr,highestLeague:startClub.tier},
    achievements:new Set(),
    careerLog:[],
    dayLog:[],
    matchHistory:[],
    pendingTransferOffers:[],  // {id, fromClub, tier, salary, contractYears, expires}
    league:{
      name:league.name,tier:startClub.tier,
      teams:E.generateLeague(startClub.tier,startClub.clubName),
      matchdays:E.scheduleLeague(startClub.tier,365),
      nextMatchIdx:0,
    },
    cups:E.scheduleCups(startClub.tier),
    form:[],
    injuryDaysLeft:0,
    forcedStarter:0,   // days of guaranteed start (from teammate injury event)
    agentUpgraded:false,
    triggeredEvents:new Set(),
    pendingEvent:null,   // event waiting to be shown as blocker
    loanActive:false,
    loanDaysLeft:0,
  };

  G.careerLog.push({icon:'⚽',title:'Career Begins',detail:`${draft.firstName} ${draft.lastName} signs for ${startClub.clubName}`,date:'Pre-Season'});
}

function assignStartClub(age,ovr){
  let tier=5;
  if(ovr>=72)tier=1; else if(ovr>=68)tier=2; else if(ovr>=64)tier=3; else if(ovr>=60)tier=4;
  if(age<=17)tier=Math.max(tier,5);
  const league=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
  return{...league,clubName:E.pick(CLUBS[tier])};
}

// ── Day Simulation ────────────────────────────────────────────
function simulateDay(){
  const day=G.season.dayOfSeason;
  const phase=E.getSeasonPhase(day);
  const events=[];

  // Injury recovery
  if(G.injuryDaysLeft>0){
    G.injuryDaysLeft--;
    events.push({type:'injury',icon:'🤕',title:'Recovery Day',detail:`Physio work and pool sessions. ${G.injuryDaysLeft} day${G.injuryDaysLeft!==1?'s':''} remaining.`});
    return{events,blockingEvent:null};
  }

  // Weekly wages + passive income (every 7 days)
  if(day>0 && day%7===0 && !G.club.isFreeAgent){
    G.wallet+=G.weeklySalary;
    let incomeDetail=`+£${G.weeklySalary.toLocaleString()} wages received.`;
    if(G.passiveIncome>0){
      G.wallet+=G.passiveIncome;
      incomeDetail+=` +£${G.passiveIncome.toLocaleString()} investment returns.`;
    }
    events.push({type:'salary',icon:'💰',title:'Weekly Payment',detail:incomeDetail});
  }

  // Transfer offer expiry check
  G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>{
    if(o.expires<=day){
      G.careerLog.push({icon:'⌛',title:'Transfer Offer Expired',detail:`${o.fromClub}'s offer lapsed`,date:E.getDayLabel(day)});
      return false;
    }
    return true;
  });

  // Check for random blocking event
  const blockingEvent=checkRandomEvent(day);
  if(blockingEvent) return{events,blockingEvent};

  // Match or training
  const isLeagueDay=G.league.matchdays.includes(day) && !G.club.isFreeAgent;
  const cupsToday=Object.entries(G.cups||{}).filter(([id,c])=>!c.eliminated&&c.matchDays?.includes(day));

  if(isLeagueDay){
    events.push(...simulateLeagueMatch(day));
  } else if(cupsToday.length>0){
    cupsToday.forEach(([id,cup])=>events.push(...simulateCupMatch(id,cup,day)));
  } else if(phase==='season'){
    if(E.chance(0.06)) events.push({type:'training',icon:'🎽',title:'Reserve Match',detail:'Extra minutes in the reserve fixture — staying sharp.'});
    else events.push({type:'training',...E.pick(TRAINING_EVENTS)});
    if(E.chance(0.035)) {const g=simulateGrowth();if(g)events.push(g);}
  } else {
    events.push({type:'training',...E.pick(OFFSEASON_EVENTS)});
    if(E.chance(0.025)){const g=simulateGrowth();if(g)events.push(g);}
  }

  // Random match injury
  if(events.some(e=>e.type==='match') && E.chance(0.045) && G.injuryDaysLeft===0){
    const days=E.rand(4,18);
    G.injuryDaysLeft=days;
    const types=['Hamstring tweak','Ankle knock','Muscle strain','Bruised ribs','Hip flexor issue'];
    events.push({type:'injury',icon:'🤕',title:`Injury — ${days} days out`,detail:E.pick(types)});
    G.careerLog.push({icon:'🤕',title:'Injury',detail:`${E.pick(types)} — ${days} days recovery`,date:E.getDayLabel(day)});
  }

  checkMilestones(events,day);
  return{events,blockingEvent:null};
}

// ── Match Simulation ──────────────────────────────────────────
function simulateLeagueMatch(day){
  const mi=G.league.nextMatchIdx||0;
  G.league.nextMatchIdx=mi+1;
  const opponents=G.league.teams.filter(t=>!t.isPlayer);
  const opp=opponents[mi%(opponents.length)];
  const teamAvg=G.manager.teamAvgOVR;

  const selection=G.forcedStarter>0?'start':E.selectPlayer(G.player.overall,teamAvg);
  if(G.forcedStarter>0)G.forcedStarter--;

  if(selection==='out'){
    const res=E.simulateAIMatch({ovr:teamAvg},{ovr:opp.ovr});
    updateLeagueTable(G.club.name,opp.name,res.hg,res.ag,true);
    return[{type:'match',icon:'🪑',title:`Not Selected — ${G.club.name} vs ${opp.name}`,
      detail:`Left out of the squad. ${G.club.name} ${res.hg>res.ag?'won':'drew or lost'} ${res.hg}-${res.ag}.`,selection:'out'}];
  }

  return[runMatchSim(G.club.name,opp.name,opp.ovr,teamAvg,selection,false,day)];
}

function simulateCupMatch(cupId,cup,day){
  const cupDef=CUPS.find(c=>c.id===cupId)||{name:'Cup',icon:'🏆',rounds:['Final']};
  const stageLabel=cupDef.rounds?.[cup.stage]||'Final';
  const oppTier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
  const oppOVR=E.rand(58,80);
  const oppName=E.pick(CLUBS[oppTier]||CLUBS[3]);
  const selection=E.selectPlayer(G.player.overall,G.manager.teamAvgOVR);
  const events=[];

  const res=runMatchSim(`${G.club.name}`,oppName,oppOVR,G.manager.teamAvgOVR,selection,true,day);
  res.title=`${cupDef.icon} ${cupDef.name} (${stageLabel}): ${res.title}`;
  events.push(res);

  const win=res.result==='W';
  if(win){
    cup.stage++;
    if(cup.stage>=cupDef.rounds.length){
      cup.winner=true;cup.eliminated=true;
      G.careerStats.trophies++;
      G.careerLog.push({icon:'🏆',title:`${cupDef.name} Winner!`,detail:'Lifted the trophy!',date:E.getDayLabel(day)});
      events.push({type:'milestone',icon:'🏆',title:`🎉 ${cupDef.name} Won!`,detail:'The dressing room erupts!'});
      showToast(`🏆 ${cupDef.name} Winner!`,'');
    }
  } else {
    cup.eliminated=true;
  }
  G.cups[cupId]=cup;
  return events;
}

function runMatchSim(homeName,awayName,oppOVR,teamOVR,selection,isCup,day){
  const isAtt=['ST','CF','LW','RW','CAM'].includes(G.player.position);
  const isMid=['CM','CDM'].includes(G.player.position);
  const isHome=homeName===G.club.name||homeName===G.club.name+' (Cup)';

  const skillDiff=(teamOVR-oppOVR)/100;
  const homeBonus=isHome?0.08:0;
  const hg=E.chance(0.55+skillDiff+homeBonus)?E.rand(0,3):E.rand(0,1);
  const ag=E.chance(0.5-skillDiff)?E.rand(0,3):E.rand(0,1);

  let myGoals=0,myAssists=0,myRating=E.rand(56,80);
  const isStart=selection==='start';
  const isSub=selection==='bench';

  if(isStart||isSub){
    if(isAtt&&hg>0){ myGoals=Math.min(E.rand(0,2),hg); if(hg>myGoals&&E.chance(.35))myAssists=1; }
    else if(isMid&&hg>0){ if(E.chance(.38))myAssists=1; if(E.chance(.14))myGoals=1; }
    if(isSub){myGoals=Math.min(myGoals,1);myRating=E.clamp(myRating-6,48,82);}
  }

  const motm=isStart&&E.chance(.17);
  const yellow=isStart&&E.chance(.09);
  const red=!yellow&&isStart&&E.chance(.022);
  if(motm)myRating=E.clamp(myRating+E.rand(8,16),68,99);
  if(red)myRating=E.clamp(myRating-22,28,65);
  const result=hg>ag?'W':hg<ag?'L':'D';

  if(isStart||isSub){
    G.seasonStats.apps++;G.careerStats.apps++;
    G.seasonStats.goals+=myGoals;G.careerStats.goals+=myGoals;
    G.seasonStats.assists+=myAssists;G.careerStats.assists+=myAssists;
    if(motm){G.seasonStats.motm++;G.careerStats.motm++;}
    if(yellow)G.seasonStats.yellows++;
    if(red){G.seasonStats.reds++;G.careerStats.reds++;}
    if(result==='W')G.seasonStats.wins++;
    else if(result==='D')G.seasonStats.draws++;
    else G.seasonStats.losses++;
    if(ag===0&&['GK','CB','LB','RB','CDM'].includes(G.player.position))G.seasonStats.cleanSheets++;
    G.seasonStats.ratingSum+=Math.round(myRating);
    G.seasonStats.ratingCount++;
    G.seasonStats.avgRating=Math.round(G.seasonStats.ratingSum/G.seasonStats.ratingCount);
    G.form.push(Math.round(myRating));
    if(G.form.length>5)G.form.shift();
  }

  if(!isCup) updateLeagueTable(G.club.name,awayName,hg,ag,isHome);

  let detail=`${isStart?'Started':isSub?'Off the bench':'Not in squad'}. `;
  if(myGoals) detail+=`${myGoals} goal${myGoals>1?'s':''} — "${E.pick(GOAL_FLAVOUR)}". `;
  if(myAssists) detail+=`${myAssists} assist — "${E.pick(ASSIST_FLAVOUR)}". `;
  if(motm) detail+=`🌟 Man of the Match — "${E.pick(MOTM_FLAVOUR)}". `;
  if(yellow) detail+=`🟨 Booked for a late challenge. `;
  if(red) detail+=`🟥 Straight red — you'll miss the next game. `;
  if(!myGoals&&!myAssists&&!motm&&isStart) detail+=`${myRating>=68?'Solid performance.':'Tough afternoon — room to improve.'}`;

  const rec={date:E.getDayLabel(day||0),home:homeName,away:awayName,hg,ag,result,rating:Math.round(myRating),goals:myGoals,assists:myAssists,motm,yellow,red,isCup:!!isCup,selection};
  G.matchHistory.push(rec);

  // Transfer market visibility: agent watches good performances
  if((motm||myGoals>=2||(G.agentUpgraded&&myRating>=75)) && !G.club.isFreeAgent){
    maybeGenerateTransferOffer(day||0);
  }

  return{type:'match',icon:'⚽',title:`${homeName} ${hg}–${ag} ${awayName}`,detail:detail.trim(),result,hg,ag,myGoals,myAssists,myRating:Math.round(myRating),motm,yellow,red,selection};
}

function updateLeagueTable(myClub,oppName,hg,ag,myClubIsHome){
  const hName=myClubIsHome?myClub:oppName;
  const aName=myClubIsHome?oppName:myClub;
  const home=G.league.teams.find(t=>t.name===hName);
  const away=G.league.teams.find(t=>t.name===aName);
  const applyResult=(team,scored,conceded)=>{
    if(!team)return;
    team.played++;team.gf+=scored;team.ga+=conceded;team.gd=team.gf-team.ga;
    if(scored>conceded){team.won++;team.pts+=3;team.form.push('W');}
    else if(scored===conceded){team.drawn++;team.pts+=1;team.form.push('D');}
    else{team.lost++;team.form.push('L');}
    if(team.form.length>5)team.form.shift();
  };
  applyResult(home,hg,ag);
  applyResult(away,ag,hg);

  // Simulate other AI matches
  const others=G.league.teams.filter(t=>!t.isPlayer&&t.name!==oppName);
  for(let i=0;i<others.length-1;i+=2){
    const r=E.simulateAIMatch(others[i],others[i+1]);
    applyResult(others[i],r.hg,r.ag);
    applyResult(others[i+1],r.ag,r.hg);
  }
}

function simulateGrowth(){
  const keys=['pace','shooting','passing','dribbling','defending','physical'];
  const w=POS_WEIGHTS[G.player.position]||{};
  const sorted=keys.slice().sort((a,b)=>(w[b]||1)-(w[a]||1));
  const k=E.pick(sorted.slice(0,4));
  const cur=G.player.attrs[k];
  if(cur>=99)return null;
  const gain=1;
  G.player.attrs[k]=E.clamp(cur+gain,0,99);
  G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
  const labels={pace:'Pace',shooting:'Shooting',passing:'Passing',dribbling:'Dribbling',defending:'Defending',physical:'Physical'};
  return{type:'growth',icon:'📈',title:`${labels[k]} improved`,detail:`${labels[k]} is now ${G.player.attrs[k]}`};
}

function checkMilestones(events,day){
  const st=G.seasonStats,cs=G.careerStats;
  const check=(key,cond,icon,title,detail)=>{
    if(cond&&!G.achievements.has(key)){
      G.achievements.add(key);
      events.push({type:'milestone',icon,title,detail});
      G.careerLog.push({icon,title,detail,date:E.getDayLabel(day)});
      showToast(`${icon} ${title}`,'');
    }
  };
  check('g10s',st.goals>=10,'🎯','10 Season Goals!','Double figures — clinical performer.');
  check('g20s',st.goals>=20,'🔥','20-Goal Season!','Outstanding — top scorer material.');
  check('g50c',cs.goals>=50,'⭐','50 Career Goals!','Half a century — a remarkable milestone.');
  check('g100c',cs.goals>=100,'🌟','100 Career Goals!','A true legend of the game.');
  check('m5s',st.motm>=5,'🏅','5 MOTMs This Season!','Consistently the best on the pitch.');
  check('app50',cs.apps>=50,'👕','50 Career Appearances','Growing into a real pro.');
  check('app100',cs.apps>=100,'👕','100 Career Appearances','A century of caps — remarkable commitment.');
  check('ovr70',G.player.overall>=70,'📊','Reached 70 OVR','Breaking into real quality territory.');
  check('ovr80',G.player.overall>=80,'⭐','Reached 80 OVR','Elite-level player — genuinely world-class.');
  check('invest1',G.investments.length>=1,'💰','First Investment','Your money starts working for you.');
  check('invest3',G.investments.length>=3,'💼','Property Portfolio','Three income streams — a true businessman.');
}

// ── Random Events ─────────────────────────────────────────────
function checkRandomEvent(day){
  if(G.pendingEvent) return null;  // don't stack events
  if(G.season.finished) return null;

  for(const ev of RANDOM_EVENTS){
    if(ev.minDay && day<ev.minDay) continue;
    if(ev.minOVR && G.player.overall<ev.minOVR) continue;
    if(ev.maxAge && G.player.age>ev.maxAge) continue;
    // Don't repeat unique events
    if(['evt_youth_grant','evt_boot_deal','evt_agent_upgrade','evt_mystery_investor'].includes(ev.id) && G.triggeredEvents.has(ev.id)) continue;

    if(E.chance(ev.chance)){
      G.triggeredEvents.add(ev.id);
      G.pendingEvent=ev;
      return ev;
    }
  }
  return null;
}

function resolveEvent(fnName){
  G.pendingEvent=null;
  const day=G.season.dayOfSeason;

  const actions={
    giveGrant:()=>{
      G.wallet+=15000;
      addLog('🏛️','Youth Development Grant','£15,000 deposited into your account.',day);
      showToast('💰 +£15,000 grant received!','');
    },
    donateGrant:()=>{
      addLog('❤️','Grant Donated','You directed the funds to grassroots football.',day);
      showToast('💚 Generous gesture noted!','');
    },
    acceptTrainingCamp:()=>{
      const stats=['pace','shooting','passing','dribbling','defending','physical'];
      const chosen=[];
      while(chosen.length<2){const s=E.pick(stats);if(!chosen.includes(s))chosen.push(s);}
      chosen.forEach(s=>{G.player.attrs[s]=E.clamp(G.player.attrs[s]+5,0,99);});
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🏰','Elite Training Camp',`${chosen.join(' & ')} improved by 5 each.`,day);
      showToast('🏰 Training camp complete! +5 to 2 stats','');
    },
    declineEvent:()=>{},
    teammateCrisis:()=>{
      G.forcedStarter=21; // 3 weeks guaranteed start
      addLog('🤕','Teammate Injured',`You step up — guaranteed starter for 3 weeks.`,day);
      showToast('💪 You\'re in the starting XI for 3 weeks!','');
    },
    showBetUI:()=>{
      // Will be handled by UI
      UI.showBetModal();
      return;
    },
    bootDeal:()=>{
      G.wallet+=8000;
      addLog('👟','Boot Sponsorship','£8,000 one-off signing fee received.',day);
      showToast('👟 Boot deal signed! +£8,000','');
    },
    doDocumentary:()=>{
      G.wallet+=5000;
      addLog('🎬','Documentary Filmed','£5,000 appearance fee. Positive coverage.',day);
      showToast('🎬 Documentary in the can! +£5,000','');
    },
    upgradeAgent:()=>{
      G.agentUpgraded=true;
      addLog('🤵','Signed with Fuentes','Top-tier agent. Transfer market visibility maximised.',day);
      showToast('🤵 New agent signed — expect bigger offers!','');
    },
    dressRoomFight:()=>{
      addLog('😤','Dressing Room Confrontation','Stood your ground. Gained squad respect.',day);
      showToast('💪 Respect earned in the dressing room','');
    },
    dressRoomCool:()=>{
      addLog('🤐','Kept Cool','Professional as ever. Manager impressed.',day);
      showToast('✅ Maturity noted by the manager','');
    },
    dressRoomSwing:()=>{
      const fine=3000;G.wallet-=fine;
      G.careerLog.push({icon:'🥊',title:'Dressing Room Fine',detail:`£${fine.toLocaleString()} deducted for conduct.`,date:E.getDayLabel(day)});
      showToast(`❌ Fined £${fine.toLocaleString()} for conduct`,'err');
    },
    restInjury:()=>{
      G.injuryDaysLeft=5;
      addLog('🛏️','Managed Recovery','5-day precautionary rest. Cleared the strain properly.',day);
      showToast('🏥 5-day rest — smart decision','');
    },
    playThrough:()=>{
      addLog('💉','Played Through Pain','High re-injury risk. Brave, possibly unwise.',day);
      showToast('⚠️ Higher injury risk this month!','warn');
    },
    charityMatch:()=>{
      G.wallet+=2000;
      addLog('❤️','Charity Match','Played for a wonderful cause. £2,000 donated in your name.',day);
      showToast('❤️ Brilliant gesture. +£2,000','');
    },
    charityDonate:()=>{
      G.wallet-=1000;
      addLog('💸','Charitable Donation','£1,000 donated. Quietly generous.',day);
      showToast('💚 £1,000 donated — kind soul','');
    },
    preditResponse:()=>{
      addLog('🎤','Classy Public Response','Measured reply went viral for the right reasons.',day);
      showToast('👍 Public respected your response','');
    },
    silentResponse:()=>{
      addLog('🤫','Silence on the Pundit','Let the football do the talking.',day);
      showToast('⚽ Football is the best response','');
    },
    angryResponse:()=>{
      G.wallet-=2000;
      G.careerLog.push({icon:'😡',title:'Club Fine',detail:'£2,000 fine for unprofessional public comments.',date:E.getDayLabel(day)});
      showToast('❌ Fined £2,000. Stay composed next time','err');
    },
    scamInvest:()=>{
      if(G.wallet<20000){showToast('Not enough money!','err');return;}
      G.wallet-=20000;
      if(E.chance(0.4)){
        G.wallet+=48000; // 40% ROI + principal back
        addLog('💼','Investment Pays Off','The offshore scheme returned £48,000! Unbelievable.',day);
        showToast('🎉 Paid off! +£48,000 returned!','');
      } else {
        addLog('💔','Investment Lost','£20,000 gone. The man vanished.',day);
        showToast('💸 Lost £20,000. Lesson learned.','err');
      }
    },
    reportScam:()=>{
      addLog('🕵️','Reported Suspicious Contact','Club praised your integrity.',day);
      showToast('✅ Smart call — integrity intact','');
    },
    acceptLoan:()=>{
      G.loanActive=true;G.loanDaysLeft=60;
      addLog('🔄','Emergency Loan Move','60 days of guaranteed football. Growth accelerated.',day);
      G.forcedStarter=60;
      // Faster growth during loan
      for(let i=0;i<3;i++){const g=simulateGrowth();if(g)G.careerLog.push({icon:'📈',title:g.title,detail:g.detail,date:E.getDayLabel(day)});}
      showToast('✈️ Loan activated — guaranteed starts!','');
    },
    goHome:()=>{
      addLog('🏠','Went Home','A day off to see your old coach. Returned refreshed.',day);
      showToast('❤️ The visit meant everything to him','');
    },
    callHome:()=>{
      addLog('📞','Called Home','An hour-long call. He was proud of everything.',day);
      showToast('📞 He said he\'s watching every game','');
    },
    contractLeakMeeting:()=>{
      G.wallet+=4000;
      addLog('📰','Contract Leak — Loyalty Bonus','Club apologised and paid a £4,000 loyalty bonus.',day);
      showToast('💰 Loyalty bonus: +£4,000','');
    },
    contractLeakLaugh:()=>{
      addLog('😄','Laughed Off the Leak','Your humour defused the tension brilliantly.',day);
      showToast('😄 Dressing room loved it','');
    },
  };

  if(fnName==='showBetUI'){
    // Bet UI opens its own modal — just clear the pending event, don't close underlying
    G.pendingEvent=null;
    UI.showBetModal();
    App.renderDashboard();
    return;
  }

  if(actions[fnName]) actions[fnName]();
  else console.warn('Unknown event action:', fnName);

  // Always close the blocking modal and re-render after any event resolution
  closeModal();
  App.renderDashboard();
}

function addLog(icon,title,detail,day){
  G.careerLog.push({icon,title,detail,date:E.getDayLabel(day)});
}

// ── Transfer Offers ───────────────────────────────────────────
function maybeGenerateTransferOffer(day){
  if(!E.chance(G.agentUpgraded?0.12:0.06)) return;
  const offerTier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
  const offerLeague=LEAGUES.find(l=>l.tier===offerTier)||LEAGUES[0];
  const offerClub=E.pick(CLUBS[offerTier]||CLUBS[3]);
  if(offerClub===G.club.name) return;
  const offerId=`offer_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  const salary=Math.round(offerLeague.salary*(0.85+Math.random()*.45));
  G.pendingTransferOffers.push({
    id:offerId,fromClub:offerClub,tier:offerTier,league:offerLeague.name,
    salary,contractYears:E.rand(1,4),expires:day+30,saved:false,
  });
  G.careerLog.push({icon:'📬',title:'Transfer Offer Received!',detail:`${offerClub} want to sign you`,date:E.getDayLabel(day)});
  showToast(`📬 Transfer offer from ${offerClub}!`,'');
  // Update transfer tab notification
  UI.updateTransferBadge();
}

function acceptTransferOffer(offerId){
  const offer=G.pendingTransferOffers.find(o=>o.id===offerId);
  if(!offer)return;
  const prevClub=G.club.name;
  G.club={name:offer.fromClub,tier:offer.tier,leagueId:LEAGUES.find(l=>l.tier===offer.tier)?.id||'L3',contractYears:offer.contractYears,isFreeAgent:false};
  G.weeklySalary=offer.salary;
  G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,offer.tier);
  G.careerLog.push({icon:'✈️',title:`Transferred to ${offer.fromClub}`,detail:`From ${prevClub} · ${offer.league} · £${offer.salary.toLocaleString()}/wk`,date:E.getDayLabel(G.season.dayOfSeason)});
  // Expire all other offers
  G.pendingTransferOffers=[];
  // Regenerate league for new club
  const newLeague=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
  G.league={name:newLeague.name,tier:G.club.tier,teams:E.generateLeague(G.club.tier,G.club.name),matchdays:E.scheduleLeague(G.club.tier,365-G.season.dayOfSeason),nextMatchIdx:0};
  G.cups=E.scheduleCups(G.club.tier);
  showToast(`✈️ Welcome to ${offer.fromClub}!`,'');
  App.renderDashboard();
  closeModal();
}

function declineTransferOffer(offerId){
  G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>o.id!==offerId);
  G.careerLog.push({icon:'🚫',title:'Transfer Declined',detail:'You chose to stay put.',date:E.getDayLabel(G.season.dayOfSeason)});
  App.renderDashboard();
}

function saveOfferForLater(offerId){
  const o=G.pendingTransferOffers.find(x=>x.id===offerId);
  if(o) o.saved=true;
  closeModal();
  showToast('📋 Offer saved — check the Career tab','');
  App.renderDashboard();
}

// ── Manager Interaction ───────────────────────────────────────
function requestNewContract(){
  const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
  const day=G.season.dayOfSeason;

  if(op.opinion==='poor'||op.opinion==='sceptical'){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">😕</span><div class="event-modal-title">Request Denied</div><div class="event-modal-subtitle">"Look, I'll be honest — you're not quite at the level I need right now. Keep working and come back to me." — ${G.manager.name}</div></div>
    <div class="event-choices"><button class="event-choice" onclick="closeModal()"><div class="ec-label">👍 Understood, Manager</div><div class="ec-outcome">Back to training — you have work to do.</div></button></div>`);
    return;
  }

  const newSalary=Math.round(G.weeklySalary*E.rand(110,130)/100);
  const years=E.rand(2,4);
  showModal(`<div class="event-modal-header"><span class="event-modal-emoji">✍️</span><div class="event-modal-title">New Contract Offer</div><div class="event-modal-subtitle">"We want you here for the long term." — ${G.manager.name}</div></div>
  <div class="modal-stat-grid">
    <div class="modal-stat"><div class="ms-label">New Weekly Wage</div><div class="ms-val" style="color:var(--gold)">£${newSalary.toLocaleString()}</div></div>
    <div class="modal-stat"><div class="ms-label">Contract Length</div><div class="ms-val">${years} years</div></div>
    <div class="modal-stat"><div class="ms-label">Pay Rise</div><div class="ms-val" style="color:var(--accent)">+£${(newSalary-G.weeklySalary).toLocaleString()}/wk</div></div>
    <div class="modal-stat"><div class="ms-label">Current Wage</div><div class="ms-val">£${G.weeklySalary.toLocaleString()}</div></div>
  </div>
  <div class="event-choices">
    <button class="event-choice gold" onclick="signNewContract(${newSalary},${years})"><div class="ec-label">✍️ Sign the contract</div><div class="ec-outcome">Secure your future at ${G.club.name}.</div></button>
    <button class="event-choice" onclick="closeModal()"><div class="ec-label">🤔 Think about it</div><div class="ec-outcome">Come back later.</div></button>
  </div>`);
}

function signNewContract(salary,years){
  G.weeklySalary=salary;
  G.club.contractYears=years;
  addLog('✍️','Contract Signed',`£${salary.toLocaleString()}/wk · ${years}-year deal`,G.season.dayOfSeason);
  showToast('✍️ Contract signed!','');
  closeModal();
  App.renderDashboard();
}

function requestTransferListing(){
  const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
  const day=G.season.dayOfSeason;
  const ovr=G.player.overall;
  const teamOVR=G.manager.teamAvgOVR;
  const diff=ovr-teamOVR;

  // If player is significantly better than the team, manager CANNOT block
  if(diff>=12){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🌟</span><div class="event-modal-title">You're Too Good For This Club</div><div class="event-modal-subtitle">"I can't hold you back — you deserve a bigger stage." — ${G.manager.name}</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">Your quality is undeniable — ${ovr} OVR vs a squad averaging ${teamOVR}. The club has no choice but to list you. Expect offers from higher divisions.</p>
    <div class="event-choices">
      <button class="event-choice gold" onclick="activateTransferList()"><div class="ec-label">📋 Go on the list — find a bigger club</div><div class="ec-outcome">Your agent contacts every club in the top divisions immediately.</div></button>
      <button class="event-choice" onclick="closeModal()"><div class="ec-label">↩ Stay loyal for now</div><div class="ec-outcome">You turn down the chance. For now.</div></button>
    </div>`);
    return;
  }

  // If player is clearly above average (diff 6-11), they can push hard
  if(diff>=6){
    // Buy out clause — force a listing by paying a small fee
    const buyout=Math.round(G.weeklySalary*4);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">💼</span><div class="event-modal-title">Manager is Reluctant</div><div class="event-modal-subtitle">"You've been important to us... but I can see you're ready for more." — ${G.manager.name}</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">The manager acknowledges your quality (${ovr} OVR) but isn't ready to lose you easily. You can push harder — or invoke your contract clause.</p>
    <div class="event-choices">
      <button class="event-choice gold" onclick="activateTransferList()"><div class="ec-label">🗣️ Push hard — demand a listing</div><div class="ec-outcome">You force the issue. Offers will come, but the manager relationship takes a hit.</div></button>
      <button class="event-choice" onclick="payBuyout(${buyout})"><div class="ec-label">💰 Pay contract clause — £${buyout.toLocaleString()}</div><div class="ec-outcome">Settle the fee and walk. Clean break, immediate listing.</div></button>
      <button class="event-choice" onclick="closeModal()"><div class="ec-label">↩ Back down for now</div><div class="ec-outcome">Bide your time.</div></button>
    </div>`);
    return;
  }

  // Good standing — manager blocks it
  if(op.opinion==='favourable'||op.opinion==='good'){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">😤</span><div class="event-modal-title">Request Denied</div><div class="event-modal-subtitle">"I'm not selling you — you're too important to us right now." — ${G.manager.name}</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px;">The manager values you too much to let you go. You need to be a clear step above the squad to force through a move, or wait until your stock drops.</p>
    <div class="event-choices"><button class="event-choice" onclick="closeModal()"><div class="ec-label">👍 Understood — keep working</div><div class="ec-outcome">Your time will come.</div></button></div>`);
    return;
  }

  // Neutral/poor — manager will let you go
  showModal(`<div class="event-modal-header"><span class="event-modal-emoji">📋</span><div class="event-modal-title">Transfer Listed</div><div class="event-modal-subtitle">"If the right offer comes in, we'll discuss it." — ${G.manager.name}</div></div>
  <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">You're now on the transfer list. Clubs across all divisions will start making enquiries.</p>
  <div class="event-choices">
    <button class="event-choice gold" onclick="activateTransferList()"><div class="ec-label">📋 Confirm transfer listing</div><div class="ec-outcome">Your agent gets to work immediately.</div></button>
    <button class="event-choice" onclick="closeModal()"><div class="ec-label">↩ Change of heart</div><div class="ec-outcome">You'll stay and compete.</div></button>
  </div>`);
}

function payBuyout(amount){
  if(G.wallet<amount){showToast('Not enough money for the buyout!','err');return;}
  G.wallet-=amount;
  addLog('💰','Contract Buyout Paid',`£${amount.toLocaleString()} paid — now on the transfer list.`,G.season.dayOfSeason);
  activateTransferList();
}

function activateTransferList(){
  const diff=G.player.overall-G.manager.teamAvgOVR;
  // Bigger difference = more offers, from higher tiers
  const n=diff>=12?E.rand(4,6):diff>=6?E.rand(3,5):E.rand(2,4);
  for(let i=0;i<n;i++){
    // Overqualified players attract higher-division interest
    const tierBias=diff>=12?-2:diff>=6?-1:0;
    const offerTier=E.clamp(G.club.tier+tierBias+E.rand(-1,1),1,5);
    const offerLeague=LEAGUES.find(l=>l.tier===offerTier)||LEAGUES[0];
    const offerClub=E.pick(CLUBS[offerTier]||CLUBS[3]);
    if(offerClub===G.club.name) continue;
    const salary=Math.round(offerLeague.salary*(0.85+Math.random()*.45));
    G.pendingTransferOffers.push({
      id:`tl_${Date.now()}_${i}`,fromClub:offerClub,tier:offerTier,league:offerLeague.name,
      salary,contractYears:E.rand(2,4),expires:G.season.dayOfSeason+45,saved:false,
    });
  }
  addLog('📋','Transfer Listed','On the market. Enquiries flooding in.',G.season.dayOfSeason);
  closeModal();
  showToast(`📋 Transfer listed — ${n} clubs interested!`,'');
  UI.updateTransferBadge();
  App.renderDashboard();
}

// ── Season End ────────────────────────────────────────────────
function getSortedTable(){
  return[...G.league.teams].sort((a,b)=>b.pts-a.pts||(b.gd-a.gd)||(b.gf-a.gf));
}

function getLeaguePosition(){
  return getSortedTable().findIndex(t=>t.isPlayer)+1;
}

function endSeason(){
  G.season.finished=true;
  G.careerStats.seasons++;

  // End-of-season development
  const ageBoost=Math.max(0.2,1.4-(G.player.age-17)*.1);
  const keys=['pace','shooting','passing','dribbling','defending','physical'];
  const w=POS_WEIGHTS[G.player.position]||{};
  keys.slice().sort((a,b)=>(w[b]||1)-(w[a]||1)).slice(0,3).forEach(k=>{
    const gain=E.rand(0,Math.round(2*ageBoost));
    G.player.attrs[k]=E.clamp(G.player.attrs[k]+gain,0,99);
  });
  G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
  G.careerStats.bestOVR=Math.max(G.careerStats.bestOVR,G.player.overall);

  const st=G.seasonStats;
  G.careerLog.push({icon:'🏁',title:`Season ${G.season.number} Complete`,detail:`${st.apps} apps · ${st.goals}G ${st.assists}A · Avg ${st.avgRating||'—'}`,date:'End of Season'});

  checkLeagueResult();

  // Contract wind down
  G.club.contractYears--;
  if(G.club.contractYears<=0 && !G.club.isFreeAgent){
    const pos=getLeaguePosition();
    const poorPerf=pos>Math.floor(G.league.teams.length*.6) && G.player.overall<58;
    if(poorPerf){
      G.club.isFreeAgent=true;G.club.name='Free Agent';
      G.careerLog.push({icon:'🔓',title:'Released',detail:'Club did not renew your contract.',date:'End of Season'});
    } else {
      G.club.contractYears=E.rand(2,4);
      G.weeklySalary=Math.round(G.weeklySalary*E.rand(105,122)/100);
      G.careerLog.push({icon:'✍️',title:'Contract Auto-Renewed',detail:`£${G.weeklySalary.toLocaleString()}/wk · ${G.club.contractYears} years`,date:'End of Season'});
    }
  }

  G.player.age++;

  // Age cap check — at 34+, prompt for career extension or retirement
  if(G.player.age>=34){
    // Autosave first
    try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));}catch(e){}
    UI.showAgeCapModal();
    return;
  }

  // Autosave at end of every season
  try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));showToast('💾 Season autosaved','');}catch(e){}

  UI.showSeasonEndModal();
}

function checkLeagueResult(){
  const sorted=getSortedTable();
  const myPos=sorted.findIndex(t=>t.isPlayer)+1;
  const league=LEAGUES.find(l=>l.tier===G.club.tier);
  if(!league)return;

  if(G.club.tier>1 && myPos<=league.promoted){
    G.club.tier--;
    const nl=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    G.club.leagueId=nl.id;G.weeklySalary=Math.round(G.weeklySalary*1.22);
    G.careerLog.push({icon:'🚀',title:'Promoted!',detail:`Moving up to ${nl.name}`,date:'End of Season'});
    G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,G.club.tier);
  } else if(league.relegated && G.club.tier<5 && myPos>sorted.length-league.relegated){
    G.club.tier++;
    const nl=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    G.club.leagueId=nl.id;G.weeklySalary=Math.round(G.weeklySalary*.85);
    G.careerLog.push({icon:'📉',title:'Relegated',detail:`Dropped to ${nl.name}`,date:'End of Season'});
  }

  if(myPos===1){
    G.careerStats.trophies++;
    G.careerLog.push({icon:'🏆',title:`${G.league.name} Champions!`,detail:'Finished top of the league!',date:'End of Season'});
  }
}

function startNewSeason(){
  closeModal();
  if(G.club.isFreeAgent){UI.showFreeAgentOffers();return;}

  G.season={number:G.season.number+1,startYear:G.season.startYear+1,dayOfSeason:0,totalDays:365,finished:false};
  G.seasonStats={goals:0,assists:0,apps:0,motm:0,yellows:0,reds:0,wins:0,draws:0,losses:0,ratingSum:0,ratingCount:0,avgRating:0,cleanSheets:0};
  G.dayLog=[];G.matchHistory=[];G.form=[];G.injuryDaysLeft=0;G.forcedStarter=0;G.pendingEvent=null;

  const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
  G.league={name:league.name,tier:G.club.tier,teams:E.generateLeague(G.club.tier,G.club.name),matchdays:E.scheduleLeague(G.club.tier,365),nextMatchIdx:0};
  G.cups=E.scheduleCups(G.club.tier);
  G.manager.teamAvgOVR=E.rand(58,76);

  G.careerLog.push({icon:'🔄',title:`Season ${G.season.number} Begins`,detail:`${G.club.name} · ${league.name}`,date:'Pre-Season'});
  App.renderDashboard();
  showToast('🆕 New season started!','');
}

// ── Investments ───────────────────────────────────────────────
function purchaseInvestment(invId){
  const inv=INVESTMENTS.find(i=>i.id===invId);
  if(!inv)return;
  if(G.investments.includes(invId)){showToast('Already owned!','warn');return;}
  if(G.wallet<inv.cost){showToast('Not enough money!','err');return;}
  G.wallet-=inv.cost;
  G.investments.push(invId);
  G.passiveIncome+=inv.weeklyReturn;
  addLog(inv.icon,`Purchased: ${inv.name}`,`+£${inv.weeklyReturn.toLocaleString()}/wk passive income`,G.season.dayOfSeason);
  showToast(`${inv.icon} ${inv.name} purchased! +£${inv.weeklyReturn.toLocaleString()}/wk`,'');
  App.renderDashboard();
}

// ── Free Agent ────────────────────────────────────────────────
function generateFreeAgentOffers(){
  const offers=[];
  const n=E.rand(3,5);
  for(let i=0;i<n;i++){
    let tier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
    const league=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
    const club=E.pick(CLUBS[tier]||CLUBS[3]);
    offers.push({id:`fa_${i}`,fromClub:club,tier,league:league.name,salary:Math.round(league.salary*(0.8+Math.random()*.4)),contractYears:E.rand(1,3)});
  }
  return offers;
}

function signFreeAgent(offerId){
  const offer=G._faOffers?.find(o=>o.id===offerId);
  if(!offer)return;
  G.club={name:offer.fromClub,tier:offer.tier,leagueId:LEAGUES.find(l=>l.tier===offer.tier)?.id||'L4',contractYears:offer.contractYears,isFreeAgent:false};
  G.weeklySalary=offer.salary;
  G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,offer.tier);
  G.careerLog.push({icon:'✍️',title:`Signed for ${offer.fromClub}`,detail:`${offer.league} · £${offer.salary.toLocaleString()}/wk`,date:E.getDayLabel(G.season.dayOfSeason)});
  closeModal();
  startNewSeason();
}

// ── Save / Load / HOF ─────────────────────────────────────────
function saveGame(){
  try{
    const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};
    localStorage.setItem('propath3_save',JSON.stringify(s));
    showToast('💾 Game saved!','');
  }catch(e){showToast('❌ Save failed','err');}
}

function loadGame(){
  try{
    const raw=localStorage.getItem('propath3_save');
    if(!raw){showToast('No save found.','warn');return;}
    const s=JSON.parse(raw);
    s.achievements=new Set(s.achievements||[]);
    s.triggeredEvents=new Set(s.triggeredEvents||[]);
    G=s;
    App.goTo(5);
    showToast('✅ Career loaded!','');
  }catch(e){showToast('❌ Load failed','err');}
}

function getHOF(){try{return JSON.parse(localStorage.getItem('propath3_hof')||'[]');}catch{return[];}}

function saveToHOF(){
  const hof=getHOF();
  hof.push({
    name:`${G.player.firstName} ${G.player.lastName}`,
    nation:G.player.nation,position:G.player.position,age:G.player.age,
    goals:G.careerStats.goals,assists:G.careerStats.assists,
    apps:G.careerStats.apps,trophies:G.careerStats.trophies,
    seasons:G.careerStats.seasons,bestOVR:G.careerStats.bestOVR,
    investments:G.investments.length,
    highestLeague:LEAGUES.find(l=>l.tier===G.careerStats.highestLeague)?.name||'—',
    date:new Date().getFullYear(),
  });
  localStorage.setItem('propath3_hof',JSON.stringify(hof.slice(-20)));
}

// ── Career Extension (Age Cap) ────────────────────────────────
// Base cap is 34. Each extension costs more. Max 6 extensions (retire at 40).
const EXTENSION_COSTS=[500000,900000,1500000,2500000,4000000,6000000];
const EXTENSION_LABELS=['34→35','35→36','36→37','37→38','38→39','39→40'];

function getExtensionIndex(){
  // How many extensions have been paid so far = (age - 34) if age > 34
  return Math.max(0,G.player.age-34);
}

function extendCareer(){
  const idx=getExtensionIndex();
  if(idx>=EXTENSION_COSTS.length){
    showToast('Career cannot be extended further.','warn');
    return;
  }
  const cost=EXTENSION_COSTS[idx];
  if(G.wallet<cost){
    showToast(`Need £${cost.toLocaleString()} — not enough funds!`,'err');
    return;
  }
  G.wallet-=cost;
  G.player.ageCapExtensions=(G.player.ageCapExtensions||0)+1;
  addLog('⏳','Career Extension Paid',`£${cost.toLocaleString()} — playing on for another season.`,G.season.dayOfSeason);
  showToast(`⏳ Career extended! Playing on at age ${G.player.age}.`,'');
  // Autosave
  try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));}catch(e){}
  UI.showSeasonEndModal();
}
function resolveBet(outcome, amount){
  // outcome: 'win','draw','lose'  amount: number
  if(amount<=0||amount>G.wallet){showToast('Invalid bet amount','err');return;}
  const odds={win:2.1,draw:3.4,lose:4.0};
  const opp=G.league.teams.find(t=>!t.isPlayer)||{ovr:65};
  const teamOVR=G.manager.teamAvgOVR;
  const r=E.simulateAIMatch({ovr:teamOVR},{ovr:opp.ovr});
  const actualResult=r.hg>r.ag?'win':r.hg<r.ag?'lose':'draw';
  const won=outcome===actualResult;
  if(won){
    const payout=Math.floor(amount*odds[outcome]);
    G.wallet+=payout-amount;
    addLog('🎰','Bet Won!',`Backed a ${outcome} · Result: ${r.hg}-${r.ag} · +£${(payout-amount).toLocaleString()}`,G.season.dayOfSeason);
    showToast(`🎰 Won! +£${(payout-amount).toLocaleString()}!`,'');
  } else {
    G.wallet-=amount;
    addLog('🎰','Bet Lost',`Backed a ${outcome} · Actual result: ${r.hg}-${r.ag} · -£${amount.toLocaleString()}`,G.season.dayOfSeason);
    showToast(`😬 Lost the bet. -£${amount.toLocaleString()}`,'err');
  }
  closeModal();
  App.renderDashboard();
}
