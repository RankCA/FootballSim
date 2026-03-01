// ════════════════════════════════════════════════════════════
//  ProPath v4 — state.js
// ════════════════════════════════════════════════════════════

let G={};

function initGame(draft){
  const attrs=draft.attrs||E.buildAttrs(draft.position,draft.age,draft.trait);
  const ovr=draft.overall||E.calcOVR(attrs,draft.position);
  const pot=draft.potential||E.calcPotential(ovr,draft.age);
  // Use player-chosen club if set in step 4, else auto-assign
  const _auto=assignStartClub(draft.age,ovr);
  let startClub, league;
  if(draft.startClub&&draft.startTier==='foreign'&&draft.startForeignLeagueId){
    // Foreign league start
    const fl=(typeof FOREIGN_LEAGUES!=='undefined'?FOREIGN_LEAGUES:[]).find(f=>f.id===draft.startForeignLeagueId);
    startClub={clubName:draft.startClub,tier:1,name:(fl?`${fl.flag} ${fl.name}`:'Foreign League'),isForeign:true,foreignLeagueId:draft.startForeignLeagueId,flClubs:fl?.clubs||[]};
    league=LEAGUES.find(l=>l.tier===1)||LEAGUES[0];
  } else if(draft.startClub&&draft.startTier&&draft.startTier!=='foreign'){
    const chosenTier=Number(draft.startTier)||_auto.tier;
    const chosenLeague=LEAGUES.find(l=>l.tier===chosenTier)||LEAGUES[0];
    startClub={clubName:draft.startClub,tier:chosenTier,name:chosenLeague.name,id:chosenLeague.id};
    league=chosenLeague;
  } else {
    startClub=_auto;
    league=LEAGUES.find(l=>l.tier===startClub.tier)||LEAGUES[0];
  }
  const year=new Date().getFullYear();

  // For foreign clubs, generate league using that foreign league's clubs
  const initLeagueTeams=startClub.isForeign&&startClub.flClubs?.length
    ?_generateForeignLeague(startClub.clubName, startClub.flClubs)
    :E.generateLeague(startClub.tier, startClub.clubName);
  const initLeagueName=startClub.isForeign?startClub.name:league.name;

  G={
    player:{firstName:draft.firstName,lastName:draft.lastName,nickname:draft.nickname||'',age:draft.age,nation:draft.nation,position:draft.position,foot:draft.foot,trait:draft.trait,attrs,overall:ovr,potential:pot,ageCapExtensions:0},
    club:{name:startClub.clubName,tier:startClub.tier,leagueId:league.id,contractYears:3,isFreeAgent:false,contractSignedDay:-999,isForeign:!!startClub.isForeign,foreignLeagueId:startClub.foreignLeagueId||null},
    manager:(()=>{const r={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[startClub.tier]||[58,74];return{name:_getManagerName(startClub.name),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(r[0],r[1])};})(),
    wallet:startClub.salary*6,weeklySalary:E.ovrWage(ovr,startClub.tier),passiveIncome:0,investments:[],
    season:{number:1,startYear:year,dayOfSeason:0,totalDays:365,finished:false},
    seasonStats:{goals:0,assists:0,apps:0,motm:0,yellows:0,reds:0,wins:0,draws:0,losses:0,ratingSum:0,ratingCount:0,avgRating:0,cleanSheets:0},
    careerStats:{goals:0,assists:0,apps:0,motm:0,seasons:0,trophies:0,reds:0,bestOVR:ovr,highestLeague:startClub.tier,intlCaps:0,wcAppearances:0},
    achievements:new Set(),careerLog:[],dayLog:[],matchHistory:[],
    pendingTransferOffers:[],
    league:{name:initLeagueName,tier:startClub.tier,teams:initLeagueTeams,matchdays:E.scheduleLeague(startClub.tier,365),nextMatchIdx:0,fixtures:null},
    cups:E.scheduleCups(startClub.tier, startClub.clubName, 99),
    form:[],injuryDaysLeft:0,careerInjuryMonthsLeft:0,forcedStarter:0,morale:65,brand:0,
    agentUpgraded:false,triggeredEvents:new Set(),pendingEvent:null,
    loanActive:false,loanDaysLeft:0,loanOriginalClub:null,wcYear:null,
  };
  G.allLeagues=E.generateAllLeagues(startClub.clubName,startClub.tier);
  G.careerLog.push({icon:'⚽',title:'Career Begins',detail:`${draft.firstName} ${draft.lastName} signs for ${startClub.clubName}`,date:'Pre-Season'});
}

function assignStartClub(age,ovr){
  let tier=5;
  if(ovr>=72)tier=1; else if(ovr>=68)tier=2; else if(ovr>=64)tier=3; else if(ovr>=60)tier=4;
  if(age<=17)tier=Math.max(tier,5);
  const league=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
  return{...league,clubName:E.pick(CLUBS[tier])};
}

// ── Manager name helper — reads from CLUB_DATA in clubs.js ──────────────────
function _getManagerName(clubName){
  if(typeof CLUB_DATA!=='undefined'&&CLUB_DATA[clubName]&&CLUB_DATA[clubName].manager){
    return CLUB_DATA[clubName].manager;
  }
  return typeof MANAGER_NAMES!=='undefined'?E.pick(MANAGER_NAMES):'The Gaffer';
}

function _generateForeignLeague(myClubName, flClubs){
  // Build a 20-team league from the foreign league's clubs
  const pool=flClubs.filter(c=>c!==myClubName);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const aiClubs=pool.slice(0,19);
  const teams=[{name:myClubName,isPlayer:true,ovr:E.rand(76,90),pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]}];
  for(const name of aiClubs)teams.push({name,isPlayer:false,ovr:E.rand(74,91),pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]});
  return teams;
}

// Advance the bracket after a round completes (called from simulateCupMatch after player match).
// Builds next round from winners of completed round.
function _advanceCupBracket(cup,cupDef,playerClubName){
  const completedRound=cup.bracketRounds[cup.stage-1]; // just-completed round
  if(!completedRound)return;
  // Gather survivors from the completed round
  const survivors=completedRound.matches
    .filter(m=>m.away!=='BYE'||m.winner)
    .map(m=>m.winner)
    .filter(Boolean);
  if(survivors.length<=1||cup.stage>=cupDef.rounds.length)return; // tournament over
  const nextRoundName=cupDef.rounds[cup.stage];
  const nextRound=_buildCupRound(survivors,playerClubName,nextRoundName);
  cup.bracketRounds.push(nextRound);
}

