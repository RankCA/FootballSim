// ════════════════════════════════════════════════════════════
//  ProPath v4 — state.js
// ════════════════════════════════════════════════════════════

let G={};

function initGame(draft){
  const attrs=E.buildAttrs(draft.position,draft.age,draft.trait);
  const ovr=E.calcOVR(attrs,draft.position);
  const pot=E.calcPotential(ovr,draft.age);
  const startClub=assignStartClub(draft.age,ovr);
  const league=LEAGUES.find(l=>l.tier===startClub.tier)||LEAGUES[0];
  const year=new Date().getFullYear();

  G={
    player:{firstName:draft.firstName,lastName:draft.lastName,nickname:draft.nickname||'',age:draft.age,nation:draft.nation,position:draft.position,foot:draft.foot,trait:draft.trait,attrs,overall:ovr,potential:pot,ageCapExtensions:0},
    club:{name:startClub.clubName,tier:startClub.tier,leagueId:league.id,contractYears:3,isFreeAgent:false,contractSignedDay:-999},
    manager:{name:E.pick(MANAGER_NAMES),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(58,74)},
    wallet:startClub.salary*6,weeklySalary:startClub.salary,passiveIncome:0,investments:[],
    season:{number:1,startYear:year,dayOfSeason:0,totalDays:365,finished:false},
    seasonStats:{goals:0,assists:0,apps:0,motm:0,yellows:0,reds:0,wins:0,draws:0,losses:0,ratingSum:0,ratingCount:0,avgRating:0,cleanSheets:0},
    careerStats:{goals:0,assists:0,apps:0,motm:0,seasons:0,trophies:0,reds:0,bestOVR:ovr,highestLeague:startClub.tier,intlCaps:0,wcAppearances:0},
    achievements:new Set(),careerLog:[],dayLog:[],matchHistory:[],
    pendingTransferOffers:[],
    league:{name:league.name,tier:startClub.tier,teams:E.generateLeague(startClub.tier,startClub.clubName),matchdays:E.scheduleLeague(startClub.tier,365),nextMatchIdx:0},
    cups:E.scheduleCups(startClub.tier),
    form:[],injuryDaysLeft:0,careerInjuryMonthsLeft:0,forcedStarter:0,
    agentUpgraded:false,triggeredEvents:new Set(),pendingEvent:null,
    loanActive:false,loanDaysLeft:0,wcYear:null,
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
// NOTE: simulateDay does NOT increment dayOfSeason — app.js does that
function simulateDay(){
  const day=G.season.dayOfSeason;
  const phase=E.getSeasonPhase(day);
  const events=[];

  // Long-term ACL rehab
  if(G.careerInjuryMonthsLeft>0){
    if(day%30===0){
      G.careerInjuryMonthsLeft--;
      events.push({type:'injury',icon:'🚑',title:`ACL Rehab — ${G.careerInjuryMonthsLeft} month${G.careerInjuryMonthsLeft!==1?'s':''} left`,detail:'Long road back. Physio, pool, and gym only.'});
    } else {
      events.push({type:'injury',icon:'🏥',title:'Rehabilitation Day',detail:'Slowly rebuilding strength and movement.'});
    }
    return{events,blockingEvent:null};
  }

  // Regular injury
  if(G.injuryDaysLeft>0){
    G.injuryDaysLeft--;
    events.push({type:'injury',icon:'🤕',title:'Recovery Day',detail:`Physio work and pool sessions. ${G.injuryDaysLeft} day${G.injuryDaysLeft!==1?'s':''} remaining.`});
    return{events,blockingEvent:null};
  }

  // Weekly wages
  if(day>0&&day%7===0&&!G.club.isFreeAgent){
    G.wallet+=G.weeklySalary;
    let det=`+£${G.weeklySalary.toLocaleString()} wages received.`;
    if(G.passiveIncome>0){G.wallet+=G.passiveIncome;det+=` +£${G.passiveIncome.toLocaleString()} investment returns.`;}
    events.push({type:'salary',icon:'💰',title:'Weekly Payment',detail:det});
  }

  // Transfer offer expiry
  G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>{
    if(o.expires<=day){G.careerLog.push({icon:'⌛',title:'Transfer Offer Expired',detail:`${o.fromClub}'s offer lapsed`,date:E.getDayLabel(day)});return false;}
    return true;
  });

  // World Cup check (WC years: current year divisible by 4 with offset, day 300-330)
  if(!G.pendingEvent&&!G.wcYear){
    const curYear=G.season.startYear;
    const isWCYear=(curYear%4===2); // 2026,2030,2034...
    if(isWCYear&&day>=300&&day<=332){
      const nat=NATIONS.find(n=>n.name===G.player.nation);
      if(nat&&G.player.overall>=nat.callupOVR){
        G.wcYear=curYear;
        G.pendingEvent={id:'evt_world_cup',isWorldCup:true,icon:'🌍',title:'WORLD CUP CALL-UP!',choices:[
          {label:`🌍 Represent ${nat.flag} ${G.player.nation}`,outcome:'Accept the call-up. Play for history.',fn:'wcPlay'},
          {label:'❌ Pull out — club commitments',outcome:'Withdraw from the squad.',fn:'wcDecline'},
        ]};
        return{events,blockingEvent:G.pendingEvent};
      }
    }
  }

  // Random blocking event
  const blockingEvent=checkRandomEvent(day);
  if(blockingEvent)return{events,blockingEvent};

  // Match or training
  const isLeagueDay=G.league.matchdays.includes(day)&&!G.club.isFreeAgent;
  const cupsToday=Object.entries(G.cups||{}).filter(([id,c])=>!c.eliminated&&c.matchDays?.includes(day));

  if(isLeagueDay)events.push(...simulateLeagueMatch(day));
  else if(cupsToday.length>0)cupsToday.forEach(([id,cup])=>events.push(...simulateCupMatch(id,cup,day)));
  else if(phase==='season'){
    if(E.chance(0.06))events.push({type:'training',icon:'🎽',title:'Reserve Match',detail:'Extra minutes in the reserve fixture.'});
    else events.push({type:'training',...E.pick(TRAINING_EVENTS)});
    if(E.chance(0.035)){const g=simulateGrowth();if(g)events.push(g);}
  } else {
    events.push({type:'training',...E.pick(OFFSEASON_EVENTS)});
    if(E.chance(0.025)){const g=simulateGrowth();if(g)events.push(g);}
  }

  // Match injury
  if(events.some(e=>e.type==='match')&&E.chance(0.045)&&G.injuryDaysLeft===0&&G.careerInjuryMonthsLeft===0){
    const days=E.rand(4,18);G.injuryDaysLeft=days;
    const types=['Hamstring tweak','Ankle knock','Muscle strain','Bruised ribs','Hip flexor issue'];
    const t=E.pick(types);
    events.push({type:'injury',icon:'🤕',title:`Injury — ${days} days out`,detail:t});
    G.careerLog.push({icon:'🤕',title:'Injury',detail:`${t} — ${days} days recovery`,date:E.getDayLabel(day)});
  }

  checkMilestones(events,day);
  return{events,blockingEvent:null};
}

// ── Match Simulation ──────────────────────────────────────────
function simulateLeagueMatch(day){
  const mi=G.league.nextMatchIdx||0;
  G.league.nextMatchIdx=mi+1;
  const opponents=G.league.teams.filter(t=>!t.isPlayer);
  const opp=opponents[mi%opponents.length];
  const teamAvg=G.manager.teamAvgOVR;
  const selection=G.forcedStarter>0?'start':E.selectPlayer(G.player.overall,teamAvg);
  if(G.forcedStarter>0)G.forcedStarter--;
  if(selection==='out'){
    const res=E.simulateAIMatch({ovr:teamAvg},{ovr:opp.ovr});
    updateLeagueTable(G.club.name,opp.name,res.hg,res.ag,true);
    return[{type:'match',icon:'🪑',title:`Not Selected — ${G.club.name} vs ${opp.name}`,detail:`Left out. ${G.club.name} ${res.hg>res.ag?'won':'drew or lost'} ${res.hg}-${res.ag}.`,selection:'out'}];
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
  const res=runMatchSim(G.club.name,oppName,oppOVR,G.manager.teamAvgOVR,selection,true,day);
  res.title=`${cupDef.icon} ${cupDef.name} (${stageLabel}): ${res.title}`;
  const win=res.result==='W';
  if(win){cup.stage++;if(cup.stage>=cupDef.rounds.length){cup.winner=true;cup.eliminated=true;G.careerStats.trophies++;G.careerLog.push({icon:'🏆',title:`${cupDef.name} Winner!`,detail:'Lifted the trophy!',date:E.getDayLabel(day)});showToast(`🏆 ${cupDef.name} Winner!`,'');}}
  else cup.eliminated=true;
  G.cups[cupId]=cup;
  return[res];
}

function runMatchSim(homeName,awayName,oppOVR,teamOVR,selection,isCup,day){
  const isAtt=['ST','CF','LW','RW','CAM'].includes(G.player.position);
  const isMid=['CM','CDM'].includes(G.player.position);
  const isHome=homeName===G.club.name;
  const skillDiff=(teamOVR-oppOVR)/100;
  const homeBonus=isHome?0.08:0;
  const hg=E.chance(0.55+skillDiff+homeBonus)?E.rand(0,3):E.rand(0,1);
  const ag=E.chance(0.5-skillDiff)?E.rand(0,3):E.rand(0,1);
  let myGoals=0,myAssists=0,myRating=E.rand(56,80);
  const isStart=selection==='start';
  const isSub=selection==='bench';
  if(isStart||isSub){
    if(isAtt&&hg>0){myGoals=Math.min(E.rand(0,2),hg);if(hg>myGoals&&E.chance(.35))myAssists=1;}
    else if(isMid&&hg>0){if(E.chance(.38))myAssists=1;if(E.chance(.14))myGoals=1;}
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
    G.seasonStats.ratingSum+=Math.round(myRating);G.seasonStats.ratingCount++;
    G.seasonStats.avgRating=Math.round(G.seasonStats.ratingSum/G.seasonStats.ratingCount);
    G.form.push(Math.round(myRating));if(G.form.length>5)G.form.shift();
  }
  if(!isCup)updateLeagueTable(G.club.name,awayName,hg,ag,isHome);
  let detail=`${isStart?'Started':isSub?'Off the bench':'Not in squad'}. `;
  if(myGoals)detail+=`${myGoals} goal${myGoals>1?'s':''} — "${E.pick(GOAL_FLAVOUR)}". `;
  if(myAssists)detail+=`${myAssists} assist — "${E.pick(ASSIST_FLAVOUR)}". `;
  if(motm)detail+=`🌟 Man of the Match — "${E.pick(MOTM_FLAVOUR)}". `;
  if(yellow)detail+=`🟨 Booked for a late challenge. `;
  if(red)detail+=`🟥 Straight red — you'll miss the next game. `;
  if(!myGoals&&!myAssists&&!motm&&isStart)detail+=myRating>=68?'Solid performance.':'Tough afternoon — room to improve.';
  G.matchHistory.push({date:E.getDayLabel(day||0),home:homeName,away:awayName,hg,ag,result,rating:Math.round(myRating),goals:myGoals,assists:myAssists,motm,yellow,red,isCup:!!isCup,selection});
  if((motm||myGoals>=2||(G.agentUpgraded&&myRating>=75))&&!G.club.isFreeAgent)maybeGenerateTransferOffer(day||0);
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
  applyResult(home,hg,ag);applyResult(away,ag,hg);
  const others=G.league.teams.filter(t=>!t.isPlayer&&t.name!==oppName);
  for(let i=0;i<others.length-1;i+=2){const r=E.simulateAIMatch(others[i],others[i+1]);applyResult(others[i],r.hg,r.ag);applyResult(others[i+1],r.ag,r.hg);}
}

function simulateGrowth(){
  const keys=['pace','shooting','passing','dribbling','defending','physical'];
  const w=POS_WEIGHTS[G.player.position]||{};
  const sorted=keys.slice().sort((a,b)=>(w[b]||1)-(w[a]||1));
  const k=E.pick(sorted.slice(0,4));
  const cur=G.player.attrs[k];
  if(cur>=99)return null;
  G.player.attrs[k]=E.clamp(cur+1,0,99);
  G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
  const labels={pace:'Pace',shooting:'Shooting',passing:'Passing',dribbling:'Dribbling',defending:'Defending',physical:'Physical'};
  return{type:'growth',icon:'📈',title:`${labels[k]} improved`,detail:`${labels[k]} is now ${G.player.attrs[k]}`};
}

function checkMilestones(events,day){
  const st=G.seasonStats,cs=G.careerStats;
  const check=(key,cond,icon,title,detail)=>{
    if(cond&&!G.achievements.has(key)){G.achievements.add(key);events.push({type:'milestone',icon,title,detail});G.careerLog.push({icon,title,detail,date:E.getDayLabel(day)});showToast(`${icon} ${title}`,'');}
  };
  check('g10s',st.goals>=10,'🎯','10 Season Goals!','Double figures — clinical performer.');
  check('g20s',st.goals>=20,'🔥','20-Goal Season!','Outstanding — top scorer material.');
  check('g50c',cs.goals>=50,'⭐','50 Career Goals!','Half a century — a remarkable milestone.');
  check('g100c',cs.goals>=100,'🌟','100 Career Goals!','A true legend of the game.');
  check('m5s',st.motm>=5,'🏅','5 MOTMs This Season!','Consistently the best on the pitch.');
  check('app50',cs.apps>=50,'👕','50 Career Appearances','Growing into a real pro.');
  check('app100',cs.apps>=100,'👕','100 Career Appearances','A century of caps.');
  check('ovr70',G.player.overall>=70,'📊','Reached 70 OVR','Breaking into real quality territory.');
  check('ovr80',G.player.overall>=80,'⭐','Reached 80 OVR','Elite-level player — genuinely world-class.');
  check('invest1',G.investments.length>=1,'💰','First Investment','Your money starts working for you.');
  check('invest3',G.investments.length>=3,'💼','Property Portfolio','Three income streams — a true businessman.');
  check('intl1',(cs.intlCaps||0)>=1,'🌍','International Debut!','First cap for your nation — a career milestone.');
}

// ── Random Events ─────────────────────────────────────────────
function checkRandomEvent(day){
  if(G.pendingEvent)return null;
  if(G.season.finished)return null;
  for(const ev of RANDOM_EVENTS){
    if(ev.minDay&&day<ev.minDay)continue;
    if(ev.minOVR&&G.player.overall<ev.minOVR)continue;
    if(ev.maxAge&&G.player.age>ev.maxAge)continue;
    if(ev.unique&&G.triggeredEvents.has(ev.id))continue;
    // Check runtime condition — evaluated against live G state
    if(ev.condition&&!ev.condition())continue;
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
    giveGrant:()=>{G.wallet+=15000;addLog('🏛️','Youth Development Grant','£15,000 deposited.',day);showToast('💰 +£15,000 grant received!','');},
    donateGrant:()=>{addLog('❤️','Grant Donated','You directed the funds to grassroots football.',day);showToast('💚 Generous gesture noted!','');},
    acceptTrainingCamp:()=>{
      const stats=['pace','shooting','passing','dribbling','defending','physical'];
      const chosen=[];while(chosen.length<2){const s=E.pick(stats);if(!chosen.includes(s))chosen.push(s);}
      chosen.forEach(s=>{G.player.attrs[s]=E.clamp(G.player.attrs[s]+5,0,99);});
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🏰','Elite Training Camp',`${chosen.join(' & ')} improved by 5 each.`,day);showToast('🏰 Training camp! +5 to 2 stats','');
    },
    declineEvent:()=>{},
    teammateCrisis:()=>{G.forcedStarter=21;addLog('🤕','Teammate Injured','Guaranteed starter for 3 weeks.',day);showToast("💪 You're in the starting XI for 3 weeks!",'');},
    showBetUI:()=>{UI.showBetModal();return;},
    bootDeal:()=>{G.wallet+=8000;addLog('👟','Boot Sponsorship','£8,000 signing fee received.',day);showToast('👟 Boot deal signed! +£8,000','');},
    doDocumentary:()=>{G.wallet+=5000;addLog('🎬','Documentary Filmed','£5,000 appearance fee.',day);showToast('🎬 Documentary done! +£5,000','');},
    upgradeAgent:()=>{G.agentUpgraded=true;addLog('🤵','Signed with Fuentes','Top-tier agent. Transfer visibility maximised.',day);showToast('🤵 New agent — expect bigger offers!','');},
    dressRoomFight:()=>{addLog('😤','Dressing Room Confrontation','Stood your ground. Squad respect gained.',day);showToast('💪 Respect earned in the dressing room','');},
    dressRoomCool:()=>{addLog('🤐','Kept Cool','Professional as ever.',day);showToast('✅ Maturity noted by the manager','');},
    dressRoomSwing:()=>{G.wallet-=3000;addLog('🥊','Dressing Room Fine','£3,000 deducted for conduct.',day);showToast('❌ Fined £3,000 for conduct','err');},
    restInjury:()=>{G.injuryDaysLeft=5;addLog('🛏️','Managed Recovery','5-day rest. Cleared properly.',day);showToast('🏥 5-day rest — smart decision','');},
    playThrough:()=>{addLog('💉','Played Through Pain','High re-injury risk.',day);showToast('⚠️ Higher injury risk this month!','warn');},
    charityMatch:()=>{G.wallet+=2000;addLog('❤️','Charity Match','Played for a wonderful cause. £2,000 donated.',day);showToast('❤️ +£2,000','');},
    charityDonate:()=>{G.wallet-=1000;addLog('💸','Charitable Donation','£1,000 donated.',day);showToast('💚 £1,000 donated','');},
    preditResponse:()=>{addLog('🎤','Classy Public Response','Measured reply went viral for the right reasons.',day);showToast('👍 Public respected your response','');},
    silentResponse:()=>{addLog('🤫','Silence on the Pundit','Let the football do the talking.',day);showToast('⚽ Football is the best response','');},
    angryResponse:()=>{G.wallet-=2000;addLog('😡','Club Fine','£2,000 fine for unprofessional comments.',day);showToast('❌ Fined £2,000','err');},
    scamInvest:()=>{
      if(G.wallet<20000){showToast('Not enough money!','err');return;}
      G.wallet-=20000;
      if(E.chance(0.4)){G.wallet+=48000;addLog('💼','Investment Pays Off','The scheme returned £48,000!',day);showToast('🎉 +£48,000 returned!','');}
      else{addLog('💔','Investment Lost','£20,000 gone. The man vanished.',day);showToast('💸 Lost £20,000. Lesson learned.','err');}
    },
    reportScam:()=>{addLog('🕵️','Reported Suspicious Contact','Club praised your integrity.',day);showToast('✅ Smart call — integrity intact','');},
    acceptLoan:()=>{
      G.loanActive=true;G.loanDaysLeft=60;G.forcedStarter=60;
      addLog('🔄','Emergency Loan Move','60 days of guaranteed football. Growth accelerated.',day);
      for(let i=0;i<3;i++){const g=simulateGrowth();if(g)G.careerLog.push({icon:'📈',title:g.title,detail:g.detail,date:E.getDayLabel(day)});}
      showToast('✈️ Loan activated!','');
    },
    goHome:()=>{addLog('🏠','Went Home','A day off to see your old coach.',day);showToast("❤️ The visit meant everything to him",'');},
    callHome:()=>{addLog('📞','Called Home','An hour-long call. He was proud.',day);showToast("📞 He's watching every game",'');},
    contractLeakMeeting:()=>{G.wallet+=4000;addLog('📰','Contract Leak — Loyalty Bonus','Club apologised. +£4,000.',day);showToast('💰 Loyalty bonus: +£4,000','');},
    contractLeakLaugh:()=>{addLog('😄','Laughed Off the Leak','Tensions defused.',day);showToast('😄 Dressing room loved it','');},
    // ── Extended event handlers ────────────────────────────────
    embraceViral:()=>{G.wallet+=5000;addLog('🌠','Viral Goal — Deals','£5,000 from engagement partnerships.',day);showToast('🌠 Viral! +£5,000','');},
    sportsScience:()=>{
      if(G.wallet<12000){showToast('Not enough money!','err');return;}
      G.wallet-=12000;
      const stats=['pace','shooting','passing','dribbling','defending','physical'];
      const chosen=[];while(chosen.length<3){const s=E.pick(stats);if(!chosen.includes(s))chosen.push(s);}
      chosen.forEach(s=>{G.player.attrs[s]=E.clamp(G.player.attrs[s]+3,0,99);});
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🔬','Sports Science Programme',`${chosen.join(', ')} each improved. £12,000 invested.`,day);
      showToast('🔬 Science works! 3 stats improved','');
    },
    hirePR:()=>{G.wallet-=8000;addLog('📣','PR Firm Hired','£8,000 — controversy managed.',day);showToast('📣 Story killed. £8,000 spent','warn');},
    publicApology:()=>{addLog('😭','Public Apology Issued','Fan trust restored.',day);showToast('👍 Fan trust restored','');},
    ignoreControversy:()=>{addLog('🤐','Ignored Controversy','A week of bad press.',day);showToast('📰 Rough week in the press','warn');},
    hireTaxAccountant:()=>{G.wallet-=10000;addLog('📑','Tax Investigation Resolved','£10,000 paid to specialist. Cleared.',day);showToast('📑 Tax sorted. £10,000 spent','warn');},
    selfHandleTax:()=>{G.wallet-=5000;addLog('⚖️','Tax Penalty','£5,000 penalty for missed details.',day);showToast('❌ £5,000 tax penalty','err');},
    acceptRecordTransfer:()=>{
      const tier=Math.max(1,G.club.tier-1);
      const offerLeague=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
      const pool=[...(CLUBS[tier]||CLUBS[1])].filter(c=>c!==G.club.name);
      const newClub=E.pick(pool);
      const newSalary=Math.round(G.weeklySalary*3);
      const prevClub=G.club.name;
      G.club={name:newClub,tier,leagueId:offerLeague.id,contractYears:4,isFreeAgent:false,contractSignedDay:day};
      G.weeklySalary=newSalary;
      const rtAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[tier]||[60,78];
      G.manager={name:E.pick(MANAGER_NAMES),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(rtAvgRange[0],rtAvgRange[1])};
      G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,tier);
      const nl=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
      // Always different tier (tier-1) so generate fresh league
      G.league={name:nl.name,tier,teams:E.generateLeague(tier,newClub),matchdays:E.scheduleLeague(tier,365).filter(d=>d>day),nextMatchIdx:0};
      G.pendingTransferOffers=[];
      addLog('💎','Record Transfer',`From ${prevClub} to ${newClub} · £${newSalary.toLocaleString()}/wk`,day);
      showToast(`💎 Record transfer! Welcome to ${newClub}!`,'');
    },
    stayLoyal:()=>{G.wallet+=25000;addLog('🏠','Turned Down Record Offer','£25,000 loyalty bonus.',day);showToast('🏠 Loyalty rewarded! +£25,000','');},
    careerEndingInjury:()=>{
      G.careerInjuryMonthsLeft=8;G.injuryDaysLeft=0;G.aclInjured=true;
      addLog('🚑','ACL Rupture','8-month rehabilitation begins.',day);
      showToast('🚑 ACL injury — 8 months out','err');
    },
    retireInjury:()=>{
      G.aclInjured=true;
      addLog('💔','Retired Due to Injury','The injury proved too much.',day);
      showToast('💔 Career ended by injury','err');
      closeModal();
      showModal(`
        <div class="event-modal-header"><span class="event-modal-emoji">💔</span>
          <div class="event-modal-title">Career Over</div>
          <div class="event-modal-subtitle">The ACL injury proved insurmountable. It's time to hang up the boots.</div>
        </div>
        <p style="color:var(--text-dim);font-size:13px;line-height:1.75;margin-bottom:20px;">A tough end to what was a remarkable journey. Your legacy will not be forgotten.</p>
        <button class="btn btn-primary" style="width:100%;padding:14px;font-size:14px;" onclick="saveToHOF();localStorage.removeItem('propath3_save');closeModal();App.goTo(0);">🏆 Enter the Hall of Fame</button>
      `, true);
      return;
    },
    tragicDeath:()=>{saveToHOF();localStorage.removeItem('propath3_save');closeModal();App.goTo(0);showToast('🕯️ A career that will never be forgotten.','');},
    wcPlay:()=>{
      const nat=NATIONS.find(n=>n.name===G.player.nation)||{flag:'🌍'};
      const caps=E.rand(3,7);
      G.careerStats.intlCaps=(G.careerStats.intlCaps||0)+caps;
      G.careerStats.wcAppearances=(G.careerStats.wcAppearances||0)+1;
      const reached=E.rand(0,WC_ROUNDS.length-1);
      const roundName=WC_ROUNDS[reached];
      const isChampion=reached===WC_ROUNDS.length-1;
      if(isChampion){G.careerStats.trophies++;addLog('🌍','World Cup Winner!',`${nat.flag} ${G.player.nation} won it! You made ${caps} appearances.`,day);showToast('🌍🏆 WORLD CUP WINNER!','');}
      else{addLog('🌍',`World Cup — ${roundName}`,`${nat.flag} ${G.player.nation} reached the ${roundName}. You made ${caps} appearances.`,day);showToast(`🌍 World Cup ${roundName} for ${G.player.nation}!`,'');}
      const growth=E.pick(['pace','shooting','passing','dribbling','physical']);
      G.player.attrs[growth]=E.clamp(G.player.attrs[growth]+2,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      checkMilestones([],day);
    },
    wcDecline:()=>{addLog('🌍','World Cup — Pulled Out','You withdrew from the national squad.',day);showToast('🌍 Pulled out of the World Cup','warn');},
    // Extended event handlers — all wired up
    acceptCaptaincy:()=>{G.wallet+=3000;G.careerLog.push({icon:'🏅',title:'Club Captain',detail:`${G.club.name} captain. +£3,000 bonus.`,date:E.getDayLabel(day)});showToast('🏅 You are now club captain! +£3,000','');},
    mentorYouth:()=>{G.wallet+=2000;addLog('🤝','Youth Mentorship','Helped a young talent find confidence. +£2,000 club bonus.',day);showToast('🤝 Mentored the kid. +£2,000','');},
    podcastBonus:()=>{G.wallet+=3000;addLog('🎙️','Podcast Appearance','Profile raised. +£3,000 appearance fee.',day);showToast('🎙️ Great episode! +£3,000','');},
    hatTrickBonus:()=>{G.wallet+=12000;addLog('⚽','Hat-Trick Chairman Bonus','£12,000 exceptional performance bonus.',day);showToast('⚽ Chairman bonus! +£12,000','');},
    nutritionBoost:()=>{
      G.player.attrs.physical=E.clamp(G.player.attrs.physical+3,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🥗','Nutritionist Programme','Physical +3 from the tailored diet plan.',day);
      showToast('🥗 Physical improved by +3!','');
    },
    extraGym:()=>{
      const stat=E.pick(['pace','physical','defending']);
      G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🏋️','Extra Gym Session',`Good use of the free day. ${stat} +1.`,day);
      showToast(`🏋️ ${stat} improved! +1`,'');
    },
    rumourFuel:()=>{
      G.weeklySalary+=1000;
      addLog('📰','Transfer Rumour Leverage','Wage pressure worked. +£1,000/wk.',day);
      showToast('💰 Wages up £1,000/wk from the pressure!','');
    },
    penaltyHero:()=>{
      G.wallet+=500;
      G.careerStats.goals++;G.seasonStats.goals++;
      addLog('🥅','Penalty Hero','You stepped up and scored. Club bonus paid.',day);
      showToast('🥅 Penalty scored! +£500 bonus','');
    },
    analyticsBoost:()=>{
      G.player.attrs.passing=E.clamp(G.player.attrs.passing+2,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('📊','Analytics-Driven Improvement','Passing +2 from data-driven adjustments.',day);
      showToast('📊 Passing improved +2 from data insights!','');
    },
    autobioBoost:()=>{G.wallet+=20000;addLog('📖','Book Deal Signed','£20,000 advance received.',day);showToast('📖 Book deal! +£20,000 advance','');},
    // ── Newest batch ─────────────────────────────────────────
    derbyFireUp:()=>{
      const stat=E.pick(['pace','shooting','dribbling','physical']);
      G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('⚔️','Derby Intensity',`Fired up. ${stat} +1 for the season.`,day);
      showToast(`⚔️ Derby fire! ${stat} +1`,'');
    },
    earlyReturn:()=>{
      G.injuryDaysLeft=Math.max(0,(G.injuryDaysLeft||0)-10);
      addLog('💉','Early Clearance','Passed all tests. Back 10 days early.',day);
      showToast('💉 Cleared early! Back in training','');
    },
    fanLetterReply:()=>{addLog('💌','Fan Letter — Training Invite','She came. The whole squad was moved.',day);showToast('💌 A day nobody will forget','');},
    fanLetterCall:()=>{addLog('💌','Fan Letter — Phone Call','She couldn\'t believe it. Pure joy.',day);showToast('💌 You made her year','');},
    deadlineDaySign:()=>{
      G.weeklySalary+=1500;G.club.contractSignedDay=day;
      addLog('⏰','Deadline Day Transfer','New contract. +£1,500/wk.',day);
      showToast('⏰ Deadline day move! +£1,500/wk','');
    },
    wonAward:()=>{
      G.wallet+=5000;
      addLog('🏅','Player of the Month','Won it! £5,000 prize money.',day);
      showToast('🏅 Player of the Month! +£5,000','');
    },
    financialAdvisor:()=>{
      if(G.wallet<15000){showToast('Not enough funds!','err');return;}
      G.wallet-=15000;G.passiveIncome+=500;
      addLog('💹','Financial Advisor Hired','£15,000 fee. Passive income +£500/wk permanently.',day);
      showToast('💹 Smart money. +£500/wk passive income!','');
    },
    confrontManager:()=>{
      G.forcedStarter=14;
      addLog('😤','Manager Confrontation','Respect earned. Starting for 2 weeks.',day);
      showToast('😤 Stood your ground! Starting XI for 2 weeks','');
    },
    requestListingFromRow:()=>{activateTransferList();},
    mediaDayFun:()=>{G.wallet+=2000;addLog('📸','Media Day','Good energy. +£2,000 social uplift.',day);showToast('📸 Fans loved it! +£2,000','');},
    cryoTherapy:()=>{
      G.injuryDaysLeft=Math.max(0,(G.injuryDaysLeft||0)-3);
      const stat=E.pick(['physical','pace']);
      G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🧊','Cryotherapy Programme',`Recovery accelerated. ${stat} +1.`,day);
      showToast('🧊 Body feels like new! +1 '+stat,'');
    },
    friendlyCap:()=>{
      G.careerStats.intlCaps=(G.careerStats.intlCaps||0)+1;
      G.wallet+=1000;
      addLog('🌍','International Friendly','1 cap earned. £1,000 appearance fee.',day);
      showToast('🌍 International cap! +£1,000','');
    },
    agentDeal:()=>{addLog('🤵','Agent Re-signed','He stays. Bigger network, better opportunities.',day);showToast('🤵 Agent re-signed. Better deals incoming','');},
    newAgent:()=>{G.agentUpgraded=false;addLog('🔄','New Agent Signed','Fresh relationship. Same terms.',day);showToast('🔄 Fresh start with a new agent','');},
    legendsDinner:()=>{
      G.wallet+=3000;
      addLog('🍽️','Legends Dinner','An unforgettable evening. +£3,000.',day);
      showToast('🍽️ Once in a lifetime! +£3,000','');
    },
    charityRun:()=>{
      G.player.attrs.physical=E.clamp(G.player.attrs.physical+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🏃','Charity Marathon','Crossed the finish line. Physical +1.',day);
      showToast('🏃 Marathon done! Physical +1','');
    },
    foreignLeagueMove:()=>{
      const newSalary=Math.round(G.weeklySalary*2.5);
      const tier=Math.max(1,G.club.tier);
      const pool=[...(CLUBS[tier]||CLUBS[2])].filter(c=>c!==G.club.name);
      const newClub=E.pick(pool);
      const prevClub=G.club.name;
      G.club={...G.club,name:newClub,contractSignedDay:day,contractYears:3};
      G.weeklySalary=newSalary;
      const tAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[tier]||[60,78];
      G.manager={name:E.pick(MANAGER_NAMES),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(tAvgRange[0],tAvgRange[1])};
      addLog('🌐','Foreign League Move',`From ${prevClub} to ${newClub}. £${newSalary.toLocaleString()}/wk`,day);
      showToast(`🌐 Life-changing move! £${newSalary.toLocaleString()}/wk`,'');
    },
  };

  if(fnName==='showBetUI'){G.pendingEvent=null;closeModal();setTimeout(()=>UI.showBetModal(),50);return;}
  if(fnName==='retireInjury'){actions.retireInjury();return;} // returns early inside, doesn't hit closeModal below
  if(actions[fnName])actions[fnName]();
  else console.warn('Unknown event action:',fnName);
  closeModal();
  App.renderDashboard();
}

function addLog(icon,title,detail,day){G.careerLog.push({icon,title,detail,date:E.getDayLabel(day)});}

// ── Transfer Offers ───────────────────────────────────────────
function maybeGenerateTransferOffer(day){
  if(!E.chance(G.agentUpgraded?0.12:0.06))return;
  const offerTier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
  const offerLeague=LEAGUES.find(l=>l.tier===offerTier)||LEAGUES[0];
  // FIX: Prevent same club making duplicate offers
  const usedClubs=new Set(G.pendingTransferOffers.map(o=>o.fromClub));
  const pool=[...(CLUBS[offerTier]||CLUBS[3])].filter(c=>c!==G.club.name&&!usedClubs.has(c));
  if(!pool.length)return;
  const offerClub=E.pick(pool);
  const offerId=`offer_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  const salary=Math.round(offerLeague.salary*(0.85+Math.random()*.45));
  G.pendingTransferOffers.push({id:offerId,fromClub:offerClub,tier:offerTier,league:offerLeague.name,salary,contractYears:E.rand(1,4),expires:day+30,saved:false});
  G.careerLog.push({icon:'📬',title:'Transfer Offer Received!',detail:`${offerClub} want to sign you`,date:E.getDayLabel(day)});
  showToast(`📬 Transfer offer from ${offerClub}!`,'');
  UI.updateTransferBadge();
}

function acceptTransferOffer(offerId){
  const offer=G.pendingTransferOffers.find(o=>o.id===offerId);
  if(!offer)return;
  const prevClub=G.club.name;
  const day=G.season.dayOfSeason;
  G.club={name:offer.fromClub,tier:offer.tier,leagueId:LEAGUES.find(l=>l.tier===offer.tier)?.id||'L3',contractYears:offer.contractYears,isFreeAgent:false,contractSignedDay:day};
  G.weeklySalary=offer.salary;
  G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,offer.tier);
  const tAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[offer.tier]||[60,78];
  G.manager={name:E.pick(MANAGER_NAMES),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(tAvgRange[0],tAvgRange[1])};
  G.careerLog.push({icon:'✈️',title:`Transferred to ${offer.fromClub}`,detail:`From ${prevClub} · ${offer.league} · £${offer.salary.toLocaleString()}/wk`,date:E.getDayLabel(day)});
  G.pendingTransferOffers=[];

  const newLeague=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];

  if(offer.tier===G.league.tier){
    // Same tier — preserve all existing table data, just mark new club as the player's
    const existingTeams=G.league.teams;
    // Un-mark old player team
    const oldTeam=existingTeams.find(t=>t.isPlayer);
    if(oldTeam)oldTeam.isPlayer=false;
    // Check if new club is already in the table (it should be)
    const newTeam=existingTeams.find(t=>t.name===offer.fromClub);
    if(newTeam){
      newTeam.isPlayer=true;
    } else {
      // Club not in the table — add fresh entry
      existingTeams.push({name:offer.fromClub,isPlayer:true,ovr:E.rand(tAvgRange[0],tAvgRange[1]),pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]});
    }
    const remainingMatchdays=G.league.matchdays.filter(d=>d>day);
    G.league={
      name:newLeague.name,tier:G.club.tier,
      teams:existingTeams,
      matchdays:remainingMatchdays.length>0?remainingMatchdays:E.scheduleLeague(G.club.tier,365-day),
      nextMatchIdx:0,
    };
  } else {
    // Different tier — must generate new league
    const remainingMatchdays=G.league.matchdays.filter(d=>d>day);
    G.league={
      name:newLeague.name,tier:G.club.tier,
      teams:E.generateLeague(G.club.tier,G.club.name),
      matchdays:remainingMatchdays.length>0?E.scheduleLeague(G.club.tier,365).filter(d=>d>day):E.scheduleLeague(G.club.tier,365-day),
      nextMatchIdx:0,
    };
  }
  G.cups=E.scheduleCups(G.club.tier);
  showToast(`✈️ Welcome to ${offer.fromClub}! Manager: ${G.manager.name}`,'');
  App.renderDashboard();closeModal();
}

function declineTransferOffer(offerId){
  G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>o.id!==offerId);
  G.careerLog.push({icon:'🚫',title:'Transfer Declined',detail:'You chose to stay put.',date:E.getDayLabel(G.season.dayOfSeason)});
  App.renderDashboard();
}

function saveOfferForLater(offerId){
  const o=G.pendingTransferOffers.find(x=>x.id===offerId);
  if(o)o.saved=true;
  closeModal();showToast('📋 Offer saved — check the Offers tab','');App.renderDashboard();
}

// ── Manager Interaction ───────────────────────────────────────
function requestNewContract(){
  const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
  const day=G.season.dayOfSeason;
  // Normalise stored days — old saves may lack these fields
  const signedDay=Number.isFinite(G.club.contractSignedDay)?G.club.contractSignedDay:-9999;
  const offeredDay=Number.isFinite(G._contractOfferedDay)?G._contractOfferedDay:-9999;
  const daysSinceSigned=day-signedDay;
  const daysSinceOffered=day-offeredDay;
  // 6-month cooldown after signing (180 days)
  if(daysSinceSigned>=0&&daysSinceSigned<180){
    const daysLeft=180-daysSinceSigned;
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">⏳</span><div class="event-modal-title">Too Soon</div><div class="event-modal-subtitle">You just signed a contract. The club won't renegotiate for 6 months.</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">Come back in approximately <strong>${daysLeft}</strong> more days.</p>
    <div class="event-choices"><button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">👍 Understood</div><div class="ec-outcome" style="color:var(--text-dim)">Keep working.</div></button></div>`);
    return;
  }
  // 30-day cooldown after viewing/declining an offer
  if(daysSinceOffered>=0&&daysSinceOffered<30){
    const daysLeft=30-daysSinceOffered;
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">⏳</span><div class="event-modal-title">Not Yet</div><div class="event-modal-subtitle">You recently declined an offer. Give the club some time.</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">Come back in <strong>${daysLeft}</strong> more days.</p>
    <div class="event-choices"><button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">👍 OK</div></button></div>`);
    return;
  }
  if(op.opinion==='poor'||op.opinion==='sceptical'){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">😕</span><div class="event-modal-title">Request Denied</div><div class="event-modal-subtitle">"Look, I'll be honest — you're not quite at the level I need right now." — ${G.manager.name}</div></div>
    <div class="event-choices"><button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">👍 Understood, Manager</div><div class="ec-outcome" style="color:var(--text-dim)">Back to training — you have work to do.</div></button></div>`);
    return;
  }
  // Lock from re-requesting until this offer is accepted or dismissed
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
    <button class="event-choice gold" onclick="signNewContract(${newSalary},${years})"><div class="ec-label" style="color:var(--text)">✍️ Sign the contract</div><div class="ec-outcome" style="color:var(--text-dim)">Secure your future at ${G.club.name}.</div></button>
    <button class="event-choice" onclick="dismissContractOffer()"><div class="ec-label" style="color:var(--text)">🤔 Decline offer</div><div class="ec-outcome" style="color:var(--text-dim)">You won't be able to request again for 30 days.</div></button>
  </div>`);
  // Mark a cooldown even for viewing the offer — prevents re-opening it 10 times
  G._contractOfferedDay=day;
}

function dismissContractOffer(){
  // 30-day cooldown on declining — stored separately from contractSignedDay
  G._contractOfferedDay=G.season.dayOfSeason;
  closeModal();showToast('📋 Offer declined — come back in 30 days','');App.renderDashboard();
}

function signNewContract(salary,years){
  G.weeklySalary=salary;G.club.contractYears=years;
  G.club.contractSignedDay=G.season.dayOfSeason;
  G._contractOfferedDay=null;
  addLog('✍️','Contract Signed',`£${salary.toLocaleString()}/wk · ${years}-year deal`,G.season.dayOfSeason);
  showToast('✍️ Contract signed!','');closeModal();App.renderDashboard();
}

function requestTransferListing(){
  const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
  const day=G.season.dayOfSeason;
  const diff=G.player.overall-G.manager.teamAvgOVR;
  if(diff>=12){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🌟</span><div class="event-modal-title">You're Too Good For This Club</div><div class="event-modal-subtitle">"I can't hold you back." — ${G.manager.name}</div></div>
    <div class="event-choices"><button class="event-choice gold" onclick="activateTransferList()"><div class="ec-label" style="color:var(--text)">📋 Go on the list</div><div class="ec-outcome" style="color:var(--text-dim)">Your agent contacts clubs immediately.</div></button><button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">↩ Stay loyal for now</div><div class="ec-outcome" style="color:var(--text-dim)">For now.</div></button></div>`);
    return;
  }
  if(diff>=6){
    const buyout=Math.round(G.weeklySalary*4);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">💼</span><div class="event-modal-title">Manager is Reluctant</div><div class="event-modal-subtitle">"I can see you're ready for more." — ${G.manager.name}</div></div>
    <div class="event-choices">
      <button class="event-choice gold" onclick="activateTransferList()"><div class="ec-label" style="color:var(--text)">🗣️ Push hard — demand a listing</div><div class="ec-outcome" style="color:var(--text-dim)">Force the issue.</div></button>
      <button class="event-choice" onclick="payBuyout(${buyout})"><div class="ec-label" style="color:var(--text)">💰 Pay contract clause — £${buyout.toLocaleString()}</div><div class="ec-outcome" style="color:var(--text-dim)">Clean break.</div></button>
      <button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">↩ Back down</div><div class="ec-outcome" style="color:var(--text-dim)">Bide your time.</div></button>
    </div>`);
    return;
  }
  if(op.opinion==='favourable'||op.opinion==='good'){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">😤</span><div class="event-modal-title">Request Denied</div><div class="event-modal-subtitle">"I'm not selling you — you're too important." — ${G.manager.name}</div></div>
    <div class="event-choices"><button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">👍 Understood</div><div class="ec-outcome" style="color:var(--text-dim)">Your time will come.</div></button></div>`);
    return;
  }
  showModal(`<div class="event-modal-header"><span class="event-modal-emoji">📋</span><div class="event-modal-title">Transfer Listed</div><div class="event-modal-subtitle">"If the right offer comes in, we'll discuss it." — ${G.manager.name}</div></div>
  <div class="event-choices">
    <button class="event-choice gold" onclick="activateTransferList()"><div class="ec-label" style="color:var(--text)">📋 Confirm transfer listing</div><div class="ec-outcome" style="color:var(--text-dim)">Your agent gets to work immediately.</div></button>
    <button class="event-choice" onclick="closeModal()"><div class="ec-label" style="color:var(--text)">↩ Change of heart</div><div class="ec-outcome" style="color:var(--text-dim)">You'll stay and compete.</div></button>
  </div>`);
}

