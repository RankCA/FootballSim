// ═══════════════════════════════════════════════
//  ProPath — State Manager
// ═══════════════════════════════════════════════

const State = (() => {

  let _state = null;

  function init(playerData) {
    const startYear = new Date().getFullYear();
    const club = Engine.assignStartingClub(playerData.age, playerData.overall);

    _state = {
      player: { ...playerData },
      season: {
        number: 1,
        startYear,
        club,
        week: 0,         // 0-39 (40 weeks per season)
        totalWeeks: 40,
        finished: false,
      },
      seasonStats: {
        goals: 0, assists: 0, appearances: 0,
        motm: 0, yellowCards: 0, redCards: 0,
        wins: 0, draws: 0, losses: 0,
        avgRating: 0, ratingSum: 0, ratingCount: 0,
      },
      careerStats: {
        goals: 0, assists: 0, appearances: 0,
        motm: 0, seasons: 0, trophies: 0,
        yellowCards: 0, redCards: 0,
      },
      weekLog: [],       // array of {weekLabel, events[]}
      careerLog: [],     // notable milestones/events across career
      achievements: new Set(),
      injuryWeeksRemaining: 0,
      form: [],          // last 5 match ratings
    };

    // Opening career log entry
    _state.careerLog.push({
      icon: '🎉',
      title: `Career Kicked Off`,
      detail: `${playerData.firstName} ${playerData.lastName} signs for ${club.clubName} — ${club.name}`,
      week: 'Pre-Season',
    });

    return _state;
  }

  function get() { return _state; }

  function advanceWeek() {
    if (!_state || _state.season.finished) return null;

    const { season, player } = _state;
    const weekLabel = Engine.getWeekLabel(season.week);

    // Handle injury absence
    if (_state.injuryWeeksRemaining > 0) {
      _state.injuryWeeksRemaining--;
      const entry = {
        weekLabel,
        events: [{
          type: 'injured',
          icon: '🤕',
          title: 'Sidelined — Recovery Week',
          detail: `${_state.injuryWeeksRemaining} week${_state.injuryWeeksRemaining !== 1 ? 's' : ''} remaining.`,
        }]
      };
      _state.weekLog.push(entry);
      season.week++;
      if (season.week >= season.totalWeeks) endSeason();
      return entry;
    }

    // Simulate week
    const rawEvents = Engine.simulateWeek(_state);
    const entry = { weekLabel, events: rawEvents };

    // Apply events to stats
    rawEvents.forEach(e => {
      if (e.type === 'match') {
        _state.seasonStats.appearances++;
        _state.careerStats.appearances++;
        _state.seasonStats.goals += e.goals;
        _state.careerStats.goals += e.goals;
        _state.seasonStats.assists += e.assists;
        _state.careerStats.assists += e.assists;
        if (e.isMotm)    { _state.seasonStats.motm++; _state.careerStats.motm++; }
        if (e.gotYellow) { _state.seasonStats.yellowCards++; _state.careerStats.yellowCards++; }
        if (e.gotRed)    { _state.seasonStats.redCards++;    _state.careerStats.redCards++; }
        if (e.result==='W') _state.seasonStats.wins++;
        if (e.result==='D') _state.seasonStats.draws++;
        if (e.result==='L') _state.seasonStats.losses++;
        _state.seasonStats.ratingSum += e.rating;
        _state.seasonStats.ratingCount++;
        _state.seasonStats.avgRating = Math.round(
          _state.seasonStats.ratingSum / _state.seasonStats.ratingCount
        );
        // Update form (last 5)
        _state.form.push(e.rating);
        if (_state.form.length > 5) _state.form.shift();
      }
      if (e.type === 'injury') {
        _state.injuryWeeksRemaining = e.weeksOut;
        _state.careerLog.push({ icon:e.icon, title:e.title, detail:e.detail, week:weekLabel });
      }
      if (e.type === 'growth') {
        player.attrs[e.statKey] = e.newVal;
        player.overall = Engine.calcOVR(player.attrs, player.position);
      }
    });

    // Check milestones
    const milestones = Engine.checkMilestones(_state);
    milestones.forEach(m => {
      _state.achievements.add(m.title);
      entry.events.push({ ...m, type:'milestone' });
      _state.careerLog.push({ icon:m.icon, title:m.title, detail:m.detail, week:weekLabel });
    });

    _state.weekLog.push(entry);
    season.week++;

    if (season.week >= season.totalWeeks) endSeason();

    return entry;
  }

  function endSeason() {
    const s = _state;
    s.season.finished = true;
    s.careerStats.seasons++;

    // Age up
    s.player.age++;

    // Season summary entry in career log
    const st = s.seasonStats;
    s.careerLog.push({
      icon: '🏁',
      title: `Season ${s.season.number} Complete`,
      detail: `${st.appearances} apps · ${st.goals}G ${st.assists}A · Avg Rating ${st.avgRating || '—'}`,
      week: 'End of Season',
    });

    // Potential OVR growth — slight boost each season (larger when younger)
    const ageBoostFactor = Math.max(0.2, 1.4 - (s.player.age - 17) * 0.1);
    const keys = ['pace','shooting','passing','dribbling','defending','physical'];
    const w = POS_WEIGHTS[s.player.position] || {};
    // Top 3 position-relevant stats grow
    const sorted = keys.slice().sort((a,b) => (w[b]||1) - (w[a]||1));
    sorted.slice(0,3).forEach(k => {
      const gain = Engine.rand(0, Math.round(2 * ageBoostFactor));
      s.player.attrs[k] = Engine.clamp(s.player.attrs[k] + gain, 0, 90);
    });
    s.player.overall = Engine.calcOVR(s.player.attrs, s.player.position);
  }

  function startNewSeason() {
    const s = _state;
    if (!s) return;

    const prevClub = s.season.club;
    const newClub  = maybeTransfer(s) || prevClub;

    s.season = {
      number: s.season.number + 1,
      startYear: s.season.startYear + 1,
      club: newClub,
      week: 0,
      totalWeeks: 40,
      finished: false,
    };

    // Reset season stats
    s.seasonStats = {
      goals:0, assists:0, appearances:0, motm:0,
      yellowCards:0, redCards:0, wins:0, draws:0, losses:0,
      avgRating:0, ratingSum:0, ratingCount:0,
    };
    s.weekLog = [];
    s.form = [];

    if (newClub.clubName !== prevClub.clubName) {
      s.careerLog.push({
        icon: '✍️',
        title: `Transfer: ${newClub.clubName}`,
        detail: `Moved from ${prevClub.clubName} — now in the ${newClub.name}`,
        week: 'Pre-Season',
      });
    } else {
      s.careerLog.push({
        icon: '🔄',
        title: `Season ${s.season.number} Begins`,
        detail: `Still at ${newClub.clubName} — aiming higher this year.`,
        week: 'Pre-Season',
      });
    }
  }

  function maybeTransfer(s) {
    const ovr = s.player.overall;
    const prevTier = s.season.club.tier;

    // Chance to move up a tier based on OVR
    const moveUpThresholds = {5:58, 4:63, 3:67, 2:72};
    const threshold = moveUpThresholds[prevTier];
    if (threshold && ovr >= threshold && Math.random() < 0.55) {
      const newTier = prevTier - 1;
      const leagueData = LEAGUES.find(l => l.tier === newTier);
      const clubName   = Engine.pick(CLUBS[newTier]);
      return { ...leagueData, clubName };
    }
    return null;
  }

  return { init, get, advanceWeek, startNewSeason };

})();