// ── Day Simulation ────────────────────────────────────────────
// NOTE: simulateDay does NOT increment dayOfSeason — app.js does that
function simulateDay(){
  const day=G.season.dayOfSeason;
  const phase=E.getSeasonPhase(day);
  const events=[];

  // Loan countdown and auto-return
  if(G.loanActive&&G.loanDaysLeft>0){
    G.loanDaysLeft--;
    if(G.loanDaysLeft===0){
      // Return to parent club
      const orig=G.loanOriginalClub;
      if(orig){
        G.club={name:orig.name,tier:orig.tier,leagueId:orig.leagueId,contractYears:orig.contractYears,isFreeAgent:false,contractSignedDay:orig.contractSignedDay};
        G.manager={...orig.manager};
        G.league={name:orig.league.name,tier:orig.league.tier,teams:orig.league.teams,matchdays:orig.league.matchdays,nextMatchIdx:orig.league.nextMatchIdx,fixtures:null};
        G.loanOriginalClub=null;
      }
      G.loanActive=false;G.forcedStarter=0;G._loanRecallUsed=false;
      // Loan growth bonus: 3 random stats improve
      for(let i=0;i<3;i++){const g=simulateGrowth();if(g)events.push(g);}
      addLog('🏠','Loan Recalled',`Returned to ${G.club.name}. Growth accelerated by the experience.`,day);
      showToast(`🏠 Loan over — back at ${G.club.name}!`,'');
      events.push({type:'career',icon:'🏠',title:'Loan Recalled',detail:`Returned to ${G.club.name}. 3 stats improved from the experience.`});
    }
  }

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

  // Regular injury note — the match-day block below handles actual match logic
  // (moved to after match-day check so AI match still runs when injured)

  // Weekly wages
  if(day>0&&day%7===0&&!G.club.isFreeAgent){
    G.wallet+=G.weeklySalary;
    let det=`+£${G.weeklySalary.toLocaleString()} wages received.`;
    if(G.passiveIncome>0){G.wallet+=G.passiveIncome;det+=` +£${G.passiveIncome.toLocaleString()} investment returns.`;}
    events.push({type:'salary',icon:'💰',title:'Weekly Payment',detail:det});
  }

  // Transfer offer expiry — offers only expire at the end of a window
  // If currently inside a window, expire offers whose window-end has passed
  // If outside a window, keep all offers alive until the next window closes
  const inWindow=isInTransferWindow(day);
  G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>{
    // Only expire if we've passed the offer's expiry day AND we're in a window
    // (so offers received outside a window survive until a window opens and closes)
    if(o.expires<=day&&inWindow){
      G.careerLog.push({icon:'⌛',title:'Transfer Offer Expired',detail:`${o.fromClub}'s offer lapsed`,date:E.getDayLabel(day)});
      return false;
    }
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

  // Skip matches if injured — push a recovery event instead
  if(G.injuryDaysLeft>0||G.careerInjuryMonthsLeft>0){
    G.injuryDaysLeft=Math.max(0,G.injuryDaysLeft-1);
    events.push({type:'injury',icon:'🤕',title:'Recovery Day',detail:`Physio and pool sessions. Missed today's fixture. ${G.injuryDaysLeft} day${G.injuryDaysLeft!==1?'s':''} remaining.`});
    return{events,blockingEvent:null};
  }

  if(isLeagueDay){
    // Remove this matchday so renderNextFixture won't show it as upcoming after it runs
    G.league.matchdays=G.league.matchdays.filter(d=>d!==day);
    events.push(...simulateLeagueMatch(day));
  }
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

  // ── Morale natural decay toward 50 (1 point every 10 days) ──────────────────
  if(day>0&&day%10===0){
    const target=50;
    if((G.morale||50)>target)G.morale=Math.max(target,(G.morale||50)-1);
    else if((G.morale||50)<target)G.morale=Math.min(target,(G.morale||50)+1);
  }
  // ── Brand passive income: every 7 days earn brand/5 as bonus ─────────────
  if((G.brand||0)>0&&day%7===0){
    const brandBonus=Math.floor((G.brand||0)/5)*100;
    if(brandBonus>0){G.wallet+=brandBonus;}
  }
  // ── Brand milestone unlocks ─────────────────────────────────────────────────
  if((G.brand||0)>=20&&!G._brandBonus20){
    G._brandBonus20=true;
    G.passiveIncome=(G.passiveIncome||0)+300;
    showToast('⭐ Brand milestone! +£300/wk passive deal unlocked','');
  }
  if((G.brand||0)>=40&&!G._brandBonus40){
    G._brandBonus40=true;
    G.passiveIncome=(G.passiveIncome||0)+600;
    showToast('🌟 Brand superstar! +£600/wk passive deal unlocked','');
  }

  // Monthly press conference (every 28-35 days during season, not in first 10 days)
  if(phase==='season'&&day>10&&day%30>=0&&day%30<=2&&!G.pendingEvent&&!G._pressConfDay){
    if(day>=(G._lastPressConf||0)+25){
      const pc=_pickPressConf(day);
      if(pc){G.pendingEvent=pc;G._lastPressConf=day;return{events,blockingEvent:pc};}
    }
  }

  return{events,blockingEvent:null};
}

// ── Match Simulation ──────────────────────────────────────────
function _buildFixtureList(teams){
  // Generate a proper round-robin fixture list:
  // Every team plays every other team TWICE (home + away).
  // Returns array of {home, away} objects — player's club always appears as home first.
  const names=teams.map(t=>t.name);
  const allFixtures=[];
  // First half-season: each pair once (home/away assigned by order)
  for(let i=0;i<names.length;i++){
    for(let j=i+1;j<names.length;j++){
      allFixtures.push({home:names[i],away:names[j]});
      allFixtures.push({home:names[j],away:names[i]});
    }
  }
  // Filter to only fixtures involving player's club
  const playerName=teams.find(t=>t.isPlayer)?.name;
  return allFixtures.filter(f=>f.home===playerName||f.away===playerName);
}

function simulateLeagueMatch(day){
  // Ensure fixture list exists and is populated
  if(!G.league.fixtures||G.league.fixtures.length===0){
    G.league.fixtures=_buildFixtureList(G.league.teams);
  }
  const mi=G.league.nextMatchIdx||0;
  G.league.nextMatchIdx=mi+1;
  // Pick the fixture for this matchday (wrap around just in case)
  const fix=G.league.fixtures[mi%G.league.fixtures.length];
  const playerName=G.club.name;
  const isHome=fix?fix.home===playerName:true;
  const oppName=fix?(isHome?fix.away:fix.home):null;
  const opp=G.league.teams.find(t=>t.name===oppName)||G.league.teams.find(t=>!t.isPlayer);
  if(!opp){return[{type:'training',icon:'🎽',title:'No Fixture',detail:'Rest day.'}];}

  const teamAvg=G.manager.teamAvgOVR;
  // Morale bonus to selection: very high morale helps borderline cases
  const moraleBonus=((G.morale||50)-50)/200; // ±0.25 modifier
  const selection=G.forcedStarter>0?'start':E.selectPlayer(G.player.overall+Math.round(moraleBonus*10),teamAvg);
  if(G.forcedStarter>0)G.forcedStarter--;
  if(selection==='out'){
    const homeTeam=isHome?{ovr:teamAvg}:{ovr:opp.ovr};
    const awayTeam=isHome?{ovr:opp.ovr}:{ovr:teamAvg};
    const res=E.simulateAIMatch(homeTeam,awayTeam);
    const [hg,ag]=isHome?[res.hg,res.ag]:[res.ag,res.hg];
    updateLeagueTable(playerName,opp.name,hg,ag,isHome);
    return[{type:'match',icon:'🪑',title:`Not Selected — ${isHome?playerName:opp.name} vs ${isHome?opp.name:playerName}`,detail:`Left out. Final score: ${hg}–${ag}.`,selection:'out'}];
  }
  const homeName=isHome?playerName:opp.name;
  const awayName=isHome?opp.name:playerName;
  return[runMatchSim(homeName,awayName,opp.ovr,teamAvg,selection,false,day)];
}

function simulateCupMatch(cupId,cup,day){
  const cupDef=CUPS.find(c=>c.id===cupId)||{name:'Cup',icon:'🏆',rounds:['Final']};
  const stageLabel=cupDef.rounds?.[cup.stage]||'Final';

  // Get opponent from THIS round's bracket entry
  const bracketRound=cup.bracketRounds?.[cup.stage];
  const playerMatch=bracketRound?.matches?.find(m=>m.isPlayer);
  // Fallback: pick a random non-player club if bracket somehow missing
  const fallbackOpp=()=>{
    const t=E.clamp(G.club.tier+E.rand(-1,1),1,5);
    return (CLUBS[t]||CLUBS[3]).filter(c=>c!==G.club.name)[0]||'Opponent';
  };
  const oppName=playerMatch?.away||fallbackOpp();
  const oppTier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
  const oppOVR=E.randTierOVR(oppTier);
  const selection=E.selectPlayer(G.player.overall,G.manager.teamAvgOVR);
  const res=runMatchSim(G.club.name,oppName,oppOVR,G.manager.teamAvgOVR,selection,true,day);

  // No draws in cups
  let finalResult=res.result;
  let etNote='';
  if(res.result==='D'){
    const skillAdv=(G.manager.teamAvgOVR-oppOVR)/100;
    if(E.chance(0.5+skillAdv)){finalResult='W';etNote=' (AET)';res.hg++;}
    else{const pw=E.chance(0.55);finalResult=pw?'W':'L';etNote=' (Pens)';if(pw)res.hg++;else res.ag++;}
    res.result=finalResult;
    res.detail+=' Match went to '+(etNote.includes('Pens')?'a penalty shootout':'extra time')+'.';
  }

  res.title=`${cupDef.icon} ${cupDef.name} (${stageLabel}): ${G.club.name} ${res.hg}–${res.ag} ${oppName}${etNote}`;
  const win=finalResult==='W';

  // Write result back into bracket
  if(playerMatch){
    playerMatch.homeScore=res.hg;
    playerMatch.awayScore=res.ag;
    playerMatch.winner=win?G.club.name:oppName;
  }

  if(win){
    cup.stage++;
    if(cup.stage>=cupDef.rounds.length){
      cup.winner=true;cup.eliminated=true;G.careerStats.trophies++;
      G.careerLog.push({icon:'🏆',title:`${cupDef.name} Winner!`,detail:'Lifted the trophy!',date:E.getDayLabel(day)});
      showToast(`🏆 ${cupDef.name} Winner!`,'');
      setTimeout(()=>UI.showCupCelebration(cupDef),200);
    } else {
      // Build the NEXT round dynamically from this round's winners
      _advanceCupBracket(cup,cupDef,G.club.name);
    }
  } else {
    cup.eliminated=true;
  }
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
    if(ag===0&&['CB','LB','RB','CDM'].includes(G.player.position))G.seasonStats.cleanSheets++;
    G.seasonStats.ratingSum+=Math.round(myRating);G.seasonStats.ratingCount++;
    G.seasonStats.avgRating=Math.round(G.seasonStats.ratingSum/G.seasonStats.ratingCount);
    G.form.push(Math.round(myRating));if(G.form.length>5)G.form.shift();
  }
  if(!isCup)updateLeagueTable(G.club.name,awayName,hg,ag,isHome);
  let detail=`${isStart?'Started':isSub?'Off the bench':'Not in squad'}. `;
  if(isDef||isCDM){
    // Defensive match report
    const tackles=E.rand(2,7),intercepts=E.rand(1,4),clearances=E.rand(2,8);
    detail+=`${tackles} tackles, ${intercepts} interceptions, ${clearances} clearances. `;
    detail+=`"${E.pick(DEF_FLAVOUR)}". `;
    if(myGoals) detail+=`⚽ ${myGoals===1?'Headed in from a set piece!':'Two goals from set pieces!'} `;
    if(myAssists) detail+=`Assist — "${E.pick(ASSIST_FLAVOUR)}". `;
    if(isCleanSheet&&(isDef||isCDM)) detail+='🧱 Clean sheet — commanding at the back. ';
  } else if(isMid){
    // Midfield match report
    const passes=E.rand(28,55),passAcc=E.rand(76,94),keyPasses=E.rand(0,3);
    detail+=`${passes} passes (${passAcc}% accuracy), ${keyPasses} key pass${keyPasses!==1?'es':''}. `;
    detail+=`"${E.pick(MID_FLAVOUR)}". `;
    if(myGoals) detail+=`⚽ ${myGoals} goal${myGoals>1?'s':''} — "${E.pick(GOAL_FLAVOUR)}". `;
    if(myAssists) detail+=`${myAssists} assist${myAssists>1?'s':''} — "${E.pick(ASSIST_FLAVOUR)}". `;
  } else {
    // Attacker match report
    if(myGoals) detail+=`⚽ ${myGoals} goal${myGoals>1?'s':''} — "${E.pick(GOAL_FLAVOUR)}". `;
    if(myAssists) detail+=`🎯 ${myAssists} assist — "${E.pick(ASSIST_FLAVOUR)}". `;
    if(!myGoals&&!myAssists) detail+=E.rand(1,3)===1?`${E.rand(1,4)} shots on target. `:'';
  }
  if(motm) detail+=`🌟 Man of the Match — "${E.pick(MOTM_FLAVOUR)}". `;
  if(yellow) detail+=`🟨 Booked for a late challenge. `;
  if(red) detail+=`🟥 Straight red — you'll miss the next game. `;
  if(!myGoals&&!myAssists&&!motm&&isStart&&!isDef&&!isCDM&&!isMid) detail+=myRating>=68?'Solid performance.':'Tough afternoon — room to improve.';
  G.matchHistory.push({date:E.getDayLabel(day||0),home:homeName,away:awayName,hg,ag,result,rating:Math.round(myRating),goals:myGoals,assists:myAssists,motm,yellow,red,isCup:!!isCup,selection});
  if((motm||myGoals>=2||(G.agentUpgraded&&myRating>=75))&&!G.club.isFreeAgent)maybeGenerateTransferOffer(day||0);
  return{type:'match',icon:'⚽',title:`${homeName} ${hg}–${ag} ${awayName}`,detail:detail.trim(),result,hg,ag,myGoals,myAssists,myRating:Math.round(myRating),motm,yellow,red,selection,homeTeam:homeName,awayTeam:awayName};
}