function payBuyout(amount){
  if(G.wallet<amount){showToast('Not enough money for the buyout!','err');return;}
  G.wallet-=amount;addLog('💰','Contract Buyout Paid',`£${amount.toLocaleString()} paid — now on the transfer list.`,G.season.dayOfSeason);
  activateTransferList();
}

function activateTransferList(){
  const diff=G.player.overall-G.manager.teamAvgOVR;
  const n=diff>=12?E.rand(4,6):diff>=6?E.rand(3,5):E.rand(2,4);
  const tierBias=diff>=12?-2:diff>=6?-1:0;
  const usedClubs=new Set(G.pendingTransferOffers.map(o=>o.fromClub));
  for(let i=0;i<n;i++){
    const offerTier=E.clamp(G.club.tier+tierBias+E.rand(-1,1),1,5);
    const offerLeague=LEAGUES.find(l=>l.tier===offerTier)||LEAGUES[0];
    const pool=[...(CLUBS[offerTier]||CLUBS[3])].filter(c=>c!==G.club.name&&!usedClubs.has(c));
    if(!pool.length)continue;
    const offerClub=E.pick(pool);usedClubs.add(offerClub);
    const salary=Math.round(offerLeague.salary*(0.85+Math.random()*.45));
    G.pendingTransferOffers.push({id:`tl_${Date.now()}_${i}`,fromClub:offerClub,tier:offerTier,league:offerLeague.name,salary,contractYears:E.rand(2,4),expires:G.season.dayOfSeason+45,saved:false});
  }
  addLog('📋','Transfer Listed','On the market. Enquiries flooding in.',G.season.dayOfSeason);
  closeModal();showToast(`📋 Transfer listed — ${n} clubs interested!`,'');
  UI.updateTransferBadge();App.renderDashboard();
}

