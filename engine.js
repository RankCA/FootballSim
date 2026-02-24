// ═══════════════════════════════════════════════
//  ProPath — Game Engine
// ═══════════════════════════════════════════════

const Engine = (() => {

  // ── Utilities ──────────────────────────────
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randFloat(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pick(arr) { return arr[rand(0, arr.length - 1)]; }

  // ── OVR Calculation ────────────────────────
  function calcOVR(attrs, pos) {
    const w = POS_WEIGHTS[pos] || POS_WEIGHTS.CM;
    let sum = 0, wSum = 0;
    Object.keys(w).forEach(k => { sum += (attrs[k] || 50) * w[k]; wSum += w[k]; });
    return clamp(Math.round(sum / wSum), 30, 99);
  }

  // ── Attribute Generation ───────────────────
  // Age scale: 15 = very raw, 30 = fully developed
  // 15yo target OVR ~55-58, 17yo ~60-63, 22yo ~67-70, 27yo ~72-76
  function buildAttributes(pos, age, traitIdx) {
    const base = POS_BASE[pos] || POS_BASE.CM;
    const trait = TRAITS[traitIdx];

    // Age development factor: 0 at 15, peaks around 27-28
    // Realistic curve: +1.4 per year 15-23, then +0.8/yr to 28
    const devYears = Math.max(0, age - 15);
    const ageFactor = devYears <= 8
      ? devYears * 1.4
      : 8 * 1.4 + (devYears - 8) * 0.8;

    const attrs = {};
    const STAT_KEYS = ['pace','shooting','passing','dribbling','defending','physical'];
    STAT_KEYS.forEach(k => {
      let v = base[k]
        + Math.round(ageFactor * 0.7)   // age development
        + rand(-3, 3);                   // slight randomness
      if (trait?.boosts?.[k]) v += trait.boosts[k];
      attrs[k] = clamp(v, 28, 90);
    });

    return attrs;
  }

  function calcPotential(ovr, age) {
    // Younger = higher ceiling above current OVR
    const ceilingBonus = Math.max(0, 27 - age) * 1.8 + rand(3, 10);
    return clamp(Math.round(ovr + ceilingBonus), ovr + 2, 95);
  }

  // ── Starting Club ──────────────────────────
  function assignStartingClub(age, ovr) {
    let tier;
    if (age <= 17)        tier = 5;
    else if (ovr < 62)    tier = 5;
    else if (ovr < 66)    tier = 4;
    else if (ovr < 70)    tier = 3;
    else if (ovr < 74)    tier = 2;
    else                  tier = 1;
    const leagueData = LEAGUES.find(l => l.tier === tier) || LEAGUES[0];
    const clubName   = pick(CLUBS[tier]);
    return { ...leagueData, clubName };
  }

  // ── Week Simulation ────────────────────────
  // Returns an event object for a given week
  function simulateWeek(state) {
    const { player, season } = state;
    const events = [];
    const isMatchWeek = Math.random() < 0.75; // ~75% chance of a fixture

    if (isMatchWeek) {
      const matchResult = simulateMatch(player, season.club);
      events.push(matchResult);

      // Small chance of injury
      if (Math.random() < 0.05) {
        const weeks = rand(1, 4);
        events.push({
          type: 'injury',
          icon: '🤕',
          title: `Injury — Out ${weeks} week${weeks>1?'s':''}`,
          detail: pick(MATCH_EVENTS.injury),
          weeksOut: weeks,
        });
      }
    } else {
      // Training / rest week
      events.push(simulateTraining(player));
    }

    // Rare attribute improvement (training gain)
    if (Math.random() < 0.15) {
      const gain = simulateAttributeGain(player);
      if (gain) events.push(gain);
    }

    return events;
  }

  function simulateMatch(player, club) {
    const goalsScored = rand(0, 3);
    const goalsConceded = rand(0, 3);
    const result = goalsScored > goalsConceded ? 'W' : goalsScored < goalsConceded ? 'L' : 'D';
    const resultColor = result === 'W' ? '#00e5a0' : result === 'L' ? '#ff4757' : '#f5c842';

    const isAttacking = ['ST','CF','LW','RW','LM','RM','CAM'].includes(player.position);
    const isMidfield  = ['CM','CDM'].includes(player.position);
    const isDefending = ['CB','LB','RB','GK'].includes(player.position);

    let goals = 0, assists = 0, rating = rand(55, 85);
    const isMotm = Math.random() < 0.15;
    const gotYellow = Math.random() < 0.08;
    const gotRed = !gotYellow && Math.random() < 0.02;

    if (isAttacking && goalsScored > 0) {
      goals   = Math.min(rand(0, 2), goalsScored);
      assists = goals < goalsScored ? (Math.random() < 0.4 ? 1 : 0) : 0;
    } else if (isMidfield && goalsScored > 0) {
      assists = Math.random() < 0.35 ? 1 : 0;
      goals   = Math.random() < 0.1 ? 1 : 0;
    }

    if (isMotm) rating = clamp(rating + rand(5, 12), 70, 99);
    if (gotRed) rating = clamp(rating - rand(15, 25), 30, 99);

    const resultStr = `${goalsScored}–${goalsConceded}`;
    let detail = '';
    if (goals > 0)   detail += `${goals} goal${goals>1?'s':''} — "${pick(MATCH_EVENTS.goal)}". `;
    if (assists > 0) detail += `${assists} assist — "${pick(MATCH_EVENTS.assist)}". `;
    if (isMotm)      detail += `🌟 Man of the Match — "${pick(MATCH_EVENTS.motm)}".`;
    if (gotYellow)   detail += `🟨 Booked — ${pick(MATCH_EVENTS.yellow)}.`;
    if (gotRed)      detail += `🟥 Sent off — ${pick(MATCH_EVENTS.red)}.`;
    if (!detail)     detail  = `Solid ${rating >= 70 ? 'performance' : 'outing'} for the team.`;

    return {
      type: 'match',
      icon: '⚽',
      result, resultStr, resultColor,
      goals, assists, rating: Math.round(rating),
      isMotm, gotYellow, gotRed,
      title: `${club.clubName} ${resultStr}`,
      detail: detail.trim(),
    };
  }

  function simulateTraining(player) {
    const types = [
      {icon:'🏋️',title:'Gym Session',    detail:'Heavy weights session — physical conditioning.'},
      {icon:'🎯',title:'Finishing Drills', detail:'Clinical work in front of goal with the coaches.'},
      {icon:'🏃',title:'Sprint Training', detail:'Explosive pace work on the training ground.'},
      {icon:'🧠',title:'Tactical Session',detail:'Watched footage and worked on positional awareness.'},
      {icon:'🤸',title:'Recovery Day',    detail:'Light stretching and pool session — feeling fresh.'},
      {icon:'🎽',title:'Team Practice',   detail:'Full squad session — chemistry building with teammates.'},
    ];
    return { type:'training', ...pick(types) };
  }

  function simulateAttributeGain(player) {
    const keys = ['pace','shooting','passing','dribbling','defending','physical'];
    // Weight gains towards position-relevant stats
    const w = POS_WEIGHTS[player.position] || {};
    const weighted = keys.map(k => ({ k, w: w[k] || 1 }));
    weighted.sort((a,b) => b.w - a.w);
    const topStats = weighted.slice(0, 4);
    const chosen = pick(topStats).k;

    const current = player.attrs[chosen];
    if (current >= 90) return null;

    const gain = rand(1, 2);
    const newVal = clamp(current + gain, 0, 90);
    if (newVal === current) return null;

    const labels = {pace:'Pace',shooting:'Shooting',passing:'Passing',dribbling:'Dribbling',defending:'Defending',physical:'Physical'};
    return {
      type: 'growth',
      icon: '📈',
      title: `${labels[chosen]} improved! +${gain}`,
      detail: `${labels[chosen]} now at ${newVal}`,
      statKey: chosen,
      statDelta: gain,
      newVal,
    };
  }

  // ── Season / week calendar ─────────────────
  // 10 months × 4 weeks = 40 weeks per season
  function getWeekLabel(weekIndex) {
    // weekIndex: 0-39
    const monthIdx = Math.floor(weekIndex / 4);
    const weekNum  = (weekIndex % 4) + 1;
    const month    = SEASON_MONTHS[monthIdx] || 'May';
    const suffix   = ['st','nd','rd','th'][weekNum - 1] || 'th';
    return `${month}, Week ${weekNum}`;
  }

  function getSeasonYear(startYear, weekIndex) {
    const monthIdx = Math.floor(weekIndex / 4);
    // July–December = startYear, Jan–April = startYear+1
    return monthIdx >= 6 ? startYear + 1 : startYear;
  }

  // ── Career milestone checks ────────────────
  function checkMilestones(state) {
    const milestones = [];
    const { seasonStats, careerStats, player } = state;

    if (seasonStats.goals === 10 && !state.achievements.has('10goals_season'))
      milestones.push({ icon:'🎯', title:'10 Goals in a Season!', detail:'Reached double figures for the first time.' });
    if (seasonStats.goals === 20 && !state.achievements.has('20goals_season'))
      milestones.push({ icon:'🔥', title:'20-Goal Season!', detail:'An outstanding return — top scorer material.' });
    if (careerStats.goals === 50 && !state.achievements.has('50goals_career'))
      milestones.push({ icon:'⭐', title:'50 Career Goals!', detail:'Half a century — a remarkable milestone.' });
    if (seasonStats.motm >= 5 && !state.achievements.has('5motm_season'))
      milestones.push({ icon:'🌟', title:'5 MOTMs This Season!', detail:'Consistently the best player on the pitch.' });

    return milestones;
  }

  // Public API
  return {
    rand, randFloat, clamp, pick,
    calcOVR, buildAttributes, calcPotential,
    assignStartingClub, simulateWeek,
    getWeekLabel, getSeasonYear,
    checkMilestones,
  };

})();