// ── Sim-first match pipeline ──────────────────────────────────
// Step 1: gather everything MatchSim.show() needs WITHOUT committing stats.
// Returns {homeTeam,awayTeam,homeOVR,awayOVR,homeFmt,awayFmt,
//          homeCol,awayCol,isPlayerHome,selection,oppOVR,isCup,
//          homeName,awayName,cupId,cupDef,stageLabel} or null if not a match.
function prepareMatchForSim(day){
  // If injured, do NOT launch the visual sim — fall through to simulateDay() which handles recovery
  if((G.injuryDaysLeft>0)||(G.careerInjuryMonthsLeft>0)) return null;
  const isLeagueDay=G.league.matchdays.includes(day)&&!G.club.isFreeAgent;
  const cupsToday=Object.entries(G.cups||{}).filter(([,c])=>!c.eliminated&&c.matchDays?.includes(day));
  if(!isLeagueDay&&!cupsToday.length) return null;

  // Selection
  const teamAvg=G.manager.teamAvgOVR;
  const selection=G.forcedStarter>0?'start':E.selectPlayer(G.player.overall,teamAvg);

  let homeName,awayName,oppOVR,isCup=false,cupId=null,cupDef=null,stageLabel='';

  if(isLeagueDay){
    // Use fixture list to get correct opponent and home/away assignment
    if(!G.league.fixtures||G.league.fixtures.length===0){
      G.league.fixtures=_buildFixtureList(G.league.teams);
    }
    const mi=G.league.nextMatchIdx||0;
    const fix=G.league.fixtures[mi%G.league.fixtures.length];
    const playerName=G.club.name;
    const playerIsHome=fix?fix.home===playerName:true;
    const oppName=fix?(playerIsHome?fix.away:fix.home):(G.league.teams.find(t=>!t.isPlayer)?.name||'Opponent');
    const opp=G.league.teams.find(t=>t.name===oppName)||G.league.teams.find(t=>!t.isPlayer);
    homeName=playerIsHome?playerName:oppName;
    awayName=playerIsHome?oppName:playerName;
    oppOVR=opp?.ovr||70;
    isCup=false;
  } else {
    const [cid,cup]=cupsToday[0];
    const cd=CUPS.find(c=>c.id===cid)||{name:'Cup',icon:'🏆',rounds:['Final']};
    // Get opponent from bracket
    const bracketRound=cup.bracketRounds?.[cup.stage];
    const playerMatch=bracketRound?.matches?.find(m=>m.isPlayer);
    const oppTier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
    const bracketOpp=playerMatch?.away;
    const fallbackOpp=CLUBS[oppTier]?.filter(c=>c!==G.club.name)?.[0]||'Opponent';
    oppOVR=E.randTierOVR(oppTier);
    homeName=G.club.name;
    awayName=bracketOpp||fallbackOpp;
    isCup=true; cupId=cid; cupDef=cd;
    stageLabel=cd.rounds?.[cup.stage]||'Final';
  }

  const homeInfo=getClubInfo(homeName);
  const awayInfo=getClubInfo(awayName);
  const isPlayerHome=homeName===G.club.name;

  // Kit clash detection: if primary colors are too similar, away uses secondaryColor
  const homeCol=homeInfo.primaryColor||'#4a9eff';
  const awayPrimary=awayInfo.primaryColor||'#ff4757';
  const awaySecondary=awayInfo.secondaryColor||'#ffffff';
  const awayCol=_colorsClash(homeCol,awayPrimary)?awaySecondary:awayPrimary;

  return{
    homeName,awayName,
    homeOVR:teamAvg,awayOVR:oppOVR,
    homeFmt:homeInfo.formation||'4-4-2',
    awayFmt:awayInfo.formation||'4-4-2',
    homeCol,awayCol,
    isPlayerHome,selection,oppOVR,isCup,cupId,cupDef,stageLabel,
    teamAvg,
  };
}