// ── Season End ────────────────────────────────────────────────
function getSortedTable(){return[...G.league.teams].sort((a,b)=>b.pts-a.pts||(b.gd-a.gd)||(b.gf-a.gf));}
function getLeaguePosition(){return getSortedTable().findIndex(t=>t.isPlayer)+1;}

function endSeason(){
  G.season.finished=true;G.careerStats.seasons++;
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
  G.club.contractYears--;
  if(G.club.contractYears<=0&&!G.club.isFreeAgent){
    const pos=getLeaguePosition();
    const poorPerf=pos>Math.floor(G.league.teams.length*.6)&&G.player.overall<58;
    if(poorPerf){G.club.isFreeAgent=true;G.club.name='Free Agent';G.careerLog.push({icon:'🔓',title:'Released',detail:'Club did not renew your contract.',date:'End of Season'});}
    else{G.club.contractYears=E.rand(2,4);G.weeklySalary=Math.round(G.weeklySalary*E.rand(105,122)/100);G.careerLog.push({icon:'✍️',title:'Contract Auto-Renewed',detail:`£${G.weeklySalary.toLocaleString()}/wk · ${G.club.contractYears} years`,date:'End of Season'});}
  }
  G.player.age++;
  // Reset WC tracker for new season year
  G.wcYear=null;
  if(G.player.age>=34){
    try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));}catch(e){}
    UI.showAgeCapModal();return;
  }
  try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));showToast('💾 Season autosaved','');}catch(e){}
  UI.showSeasonEndModal();
}

function checkLeagueResult(){
  const sorted=getSortedTable();
  const myPos=sorted.findIndex(t=>t.isPlayer)+1;
  const league=LEAGUES.find(l=>l.tier===G.club.tier);if(!league)return;
  if(G.club.tier>1&&myPos<=league.promoted){G.club.tier--;const nl=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];G.club.leagueId=nl.id;G.weeklySalary=Math.round(G.weeklySalary*1.22);G.careerLog.push({icon:'🚀',title:'Promoted!',detail:`Moving up to ${nl.name}`,date:'End of Season'});G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,G.club.tier);}
  else if(league.relegated&&G.club.tier<5&&myPos>sorted.length-league.relegated){G.club.tier++;const nl=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];G.club.leagueId=nl.id;G.weeklySalary=Math.round(G.weeklySalary*.85);G.careerLog.push({icon:'📉',title:'Relegated',detail:`Dropped to ${nl.name}`,date:'End of Season'});}
  if(myPos===1){G.careerStats.trophies++;G.careerLog.push({icon:'🏆',title:`${G.league.name} Champions!`,detail:'Finished top of the league!',date:'End of Season'});}
}

function startNewSeason(){
  closeModal();if(G.club.isFreeAgent){UI.showFreeAgentOffers();return;}
  G.season={number:G.season.number+1,startYear:G.season.startYear+1,dayOfSeason:0,totalDays:365,finished:false};
  G.seasonStats={goals:0,assists:0,apps:0,motm:0,yellows:0,reds:0,wins:0,draws:0,losses:0,ratingSum:0,ratingCount:0,avgRating:0,cleanSheets:0};
  G.dayLog=[];G.matchHistory=[];G.form=[];G.injuryDaysLeft=0;G.forcedStarter=0;G.pendingEvent=null;G.wcYear=null;
  const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
  G.league={name:league.name,tier:G.club.tier,teams:E.generateLeague(G.club.tier,G.club.name),matchdays:E.scheduleLeague(G.club.tier,365),nextMatchIdx:0};
  G.cups=E.scheduleCups(G.club.tier);
  const newTierAvg={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[G.club.tier]||[60,78];
  G.manager.teamAvgOVR=E.rand(newTierAvg[0],newTierAvg[1]);
  G.careerLog.push({icon:'🔄',title:`Season ${G.season.number} Begins`,detail:`${G.club.name} · ${league.name}`,date:'Pre-Season'});
  App.renderDashboard();showToast('🆕 New season started!','');
}

// ── Investments ───────────────────────────────────────────────
function purchaseInvestment(invId){
  const inv=INVESTMENTS.find(i=>i.id===invId);if(!inv)return;
  if(G.investments.includes(invId)){showToast('Already owned!','warn');return;}
  if(G.wallet<inv.cost){showToast('Not enough money!','err');return;}
  G.wallet-=inv.cost;G.investments.push(invId);G.passiveIncome+=inv.weeklyReturn;
  addLog(inv.icon,`Purchased: ${inv.name}`,`+£${inv.weeklyReturn.toLocaleString()}/wk passive income`,G.season.dayOfSeason);
  showToast(`${inv.icon} ${inv.name} purchased! +£${inv.weeklyReturn.toLocaleString()}/wk`,'');
  App.renderDashboard();
}

// ── Free Agent ────────────────────────────────────────────────
function generateFreeAgentOffers(){
  const offers=[];const n=E.rand(3,5);
  for(let i=0;i<n;i++){
    let tier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
    const league=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
    const club=E.pick(CLUBS[tier]||CLUBS[3]);
    offers.push({id:`fa_${i}`,fromClub:club,tier,league:league.name,salary:Math.round(league.salary*(0.8+Math.random()*.4)),contractYears:E.rand(1,3)});
  }
  return offers;
}
function signFreeAgent(offerId){
  const offer=G._faOffers?.find(o=>o.id===offerId);if(!offer)return;
  G.club={name:offer.fromClub,tier:offer.tier,leagueId:LEAGUES.find(l=>l.tier===offer.tier)?.id||'L4',contractYears:offer.contractYears,isFreeAgent:false,contractSignedDay:G.season.dayOfSeason};
  G.weeklySalary=offer.salary;G.manager={name:E.pick(MANAGER_NAMES),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(58,78)};
  G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,offer.tier);
  G.careerLog.push({icon:'✍️',title:`Signed for ${offer.fromClub}`,detail:`${offer.league} · £${offer.salary.toLocaleString()}/wk`,date:E.getDayLabel(G.season.dayOfSeason)});
  closeModal();startNewSeason();
}