// Step 2: commit the sim's live result into all G stats.
// Call this AFTER MatchSim.close() returns hg/ag.
function applySimResult(hg,ag,prep,day){
  if(!prep) return [];
  const{homeName,awayName,selection,oppOVR,isCup,cupId,cupDef,stageLabel,teamAvg}=prep;
  const isAtt=['ST','CF','LW','RW','CAM'].includes(G.player.position);
  const isMid=['CM','CDM'].includes(G.player.position);
  const isHome=homeName===G.club.name;
  const isStart=selection==='start';
  const isSub=selection==='bench';
  let myGoals=0,myAssists=0;
  const isDef=['CB','LB','RB'].includes(G.player.position);
  const isCDM=G.player.position==='CDM';
  const result=hg>ag?'W':hg<ag?'L':'D';
  // Assign personal stats based on position group
  if(isStart||isSub){
    if(isAtt&&hg>0){myGoals=Math.min(E.rand(0,2),hg);if(hg>myGoals&&E.chance(.35))myAssists=1;}
    else if(isMid&&hg>0){if(E.chance(.45))myAssists=1;if(E.chance(.12))myGoals=1;}
    else if(isCDM&&hg>0){if(E.chance(.28))myAssists=1;}
    // Defenders don't really score — very rare
    else if(isDef&&hg>0&&E.chance(.05)){myGoals=1;}
    if(isSub){myGoals=Math.min(myGoals,1);}
  }
  const motm=isStart&&E.chance(.15);
  const yellow=isStart&&E.chance(.09);
  const red=!yellow&&isStart&&E.chance(.022);
  const isCleanSheet=ag===0;
  const isWin=result==='W';
  const isDraw=result==='D';
  // Build realistic rating from scratch
  // Morale affects personal performance: ±6 rating points at extremes
  const moraleRatingBonus=Math.round(((G.morale||50)-50)/8);
  let myRating=62+moraleRatingBonus; // neutral baseline modified by morale
  // Result modifier
  if(isWin) myRating+=5; else if(isDraw) myRating+=1; else myRating-=3;
  // Goal contributions (position-scaled)
  myRating+=myGoals*(isAtt?9:isMid?8:6);
  myRating+=myAssists*(isAtt?4:5);
  // Defensive bonus
  if(isCleanSheet&&(isDef||isCDM)) myRating+=5;
  // Situational
  if(motm) myRating+=9;
  if(red)  myRating-=18;
  if(yellow) myRating-=2;
  if(isSub) myRating-=4;
  // Randomise ±5 around computed value
  myRating+=E.rand(-5,5);
  myRating=E.clamp(Math.round(myRating),42,99);

  // Advance match indices
  if(!isCup){
    G.league.matchdays=G.league.matchdays.filter(d=>d!==day);
    G.league.nextMatchIdx=(G.league.nextMatchIdx||0)+1;
    if(G.forcedStarter>0)G.forcedStarter--;
  }

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
    if(ag===0&&['CB','LB','RB','CDM'].includes(G.player.position))G.seasonStats.cleanSheets++;
    G.seasonStats.ratingSum+=Math.round(myRating);G.seasonStats.ratingCount++;
    G.seasonStats.avgRating=Math.round(G.seasonStats.ratingSum/G.seasonStats.ratingCount);
    G.form.push(Math.round(myRating));if(G.form.length>5)G.form.shift();
  }
  if(!isCup){ updateLeagueTable(homeName,awayName,hg,ag,isHome); updateAllOtherLeagues(G.club.tier); }

  // Match injury
  const events=[];
  if(E.chance(0.045)&&G.injuryDaysLeft===0&&G.careerInjuryMonthsLeft===0){
    const days=E.rand(4,18);G.injuryDaysLeft=days;
    const types=['Hamstring tweak','Ankle knock','Muscle strain','Bruised ribs','Hip flexor issue'];
    const t=E.pick(types);
    events.push({type:'injury',icon:'🤕',title:`Injury — ${days} days out`,detail:t});
    G.careerLog.push({icon:'🤕',title:'Injury',detail:`${t} — ${days} days recovery`,date:E.getDayLabel(day)});
  }

  let detail=`${isStart?'Started':isSub?'Off the bench':'Not in squad'}. `;
  if(isDef||isCDM){
    // Defensive match report: talk about defensive actions, not goals
    const tackles=E.rand(2,8),intercepts=E.rand(0,5),clearances=E.rand(1,9),aerials=E.rand(0,6);
    detail+=`${tackles} tackles, ${intercepts} interceptions, ${clearances} clearances`;
    if(aerials>1) detail+=`, ${aerials} aerials won`;
    detail+=`. "${E.pick(DEF_FLAVOUR)}". `;
    if(myGoals) detail+=`⚽ Headed home from a set piece! `;
    if(myAssists) detail+=`Assist — "${E.pick(ASSIST_FLAVOUR)}". `;
    if(isCleanSheet) detail+=`🧱 Clean sheet kept — solid at the back. `;
  } else if(isMid){
    // Midfield match report: passes, key passes, creative involvement
    const passes=E.rand(30,60),passAcc=E.rand(78,96),keyPasses=E.rand(0,4),duels=E.rand(2,8);
    detail+=`${passes} passes (${passAcc}% acc), ${keyPasses} key pass${keyPasses!==1?'es':''}, ${duels} duels won. `;
    detail+=`"${E.pick(MID_FLAVOUR)}". `;
    if(myGoals) detail+=`⚽ ${myGoals} goal${myGoals>1?'s':''} — "${E.pick(GOAL_FLAVOUR)}". `;
    if(myAssists) detail+=`🎯 ${myAssists} assist${myAssists>1?'s':''} — "${E.pick(ASSIST_FLAVOUR)}". `;
  } else {
    // Attacker match report: goals, shots, directness
    const shots=Math.max(myGoals+E.rand(0,3),1),shotsOT=Math.max(myGoals,E.rand(0,Math.min(shots,3)));
    if(myGoals){
      detail+=`⚽ ${myGoals} goal${myGoals>1?'s':''} — "${E.pick(GOAL_FLAVOUR)}". `;
    } else {
      detail+=`${shots} shot${shots!==1?'s':''}, ${shotsOT} on target. `;
    }
    if(myAssists) detail+=`🎯 ${myAssists} assist — "${E.pick(ASSIST_FLAVOUR)}". `;
    if(!myGoals&&!myAssists&&isStart) detail+=myRating>=68?"Lively display — dangerous throughout.":"Quiet outing — couldn't quite get into the game. ";
  }
  if(motm) detail+=`🌟 Man of the Match — "${E.pick(MOTM_FLAVOUR)}". `;
  if(yellow) detail+=`🟨 Booked for a late challenge. `;
  if(red) detail+=`🟥 Straight red — you'll miss the next game. `;

  G.matchHistory.push({date:E.getDayLabel(day||0),home:homeName,away:awayName,hg,ag,result,rating:Math.round(myRating),goals:myGoals,assists:myAssists,motm,yellow,red,isCup,selection});
  if((motm||myGoals>=2||(G.agentUpgraded&&myRating>=75))&&!G.club.isFreeAgent)maybeGenerateTransferOffer(day||0);

  // Cup result
  let title=`${homeName} ${hg}–${ag} ${awayName}`;
  if(isCup&&cupDef){
    let etNote='';
    let finalResult=result;
    if(result==='D'){
      const skillAdv=(teamAvg-oppOVR)/100;
      if(E.chance(0.5+skillAdv)){finalResult='W';etNote=' (AET)';hg++;}
      else{const pw=E.chance(0.55);finalResult=pw?'W':'L';etNote=' (Pens)';if(pw)hg++;else ag++;}
      detail+=' Match went to '+(etNote.includes('Pens')?'a penalty shootout':'extra time')+'.';
    }
    title=`${cupDef.icon} ${cupDef.name} (${stageLabel}): ${homeName} ${hg}–${ag} ${awayName}${etNote}`;
    const cup=G.cups[cupId];
    if(cup){
      if(finalResult==='W'){
        cup.stage++;
        if(cup.stage>=cupDef.rounds.length){
          cup.winner=true;cup.eliminated=true;G.careerStats.trophies++;
          G.careerLog.push({icon:'🏆',title:`${cupDef.name} Winner!`,detail:'Lifted the trophy!',date:E.getDayLabel(day)});
          showToast(`🏆 ${cupDef.name} Winner!`,'');
          setTimeout(()=>UI.showCupCelebration(cupDef),200);
        }
      } else { cup.eliminated=true; }
      G.cups[cupId]=cup;
    }
  }

  const ev={type:'match',icon:'⚽',title,detail:detail.trim(),result,hg,ag,myGoals,myAssists,myRating:Math.round(myRating),motm,yellow,red,selection,homeTeam:homeName,awayTeam:awayName};
  events.unshift(ev);
  checkMilestones(events,day);
  return events;
}