// ── Save / Load / HOF ─────────────────────────────────────────
function saveGame(){
  try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));showToast('💾 Game saved!','');}
  catch(e){showToast('❌ Save failed','err');}
}

function loadGame(){
  try{
    const raw=localStorage.getItem('propath3_save');if(!raw){showToast('No save found.','warn');return;}
    const s=JSON.parse(raw);s.achievements=new Set(s.achievements||[]);s.triggeredEvents=new Set(s.triggeredEvents||[]);G=s;
    App.goTo(5);showToast('✅ Career loaded!','');
    if(G.season?.finished)setTimeout(()=>{if(G.player.age>=34)UI.showAgeCapModal();else UI.showSeasonEndModal();},400);
  }catch(e){showToast('❌ Load failed','err');}
}

function getHOF(){
  try{
    const raw=JSON.parse(localStorage.getItem('propath3_hof')||'[]');
    // Backfill ids for old entries that don't have one
    let dirty=false;
    raw.forEach((e,i)=>{if(!e.id){e.id=`hof_legacy_${i}_${Date.now()}`;dirty=true;}});
    if(dirty)localStorage.setItem('propath3_hof',JSON.stringify(raw));
    return raw;
  }catch{return[];}
}

function saveToHOF(){
  const hof=getHOF();
  const nat=NATIONS.find(n=>n.name===G.player.nation)||{flag:'🌍'};
  hof.push({
    id:`hof_${Date.now()}`,
    name:`${G.player.firstName} ${G.player.lastName}`,flag:nat.flag,
    nation:G.player.nation,position:G.player.position,age:G.player.age,
    goals:G.careerStats.goals,assists:G.careerStats.assists,apps:G.careerStats.apps,
    trophies:G.careerStats.trophies,seasons:G.careerStats.seasons,bestOVR:G.careerStats.bestOVR,
    investments:G.investments.length,intlCaps:G.careerStats.intlCaps||0,
    highestLeague:LEAGUES.find(l=>l.tier===G.careerStats.highestLeague)?.name||'—',
    date:new Date().getFullYear(),
  });
  localStorage.setItem('propath3_hof',JSON.stringify(hof.slice(-20)));
}