function updateAllOtherLeagues(currentTier){
  // Simulate one random fixture per other league to keep them progressing
  if(!G.allLeagues) return;
  LEAGUES.forEach(l=>{
    if(l.tier===currentTier) return;
    const league=G.allLeagues[l.tier];
    if(!league||!league.teams||league.teams.length<2) return;
    // Pick two random teams and simulate a match
    const idx1=Math.floor(Math.random()*league.teams.length);
    let idx2=Math.floor(Math.random()*league.teams.length);
    if(idx2===idx1) idx2=(idx1+1)%league.teams.length;
    const t1=league.teams[idx1], t2=league.teams[idx2];
    if(!t1||!t2) return;
    const res=E.simulateAIMatch(t1,t2);
    const applyR=(team,sc,co)=>{
      team.played++;team.gf+=sc;team.ga+=co;team.gd=team.gf-team.ga;
      if(sc>co){team.won++;team.pts+=3;team.form.push('W');}
      else if(sc===co){team.drawn++;team.pts+=1;team.form.push('D');}
      else{team.lost++;team.form.push('L');}
      if(team.form.length>5)team.form.shift();
    };
    applyR(t1,res.hg,res.ag);applyR(t2,res.ag,res.hg);
  });
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

  // ── AI round-robin: each matchday simulate exactly ONE game per other AI pair ──
  // Build a fixed pairing list for non-player, non-opponent teams.
  // We rotate through it using G.league.aiMatchdayIdx so each team plays once per
  // player matchday — keeping all teams' "played" counts in sync with the player.
  const others=G.league.teams.filter(t=>!t.isPlayer&&t.name!==oppName);
  if(others.length<2)return;
  // Build round-robin pairs from the "others" pool (half of them play each matchday)
  // Using a deterministic rotation: on matchday N, pair[0] vs pair[1], pair[2] vs pair[3]...
  const mi=G.league.nextMatchIdx||0; // current matchday index (already advanced before this call)
  // Create a seeded shuffle of others for this matchday so pairings rotate fairly
  const seeded=[...others];
  // Fisher-Yates with matchday seed so it's consistent but rotates
  for(let i=seeded.length-1;i>0;i--){
    const j=((mi*7+i*13)^(i*31))%( i+1);
    [seeded[i],seeded[j]]=[seeded[j],seeded[i]];
  }
  // Simulate one game per pair — each AI team plays ONCE this matchday
  for(let i=0;i<seeded.length-1;i+=2){
    const r=E.simulateAIMatch(seeded[i],seeded[i+1]);
    applyResult(seeded[i],r.hg,r.ag);
    applyResult(seeded[i+1],r.ag,r.hg);
  }
  // Odd team out: give them a bye (no game this matchday — balances out over the season)
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


// ── Press Conference System ─────────────────────────────────────────────────
const PRESS_QUESTIONS=[
  {
    id:'pc_form',icon:'🎤',title:'Post-Match Press Conference',subtitle:'The media are waiting',
    body:'You step up to the microphone. The first journalist fires: "How do you feel your form has been this season?"',
    choices:[
      {label:'Confident: put in the work, results speak for themselves',fn:'pc_confident',moraleEffect:2,brandEffect:1},
      {label:'Team-first: credit the collective, not yourself',fn:'pc_teamfirst',moraleEffect:5,brandEffect:0},
      {label:'Self-critical: honest that you know you can do more',fn:'pc_honest',moraleEffect:-1,brandEffect:3},
    ]
  },
  {
    id:'pc_transfer',icon:'🎤',title:'Transfer Rumour Questions',subtitle:'The press room buzzes with speculation',
    body:'Rumours have been swirling. A journalist stands up: "Can you comment on reported interest from other clubs?"',
    choices:[
      {label:'Loyal: fully focused here, nothing else matters',fn:'pc_loyal',moraleEffect:4,brandEffect:1},
      {label:'Deflect: my agent handles that, I just play football',fn:'pc_deflect',moraleEffect:0,brandEffect:-1},
      {label:'Ambitious: every player wants to play at the highest level',fn:'pc_ambitious',moraleEffect:-2,brandEffect:4},
    ]
  },
  {
    id:'pc_injury',icon:'🎤',title:'Return From Injury',subtitle:'Your first public statement back',
    body:'After your injury lay-off, the cameras are on. "How does it feel to be back? Were you worried?"',
    choices:[
      {label:'Positive: stronger than ever, incredible rehab team',fn:'pc_positive',moraleEffect:3,brandEffect:2},
      {label:'Vulnerable: it was mentally tough, honest about the dark days',fn:'pc_vulnerable',moraleEffect:1,brandEffect:5},
      {label:'Resilient: never doubted the return, just a setback',fn:'pc_tough',moraleEffect:2,brandEffect:2},
    ]
  },
  {
    id:'pc_manager',icon:'🎤',title:'Tactical Press Day',subtitle:'Pre-match media duties',
    body:'The manager gestures for you to handle media. A reporter asks about your relationship with the manager.',
    choices:[
      {label:'Praise: top manager, learned so much working under him',fn:'pc_praise',moraleEffect:6,brandEffect:1},
      {label:'Professional: we work hard, that is what matters',fn:'pc_neutral',moraleEffect:1,brandEffect:0},
      {label:'Confident: good mutual understanding of what you bring',fn:'pc_confident2',moraleEffect:2,brandEffect:2},
    ]
  },
  {
    id:'pc_critics',icon:'🎤',title:'Responding to Critics',subtitle:'After a difficult run of results',
    body:'A pundit on TV called you "inconsistent." The journalist brings it up. How do you respond?',
    choices:[
      {label:'Calm: entitled to their opinion, you focus on training',fn:'pc_calm',moraleEffect:2,brandEffect:3},
      {label:'Fired up: pundits have never played at this level',fn:'pc_aggressive',moraleEffect:-3,brandEffect:-2},
      {label:'Self-aware: fair feedback, watch this space',fn:'pc_selfaware',moraleEffect:3,brandEffect:5},
    ]
  },
  {
    id:'pc_fans',icon:'🎤',title:'Fan Appreciation Media Day',subtitle:'Talking to supporters through the press',
    body:'"The fans have been singing your name lately — any message for them?"',
    choices:[
      {label:'Heartfelt: they are the reason you play, do it for them',fn:'pc_fans1',moraleEffect:4,brandEffect:3},
      {label:'Grateful: the support this season has been unbelievable',fn:'pc_fans2',moraleEffect:5,brandEffect:2},
      {label:'Driven: keep repaying them with performances',fn:'pc_fans3',moraleEffect:3,brandEffect:3},
    ]
  },
];

function _pickPressConf(day){
  if(!PRESS_QUESTIONS.length)return null;
  const q=E.pick(PRESS_QUESTIONS);
  return{
    id:'press_conf_'+q.id,
    icon:q.icon,title:q.title,subtitle:q.subtitle,
    body:q.body,
    isPressConf:true,
    rarity:'common',
    choices:q.choices.map(c=>({label:c.label,fn:c.fn,outcome:'',_moraleEffect:c.moraleEffect,_brandEffect:c.brandEffect})),
  };
}

function resolvePressConf(fnName){
  const ev=G.pendingEvent;
  if(!ev||!ev.isPressConf)return;
  G.pendingEvent=null;
  const day=G.season.dayOfSeason;
  const choice=ev.choices.find(c=>c.fn===fnName);
  if(!choice)return;
  const morale=choice._moraleEffect||0;
  const brand=choice._brandEffect||0;
  // Apply effects
  G.morale=(G.morale||50)+morale;
  G.morale=Math.max(0,Math.min(100,G.morale));
  G.brand=(G.brand||0)+brand;
  // High morale gives forced starter boosts
  if(G.morale>=80&&E.chance(0.4)){G.forcedStarter+=2;showToast('💪 Team loves you — guaranteed starts this week!','');}
  const moraleStr=morale>0?`Team morale +${morale}`:morale<0?`Team morale ${morale}`:'Morale unchanged';
  const brandStr=brand>0?` · Brand +${brand}`:brand<0?` · Brand ${brand}`:'';
  addLog('🎤','Press Conference',`"${choice.label.replace(/"/g,"'")}" — ${moraleStr}${brandStr}`,day);
  showToast(`🎤 Press conference done — ${moraleStr}`,'');
  closeModal();App.renderDashboard();
}

function resolveEvent(fnName){
  // Route press conference responses to their own resolver
  if(G.pendingEvent?.isPressConf){resolvePressConf(fnName);return;}
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
      // Only available if tier 1 or 2 (Championship/Prem) — loan goes 2 tiers down
      const loanTier=Math.min(5,G.club.tier+2);
      const loanPool=[...(CLUBS[loanTier]||CLUBS[4])].filter(c=>c!==G.club.name);
      const loanClub=E.pick(loanPool)||'Loan Club';
      const loanLeague=LEAGUES.find(l=>l.tier===loanTier)||LEAGUES[3];
      const loanAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[loanTier]||[54,67];
      // Store full original club state
      G.loanOriginalClub={
        name:G.club.name,tier:G.club.tier,leagueId:G.club.leagueId,
        contractYears:G.club.contractYears,contractSignedDay:G.club.contractSignedDay,
        salary:G.weeklySalary,manager:{...G.manager},
        league:{name:G.league.name,tier:G.league.tier,teams:[...G.league.teams],
          matchdays:[...G.league.matchdays],nextMatchIdx:G.league.nextMatchIdx||0},
      };
      // Move to loan club
      G.club={name:loanClub,tier:loanTier,leagueId:loanLeague.id,contractYears:G.club.contractYears,isFreeAgent:false,contractSignedDay:G.club.contractSignedDay,isOnLoan:true};
      G.manager={name:E.pick(MANAGER_NAMES),title:'Loan Manager',teamAvgOVR:E.rand(loanAvgRange[0],loanAvgRange[1])};
      G.loanActive=true;
      G.loanDaysLeft=60;
      G.forcedStarter=60;
      // Schedule fresh matches at loan club from today
      const day=G.season.dayOfSeason;
      G.league={
        name:loanLeague.name,tier:loanTier,
        teams:E.generateLeague(loanTier,loanClub),
        matchdays:E.scheduleLeague(loanTier,365).filter(d=>d>day),
        nextMatchIdx:0,
      };
      addLog('🔄','Emergency Loan Move',`On loan at ${loanClub} (${loanLeague.name}) for 60 days.`,day);
      showToast(`✈️ On loan at ${loanClub}!`,'');
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
      const newSalary=Math.max(G.weeklySalary*2, E.ovrWage(G.player.overall,tier));
      const prevClub=G.club.name;
      G.club={name:newClub,tier,leagueId:offerLeague.id,contractYears:4,isFreeAgent:false,contractSignedDay:day};
      G.weeklySalary=newSalary;
      const rtAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[tier]||[60,78];
      G.manager={name:_getManagerName(newClub),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(rtAvgRange[0],rtAvgRange[1])};
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
    // ── New event handlers ──────────────────────────────────────
    windowScramble:()=>{G.weeklySalary+=1200;addLog('⏰','Deadline Day Bidding War','Agent negotiated. +£1,200/wk.',day);showToast('⏰ Bidding war settled! +£1,200/wk','');},
    panicBuySign:()=>{G.weeklySalary+=800;G.wallet+=6000;addLog('💰','Contract Extended','Wage rise + loyalty bonus.',day);showToast('✍️ Extended! +£800/wk + £6,000 bonus','');},
    moraleLeader:()=>{G.forcedStarter=28;addLog('💚','Squad Leader','Dressing room looks to you. Starting for 4 weeks.',day);showToast('💚 Unofficial captain! 4 weeks guaranteed','');},
    moraleBoostPerf:()=>{
      G.forcedStarter=Math.max(G.forcedStarter||0,21);
      addLog('⚡','Training Energy','High morale translates to guaranteed performances.',day);
      showToast('⚡ Energy channelled — starting for 3 weeks!','');
    },
    sportsPsych:()=>{
      G.morale=Math.min(100,(G.morale||50)+20);
      addLog('🧠','Sports Psychology Sessions','Clarity and confidence restored. Morale +20.',day);
      showToast('🧠 Mind cleared. Morale significantly improved!','');
    },
    brandAmbassador:()=>{
      G.wallet+=14000;G.passiveIncome=(G.passiveIncome||0)+1000;
      addLog('💼','Global Brand Ambassador','£14,000 signing fee + £1,000/wk passive.',day);
      showToast('💼 Ambassador deal signed! +£14,000 + £1,000/wk','');
    },
    fanPollWin:()=>{
      G.wallet+=8000;
      addLog('🗳️','Fan Poll Winner — Special Shirt','£8,000 royalty from shirt sales.',day);
      showToast('🗳️ Fans voted! +£8,000 shirt royalty','');
    },
    titleRaceLockIn:()=>{
      const stat=E.pick(['shooting','dribbling','passing','pace']);
      G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+2,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🏆','Title Race Focus',`Locked in. ${stat} +2 from intensity.`,day);
      showToast(`🏆 Title race! ${stat} +2 — peak form!`,'');
    },
    relegationFight:()=>{
      const stat=E.pick(['defending','physical','pace']);
      G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      G.morale=Math.min(100,(G.morale||50)+10);
      addLog('📉','Relegation Battle Resolve',`Led from the front. ${stat} +1. Morale up.`,day);
      showToast(`💪 Relegation fighter! ${stat} +1 + morale boost`,'');
    },
    cupFinalMindset:()=>{
      G.forcedStarter=Math.max(G.forcedStarter||0,7);
      addLog('🏆','Cup Final Mindset','Visualised the win all night. Ready.',day);
      showToast('🏆 Cup final eve — mind locked in!','');
    },
    crowdBoost:()=>{
      const stat=E.pick(['pace','dribbling','shooting']);
      G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🏟️','Sell-Out Crowd Boost',`Fed off the energy. ${stat} +1.`,day);
      showToast(`🏟️ Crowd lifted you! ${stat} +1`,'');
    },
    squadBet:()=>{
      const win=E.chance(0.5);
      if(win){G.wallet+=0;addLog('🎲','Squad Bet — Winner!','You scored the winner. The squad buys their own lunch.',day);showToast('🎲 You won! Squad buys lunch!','');}
      else{G.wallet-=Math.min(G.wallet,800);addLog('🎲','Squad Bet — Loser','28 lunches. Expensive afternoon.',day);showToast('🎲 Lost the bet. 28 lunches paid.','warn');}
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
    // ── Missing handlers ────────────────────────────────────
    bookDeal:()=>{G.wallet+=18000;addLog('📖','Book Deal Signed','£18,000 advance received — your story in print.',day);showToast('📖 Book deal! +£18,000 advance','');},
    refereeFine:()=>{G.wallet-=1500;addLog('🟨','Referee Incident Fine','£1,500 FA fine. Two-match ban.',day);showToast('❌ £1,500 fined — two-match ban','err');},
    autobioBoost:()=>{G.wallet+=20000;addLog('📖','Autobiography Signed','£20,000 advance. Your story inspires millions.',day);showToast('📖 Autobiography! +£20,000','');},
    winAward:()=>{G.wallet+=5000;addLog('🏅','Player of the Month!','Won the award! £5,000 prize money.',day);showToast('🏅 Player of the Month! +£5,000','');},
    seasonDebut:()=>{G.forcedStarter=14;addLog('🌟','Breakthrough Season Debut','Guaranteed starter. Make your mark.',day);showToast('🌟 Starting XI for 2 weeks!','');},
    newBoots:()=>{G.wallet+=3000;addLog('👟','New Boot Deal','£3,000 signing fee — fresh deal.',day);showToast('👟 New boot deal! +£3,000','');},
    helpVAR:()=>{addLog('📺','VAR Review Goes Your Way','Decision overturned in your favour.',day);showToast('📺 VAR rescued you!','');},
    ignoreVAR:()=>{addLog('😤','VAR Denies You','The goal was chalked off. Frustrating.',day);showToast('😤 VAR denied the goal','warn');},
    enterCasino:()=>{
      const win=E.chance(0.4);
      if(win){const prize=E.rand(5,20)*1000;G.wallet+=prize;addLog('🎰','Casino Night — Won Big',`+£${prize.toLocaleString()} from a lucky evening.`,day);showToast(`🎰 Won £${prize.toLocaleString()} at the casino!`,'');}
      else{const loss=E.rand(3,12)*1000;G.wallet=Math.max(0,G.wallet-loss);addLog('🎰','Casino Night — Lost',`£${loss.toLocaleString()} down. Lesson learned.`,day);showToast(`🎰 Lost £${loss.toLocaleString()} tonight.`,'warn');}
    },
    managerMeeting:()=>{G.forcedStarter=14;addLog('🗣️','Pre-Season Chat with Manager','He wants you starting. 2 weeks guaranteed.',day);showToast('🗣️ Manager wants you in! 2 weeks guaranteed','');},
    internationalTourney:()=>{
      const cups=(G.careerStats.intlCaps||0)+3;G.careerStats.intlCaps=cups;
      const growStat=E.pick(['pace','shooting','dribbling']);G.player.attrs[growStat]=E.clamp(G.player.attrs[growStat]+2,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      addLog('🌍','Tournament with National Team',`3 caps earned. ${growStat} +2 from the intense schedule.`,day);showToast(`🌍 3 international caps! ${growStat} +2`,'');},
    captaincyDecline:()=>{addLog('🙏','Captaincy Declined','You appreciate the offer. Lead by example.',day);showToast('🙏 You lead by example','');},
    rookieBonus:()=>{G.wallet+=8000;addLog('🌟','Breakthrough Bonus','£8,000 for your impact this season.',day);showToast('🌟 Breakthrough bonus! +£8,000','');},
    contractCelebration:()=>{G.wallet+=5000;G.club.contractYears=Math.min((G.club.contractYears||1)+1,5);addLog('✍️','New Contract Celebrated','1 extra year on contract + £5,000 bonus.',day);showToast('✍️ Contract extended! +£5,000','');},
    eliteFootwear:()=>{
      const stat=E.pick(['pace','dribbling']);G.player.attrs[stat]=E.clamp(G.player.attrs[stat]+1,0,99);
      G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
      G.wallet+=4000;addLog('👟','Elite Boot Partnership',`${stat} +1. £4,000 signing fee.`,day);showToast(`👟 Boot deal! ${stat} +1 + £4,000`,'');},
    foreignLeagueMove:()=>{
      const newSalary=Math.max(G.weeklySalary, E.ovrWage(G.player.overall,G.club.tier)*2);
      const tier=Math.max(1,G.club.tier);
      const pool=[...(CLUBS[tier]||CLUBS[2])].filter(c=>c!==G.club.name);
      const newClub=E.pick(pool);
      const prevClub=G.club.name;
      G.club={...G.club,name:newClub,contractSignedDay:day,contractYears:3};
      G.weeklySalary=newSalary;
      const tAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[tier]||[60,78];
      G.manager={name:_getManagerName(newClub),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(tAvgRange[0],tAvgRange[1])};
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

// Kit clash detection: returns true if two hex colors are perceptually too similar
function _colorsClash(c1,c2){
  const parse=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
  try{
    const [r1,g1,b1]=parse(c1);const [r2,g2,b2]=parse(c2);
    const dl=Math.abs((0.299*r1+0.587*g1+0.114*b1)-(0.299*r2+0.587*g2+0.114*b2));
    const dc=Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2);
    return dl<55&&dc<180; // similar luminance AND similar hue = clash
  }catch(e){return false;}
}

// ── Transfer Offers ───────────────────────────────────────────
// Transfer window helper
function isInTransferWindow(day){
  // Summer window: July + August (days 0–69) AND late May/June (days 328+)
  // Winter window: January (days 184–214)
  if(day>=0&&day<=69) return'summer';
  if(day>=184&&day<=214) return'winter';
  if(day>=328) return'summer';
  return null;
}

// Returns the day on which the NEXT transfer window ends (for offer expiry)
function _nextWindowEnd(day){
  if(day>=0&&day<=69) return 69;         // summer window ends Aug 31
  if(day>=184&&day<=214) return 214;     // winter window ends Jan 31
  if(day>=328) return 400;               // end of season/summer
  // Outside window: expire at the END of the next window that opens
  if(day<184) return 214;               // next window is January 31
  return 400;                           // next window is next summer
}

function maybeGenerateTransferOffer(day){
  if(!isInTransferWindow(day))return; // no offers outside windows
  if(!E.chance(G.agentUpgraded?0.12:0.06))return;
  const usedClubs=new Set(G.pendingTransferOffers.map(o=>o.fromClub));
  // 20% chance of foreign league offer when player is in Tier 1 and has good OVR
  const isForeignChance=G.club.tier===1&&G.player.overall>=72&&E.chance(0.20);
  let offerClub,offerLeagueName,offerTier,salary,isForeign=false;
  if(isForeignChance&&typeof FOREIGN_LEAGUES!=='undefined'&&FOREIGN_LEAGUES.length){
    const fl=E.pick(FOREIGN_LEAGUES);
    const pool=(fl.clubs||[]).filter(c=>!usedClubs.has(c));
    if(!pool.length){/* fall through */}
    else{
      offerClub=E.pick(pool);
      offerLeagueName=`${fl.flag} ${fl.name}`;
      offerTier=1;salary=E.ovrWage(G.player.overall,1)*E.rand(110,160)/100; // foreign premium
      isForeign=true;
    }
  }
  if(!isForeign){
    offerTier=E.clamp(G.club.tier+E.rand(-1,1),1,5);
    const offerLeague=LEAGUES.find(l=>l.tier===offerTier)||LEAGUES[0];
    offerLeagueName=offerLeague.name;
    const pool=[...(CLUBS[offerTier]||CLUBS[3])].filter(c=>c!==G.club.name&&!usedClubs.has(c));
    if(!pool.length)return;
    offerClub=E.pick(pool);
    salary=E.ovrWage(G.player.overall,offerTier);
  }
  const offerId=`offer_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  // Expire at end of current window (if in window) or end of next window (if outside)
  const expiryDay=_nextWindowEnd(day);
  G.pendingTransferOffers.push({id:offerId,fromClub:offerClub,tier:offerTier,league:offerLeagueName,salary,contractYears:E.rand(1,4),expires:expiryDay,saved:false,isForeign});
  G.careerLog.push({icon:isForeign?'🌍':'📬',title:'Transfer Offer Received!',detail:`${offerClub} want to sign you${isForeign?' (Foreign Move)':''}`,date:E.getDayLabel(day)});
  showToast(`${isForeign?'🌍':'📬'} Transfer offer from ${offerClub}!`,'');
  UI.updateTransferBadge();
}

function acceptTransferOffer(offerId){
  const offer=G.pendingTransferOffers.find(o=>o.id===offerId);
  if(!offer)return;
  const prevClub=G.club.name;
  const day=G.season.dayOfSeason;
  G.club={name:offer.fromClub,tier:offer.tier,leagueId:LEAGUES.find(l=>l.tier===offer.tier)?.id||'L3',contractYears:offer.contractYears,isFreeAgent:false,contractSignedDay:day,isForeign:!!offer.isForeign,foreignLeagueId:offer.foreignLeagueId||null};
  G.weeklySalary=offer.salary;
  G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,offer.tier);
  const tAvgRange={1:[76,90],2:[68,80],3:[60,73],4:[54,67],5:[48,62]}[offer.tier]||[60,78];
  G.manager={name:_getManagerName(offer.fromClub),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(tAvgRange[0],tAvgRange[1])};
  G.careerLog.push({icon:'✈️',title:`Transferred to ${offer.fromClub}`,detail:`From ${prevClub} · ${offer.league} · £${offer.salary.toLocaleString()}/wk`,date:E.getDayLabel(day)});
  G.pendingTransferOffers=[];

  const newLeague=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];

  const _oldLeagueTier=G.league.tier; // capture BEFORE G.league is updated
  if(offer.tier===_oldLeagueTier&&!offer.isForeign){
    // Same domestic tier — preserve existing table, just re-mark player's club
    const existingTeams=G.league.teams;
    const oldTeam=existingTeams.find(t=>t.isPlayer);
    if(oldTeam)oldTeam.isPlayer=false;
    const newTeam=existingTeams.find(t=>t.name===offer.fromClub);
    if(newTeam){
      newTeam.isPlayer=true;
    } else {
      existingTeams.push({name:offer.fromClub,isPlayer:true,ovr:E.rand(tAvgRange[0],tAvgRange[1]),pts:0,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,form:[]});
    }
    const remainingMatchdays=G.league.matchdays.filter(d=>d>day);
    const preservedIdx=G.league.nextMatchIdx||0;
    G.league={
      name:newLeague.name,tier:offer.tier,
      teams:existingTeams,
      matchdays:remainingMatchdays,
      nextMatchIdx:preservedIdx,
      fixtures:null, // rebuild on next match (player team has changed)
    };
  } else {
    // Different tier or foreign — fresh league
    const freshMatchdays=E.scheduleLeague(offer.tier,365).filter(d=>d>day);
    let newTeams;
    if(offer.isForeign&&offer.foreignLeagueId){
      const flData=(typeof FOREIGN_LEAGUES!=='undefined'?FOREIGN_LEAGUES:[]).find(f=>f.id===offer.foreignLeagueId);
      newTeams=flData?_generateForeignLeague(G.club.name,flData.clubs):E.generateLeague(offer.tier,G.club.name);
    } else {
      newTeams=E.generateLeague(offer.tier,G.club.name);
    }
    const foreignLeagueName=offer.isForeign
      ?((typeof FOREIGN_LEAGUES!=='undefined'?FOREIGN_LEAGUES:[]).find(f=>f.id===offer.foreignLeagueId)?.name||'Foreign League')
      :newLeague.name;
    G.league={
      name:foreignLeagueName,tier:offer.tier,
      teams:newTeams,
      matchdays:freshMatchdays,
      nextMatchIdx:0,
      fixtures:null,
    };
  }
  // Preserve cups on same-tier domestic move; refresh on tier change or foreign
  if(offer.tier!==_oldLeagueTier||offer.isForeign){
    G.cups=E.scheduleCups(offer.tier, G.club.name, G._lastSeasonPos||99);
  }
  showToast(`✈️ Welcome to ${offer.fromClub}! Manager: ${G.manager.name}`,'');
  App.renderDashboard();closeModal();
}

function declineTransferOffer(offerId){
  G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>o.id!==offerId);
  G.careerLog.push({icon:'🚫',title:'Transfer Declined',detail:'You chose to stay put.',date:E.getDayLabel(G.season.dayOfSeason)});
  App.renderDashboard();
}

// ── Transfer negotiation mini-game ──────────────────────────────────────────
function openNegotiation(offerId){
  const offer=G.pendingTransferOffers.find(o=>o.id===offerId);
  if(!offer)return;
  const agentFee=G.agentUpgraded?'15%':'20%'; // agent takes a cut
  const counterMin=Math.round(offer.salary*1.08);
  const counterMax=Math.round(offer.salary*1.35);
  const counterSuggested=Math.round(offer.salary*1.18);
  const hasCountered=!!offer.counterMade;
  const window=isInTransferWindow(G.season.dayOfSeason);
  const windowLabel=window==='summer'?'Summer Window':'January Window';
  showModal(`
    <div class="event-modal-header">
      <span class="event-modal-emoji">🤝</span>
      <div class="event-modal-title">Contract Negotiation</div>
      <div class="event-modal-subtitle">${offer.fromClub} · ${offer.league} · ${windowLabel}</div>
    </div>
    <div class="modal-stat-grid">
      <div class="modal-stat"><div class="ms-label">Their Offer</div><div class="ms-val" style="color:var(--gold);">£${offer.salary.toLocaleString()}/wk</div></div>
      <div class="modal-stat"><div class="ms-label">Contract</div><div class="ms-val">${offer.contractYears} years</div></div>
      <div class="modal-stat"><div class="ms-label">Your OVR</div><div class="ms-val" style="color:var(--accent);">${G.player.overall}</div></div>
      <div class="modal-stat"><div class="ms-label">Agent Fee</div><div class="ms-val" style="color:var(--text-muted);">${agentFee}</div></div>
    </div>
    ${!hasCountered?`
    <div style="font-size:11px;font-family:'DM Mono',monospace;letter-spacing:1.5px;color:var(--text-muted);margin:14px 0 8px;">YOUR AGENT SUGGESTS</div>
    <div style="background:var(--surface2);border-radius:10px;padding:12px;font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:14px;">
      "Counter at <strong style="color:var(--accent);">£${counterSuggested.toLocaleString()}/wk</strong> — that's realistic for your level.
      If they really want you, they'll come back. You've got leverage here."
    </div>
    <div style="margin-bottom:10px;">
      <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:6px;font-family:'DM Mono',monospace;letter-spacing:1px;">COUNTER DEMAND (£/wk)</label>
      <input type="number" id="counterInput" value="${counterSuggested}" min="${counterMin}" max="${counterMax}" step="100"
        style="width:100%;padding:10px;background:var(--surface2);border:1px solid var(--border-bright);color:var(--text);border-radius:8px;font-size:14px;font-weight:700;text-align:center;">
      <div style="font-size:10px;color:var(--text-muted);margin-top:4px;text-align:center;">Range: £${counterMin.toLocaleString()} – £${counterMax.toLocaleString()}/wk</div>
    </div>`
    :`<div style="background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.2);border-radius:10px;padding:12px;font-size:12px;color:var(--text-dim);margin-bottom:14px;line-height:1.7;">
      ⚠️ You already made your counter-offer. You can only counter once. Accept, hold out, or walk away.
    </div>`}
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
      <button class="btn btn-primary" style="padding:12px;" onclick="acceptTransferOffer('${offerId}')">✍️ Accept — £${offer.salary.toLocaleString()}/wk</button>
      ${!hasCountered?`<button class="btn btn-gold" style="padding:12px;" onclick="submitCounterOffer('${offerId}')">💬 Counter-Offer</button>`:''}
      <button class="btn btn-ghost" style="padding:12px;" onclick="holdOutTransfer('${offerId}')">⏳ Hold Out — Push for More</button>
      <button class="btn btn-ghost" style="padding:10px;font-size:11px;color:var(--red);" onclick="declineTransferOffer('${offerId}');closeModal();App.renderDashboard();">🚫 Walk Away</button>
    </div>
    <p style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:10px;">Window closes ${window==='winter'?'Jan 31':'Aug 9 / Jun 30'}</p>`,false);
}

function submitCounterOffer(offerId){
  const offer=G.pendingTransferOffers.find(o=>o.id===offerId);
  if(!offer)return;
  const inp=document.getElementById('counterInput');
  const demand=Math.round(parseInt(inp?.value||offer.salary*1.18)/100)*100;
  const max=Math.round(offer.salary*1.35);
  offer.counterMade=true;
  offer.counterDemand=demand;
  // Club response: accept if demand ≤ 115%, reject if > 130%, 50/50 between
  const pct=demand/offer.salary;
  if(pct<=1.15){
    // They accept — revise offer
    offer.salary=demand;
    addLog('💬','Counter Accepted!',`${offer.fromClub} met your demand: £${demand.toLocaleString()}/wk`,G.season.dayOfSeason);
    showToast(`💬 Counter accepted! £${demand.toLocaleString()}/wk`,'');
    closeModal();
    setTimeout(()=>openNegotiation(offerId),200);
  } else if(pct>1.30||!E.chance(0.55)){
    // Rejected
    addLog('💬','Counter Rejected',`${offer.fromClub}: "That's too rich for us."`,G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">😤</span><div class="event-modal-title">Counter Rejected</div><div class="event-modal-subtitle">"£${demand.toLocaleString()}/wk is beyond our budget." — ${offer.fromClub}</div></div>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">Their original offer of £${offer.salary.toLocaleString()}/wk stands. Accept it or walk away.</p>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" style="flex:1;" onclick="acceptTransferOffer('${offerId}')">✍️ Accept Original</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="declineTransferOffer('${offerId}');closeModal();App.renderDashboard();">🚫 Walk Away</button>
      </div>`,false);
  } else {
    // Partial — they meet halfway
    const revised=Math.round((demand+offer.salary)/2/100)*100;
    offer.salary=revised;
    addLog('💬','Counter Partially Accepted',`${offer.fromClub} revised to £${revised.toLocaleString()}/wk`,G.season.dayOfSeason);
    showToast(`💬 ${offer.fromClub} revised to £${revised.toLocaleString()}/wk`,'');
    closeModal();
    setTimeout(()=>openNegotiation(offerId),200);
  }
}

function holdOutTransfer(offerId){
  const offer=G.pendingTransferOffers.find(o=>o.id===offerId);
  if(!offer)return;
  // 30% chance club sweetens the deal; 70% offer remains; 15% club walks
  const r=Math.random();
  if(r<0.25){
    const bonus=Math.round(offer.salary*E.rand(8,18)/100/100)*100;
    offer.salary+=bonus;
    addLog('⏳','Club Sweetened Deal',`${offer.fromClub} added £${bonus.toLocaleString()}/wk to keep talks alive`,G.season.dayOfSeason);
    showToast(`⏳ ${offer.fromClub} improved their offer!`,'');
    closeModal();setTimeout(()=>openNegotiation(offerId),200);
  } else if(r<0.45){
    // Club walks away
    G.pendingTransferOffers=G.pendingTransferOffers.filter(o=>o.id!==offerId);
    addLog('💔','Club Walked Away',`${offer.fromClub} pulled out after your hold-out.`,G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">💔</span><div class="event-modal-title">Club Walked Away</div><div class="event-modal-subtitle">"We've decided to look elsewhere." — ${offer.fromClub}</div></div>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">Your hold-out cost you the deal. The transfer is dead.</p>
      <button class="btn btn-ghost" style="width:100%;" onclick="closeModal();App.renderDashboard();">👍 Understood</button>`,false);
  } else {
    closeModal();
    addLog('⏳','Holding Out',`Staying patient. ${offer.fromClub}'s offer stands for now.`,G.season.dayOfSeason);
    showToast(`⏳ Holding out — offer remains open`,'');
    App.renderDashboard();
  }
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
  const newSalary=Math.max(G.weeklySalary+500, Math.round(E.ovrWage(G.player.overall,G.club.tier)*E.rand(100,115)/100));
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

function requestLoanCallback(){
  const day=G.season.dayOfSeason;
  if(!G.loanActive||!G.loanOriginalClub){showToast('Not currently on loan.','err');return;}
  // One chance only — if already used, show locked message
  if(G._loanRecallUsed){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🔒</span><div class="event-modal-title">Request Already Made</div><div class="event-modal-subtitle">"You already asked — and we said no. Honour the loan." — ${G.loanOriginalClub.manager.name}</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">You only get one chance to request a recall. See out the loan.</p>
    <button class="btn btn-ghost" style="width:100%;margin-top:8px;" onclick="closeModal()">👍 Understood</button>`);
    return;
  }
  G._loanRecallUsed=true; // burn the one chance
  if(E.chance(0.4)){
    const orig=G.loanOriginalClub;
    G.club={name:orig.name,tier:orig.tier,leagueId:orig.leagueId,contractYears:orig.contractYears,isFreeAgent:false,contractSignedDay:orig.contractSignedDay};
    G.manager={...orig.manager};
    G.league={name:orig.league.name,tier:orig.league.tier,teams:orig.league.teams,matchdays:orig.league.matchdays,nextMatchIdx:orig.league.nextMatchIdx};
    G.loanOriginalClub=null;
    G.loanActive=false;G.loanDaysLeft=0;G.forcedStarter=0;G._loanRecallUsed=false;
    addLog('📞','Loan Recall Granted',`${G.club.name} called you back early.`,day);
    showToast(`📞 Recalled! Back at ${G.club.name}`,'');
    App.renderDashboard();
  } else {
    const daysLeft=G.loanDaysLeft;
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">📞</span><div class="event-modal-title">Request Denied — Final Answer</div><div class="event-modal-subtitle">"No. Finish the loan. That's final." — ${G.loanOriginalClub.manager.name}</div></div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">${daysLeft} day${daysLeft!==1?'s':''} remain. You won't be able to request again — see it out.</p>
    <button class="btn btn-ghost" style="width:100%;margin-top:8px;" onclick="closeModal()">👍 Understood</button>`);
  }
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
    const salary=E.ovrWage(G.player.overall,offerTier);
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
  // Record final league position for next season's cup qualification check
  G._lastSeasonPos=getLeaguePosition();
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
    else{G.club.contractYears=E.rand(2,4);G.weeklySalary=E.ovrWage(G.player.overall,G.club.tier);G.careerLog.push({icon:'✍️',title:'Contract Auto-Renewed',detail:`£${G.weeklySalary.toLocaleString()}/wk · ${G.club.contractYears} years`,date:'End of Season'});}
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
  if(G.club.tier>1&&myPos<=league.promoted){G.club.tier--;const nl=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];G.club.leagueId=nl.id;G.weeklySalary=Math.max(G.weeklySalary,E.ovrWage(G.player.overall,G.club.tier));G.careerLog.push({icon:'🚀',title:'Promoted!',detail:`Moving up to ${nl.name}`,date:'End of Season'});G.careerStats.highestLeague=Math.min(G.careerStats.highestLeague,G.club.tier);}
  else if(league.relegated&&G.club.tier<5&&myPos>sorted.length-league.relegated){G.club.tier++;const nl=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];G.club.leagueId=nl.id;G.weeklySalary=Math.round(G.weeklySalary*.85);G.careerLog.push({icon:'📉',title:'Relegated',detail:`Dropped to ${nl.name}`,date:'End of Season'});}
  if(myPos===1){G.careerStats.trophies++;G.careerLog.push({icon:'🏆',title:`${G.league.name} Champions!`,detail:'Finished top of the league!',date:'End of Season'});}
}

function startNewSeason(){
  closeModal();if(G.club.isFreeAgent){UI.showFreeAgentOffers();return;}
  G.season={number:G.season.number+1,startYear:G.season.startYear+1,dayOfSeason:0,totalDays:365,finished:false};
  G.seasonStats={goals:0,assists:0,apps:0,motm:0,yellows:0,reds:0,wins:0,draws:0,losses:0,ratingSum:0,ratingCount:0,avgRating:0,cleanSheets:0};
  G.dayLog=[];G.matchHistory=[];G.form=[];G.injuryDaysLeft=0;G.forcedStarter=0;G.pendingEvent=null;G.wcYear=null;
  const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
  const _newTeams=E.generateLeague(G.club.tier,G.club.name);
  G.league={name:league.name,tier:G.club.tier,teams:_newTeams,matchdays:E.scheduleLeague(G.club.tier,365),nextMatchIdx:0,fixtures:null};
  G.allLeagues=E.generateAllLeagues(G.club.name,G.club.tier);
  G.cups=E.scheduleCups(G.club.tier, G.club.name, G._lastSeasonPos||99);
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
    offers.push({id:`fa_${i}`,fromClub:club,tier,league:league.name,salary:E.ovrWage(G.player.overall,tier),contractYears:E.rand(1,3)});
  }
  return offers;
}
function signFreeAgent(offerId){
  const offer=G._faOffers?.find(o=>o.id===offerId);if(!offer)return;
  G.club={name:offer.fromClub,tier:offer.tier,leagueId:LEAGUES.find(l=>l.tier===offer.tier)?.id||'L4',contractYears:offer.contractYears,isFreeAgent:false,contractSignedDay:G.season.dayOfSeason};
  G.weeklySalary=offer.salary;G.manager={name:_getManagerName(offer.fromClub),title:E.pick(MANAGER_TITLES),teamAvgOVR:E.rand(58,78)};
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
    // ── Migration: trim bracket rounds that were pre-built by old code ──────
    // Old code built ALL rounds upfront; new code only builds round-by-round.
    // Trim any bracketRounds beyond stage+1 (which is the max that should exist).
    if(G.cups){
      Object.keys(G.cups).forEach(cupId=>{
        const cup=G.cups[cupId];
        if(cup&&cup.bracketRounds&&Array.isArray(cup.bracketRounds)){
          const maxAllowed=cup.eliminated||cup.winner?cup.stage+1:(cup.stage+1);
          if(cup.bracketRounds.length>maxAllowed){
            cup.bracketRounds=cup.bracketRounds.slice(0,maxAllowed);
          }
        }
      });
    }
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
    retiredInGame:E.getDayLabel(G.season.dayOfSeason),
    retiredInGameYear:G.season.startYear,
    retiredIRL:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),
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