function deleteHOFEntry(id){
  const hof=getHOF().filter(e=>e.id!==id);
  localStorage.setItem('propath3_hof',JSON.stringify(hof));
}

// ── Career Extension (Age Cap) ────────────────────────────────
const EXTENSION_COSTS=[500000,900000,1500000,2500000,4000000,6000000];
const EXTENSION_LABELS=['34→35','35→36','36→37','37→38','38→39','39→40'];
function getExtensionIndex(){return Math.max(0,G.player.age-34);}

function extendCareer(){
  const idx=getExtensionIndex();
  if(idx>=EXTENSION_COSTS.length){showToast('Career cannot be extended further.','warn');return;}
  const cost=EXTENSION_COSTS[idx];
  if(G.wallet<cost){showToast(`Need £${cost.toLocaleString()} — not enough funds!`,'err');return;}
  G.wallet-=cost;G.player.ageCapExtensions=(G.player.ageCapExtensions||0)+1;
  addLog('⏳','Career Extension Paid',`£${cost.toLocaleString()} — playing on for another season.`,G.season.dayOfSeason);
  showToast(`⏳ Career extended! Playing on at age ${G.player.age}.`,'');
  try{const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};localStorage.setItem('propath3_save',JSON.stringify(s));}catch(e){}
  UI.showSeasonEndModal();
}

function resolveBet(outcome,amount){
  if(amount<=0||amount>G.wallet){showToast('Invalid bet amount','err');return;}
  const odds={win:2.1,draw:3.4,lose:4.0};
  const opp=G.league.teams.find(t=>!t.isPlayer)||{ovr:65};
  const r=E.simulateAIMatch({ovr:G.manager.teamAvgOVR},{ovr:opp.ovr});
  const actualResult=r.hg>r.ag?'win':r.hg<r.ag?'lose':'draw';
  const won=outcome===actualResult;
  if(won){const payout=Math.floor(amount*odds[outcome]);G.wallet+=payout-amount;addLog('🎰','Bet Won!',`Backed a ${outcome} · +£${(payout-amount).toLocaleString()}`,G.season.dayOfSeason);showToast(`🎰 Won! +£${(payout-amount).toLocaleString()}!`,'');}
  else{G.wallet-=amount;addLog('🎰','Bet Lost',`Backed a ${outcome} · -£${amount.toLocaleString()}`,G.season.dayOfSeason);showToast(`😬 Lost the bet. -£${amount.toLocaleString()}`,'err');}
  closeModal();App.renderDashboard();
}
