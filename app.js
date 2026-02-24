// ═══════════════════════════════════════════════
//  ProPath — App Controller
// ═══════════════════════════════════════════════

const App = (() => {

  // ── Internal state ─────────────────────────
  let _draft = {
    firstName:'', lastName:'', nickname:'',
    age: 17, nation: null, position: null, foot: 'Right', trait: null,
  };

  let _filteredNations = [...NATIONS];

  // ── Navigation ─────────────────────────────
  function goTo(n) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + n);
    if (el) el.classList.add('active');

    if (n >= 1 && n <= 4) _renderSteps(n);
    if (n === 2) _renderNations();
    if (n === 3) { _renderPositions(); _renderTraits(); }
    if (n === 4) { _buildAndReview(); }
    if (n === 5) _renderDashboard();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetGame() {
    _draft = { firstName:'', lastName:'', nickname:'', age:17, nation:null, position:null, foot:'Right', trait:null };
    const f = document.getElementById('firstName');
    const l = document.getElementById('lastName');
    const nk = document.getElementById('nickname');
    if (f)  f.value  = '';
    if (l)  l.value  = '';
    if (nk) nk.value = '';
    const sl = document.getElementById('ageSlider');
    if (sl) sl.value = 17;
    updateAge(17);
    document.getElementById('foot-Right')?.classList.add('selected');
    document.getElementById('foot-Left')?.classList.remove('selected');
    document.getElementById('foot-Both')?.classList.remove('selected');
  }

  // ── Steps bar ──────────────────────────────
  function _renderSteps(active) {
    const labels = ['Identity','Nationality','Position','Review'];
    const html = labels.map((l,i) => {
      const n = i + 1;
      const cls = n < active ? 'step done' : n === active ? 'step active' : 'step';
      const dot = n < active ? '✓' : n;
      return `<div class="${cls}"><div class="step-dot">${dot}</div><span>${l}</span></div>${i<3?'<div class="step-line"></div>':''}`;
    }).join('');
    document.querySelectorAll('.steps-bar').forEach(el => el.innerHTML = html);
  }

  // ── Screen 1 ───────────────────────────────
  function updateAge(v) {
    v = parseInt(v);
    document.getElementById('ageDisplay').textContent = v;
    document.getElementById('ageDesc').textContent = AGE_DESC[v] || '';
    _draft.age = v;
  }

  function validateStep1() {
    _draft.firstName = document.getElementById('firstName').value.trim();
    _draft.lastName  = document.getElementById('lastName').value.trim();
    _draft.nickname  = document.getElementById('nickname').value.trim();
    let ok = true;
    if (!_draft.firstName) { _showErr('err-first'); ok = false; } else _hideErr('err-first');
    if (!_draft.lastName)  { _showErr('err-last');  ok = false; } else _hideErr('err-last');
    if (ok) goTo(2);
  }

  // ── Screen 2 — Nations ─────────────────────
  function _renderNations() {
    const grid = document.getElementById('nationsGrid');
    if (!grid) return;
    grid.innerHTML = _filteredNations.map(n => `
      <div class="nation-btn ${_draft.nation===n.name?'selected':''}" onclick="App.selectNation('${n.name.replace(/'/g,"\\'")}')">
        <span class="nation-flag">${n.flag}</span>
        <span>${n.name}</span>
      </div>`).join('');
  }

  function filterNations(q) {
    _filteredNations = NATIONS.filter(n => n.name.toLowerCase().includes(q.toLowerCase()));
    _renderNations();
  }

  function selectNation(name) {
    _draft.nation = name;
    _hideErr('err-nation');
    _renderNations();
  }

  function validateStep2() {
    if (!_draft.nation) { _showErr('err-nation'); return; }
    goTo(3);
  }

  // ── Screen 3 — Position & Style ────────────
  function _renderPositions() {
    const el = document.getElementById('posGrid');
    if (!el) return;
    el.innerHTML = POSITIONS.map(p => `
      <div class="pos-btn ${_draft.position===p.acronym?'selected':''}" onclick="App.selectPos('${p.acronym}')">
        <span class="pos-acronym">${p.acronym}</span>
        <span class="pos-name">${p.name}</span>
      </div>`).join('');
  }

  function selectPos(ac) {
    _draft.position = ac;
    _hideErr('err-pos');
    _renderPositions();
  }

  function selectFoot(f) {
    _draft.foot = f;
    ['Right','Left','Both'].forEach(x => {
      document.getElementById('foot-' + x)?.classList.toggle('selected', x === f);
    });
  }

  function _renderTraits() {
    const el = document.getElementById('traitGrid');
    if (!el) return;
    el.innerHTML = TRAITS.map((t,i) => `
      <div class="trait-card ${_draft.trait===i?'selected':''}" onclick="App.selectTrait(${i})">
        <span class="trait-icon">${t.icon}</span>
        <div class="trait-name">${t.name}</div>
        <div class="trait-desc">${t.desc}</div>
      </div>`).join('');
  }

  function selectTrait(i) {
    _draft.trait = i;
    _hideErr('err-trait');
    _renderTraits();
  }

  function validateStep3() {
    let ok = true;
    if (!_draft.position)      { _showErr('err-pos');   ok = false; } else _hideErr('err-pos');
    if (_draft.trait === null)  { _showErr('err-trait'); ok = false; } else _hideErr('err-trait');
    if (ok) goTo(4);
  }

  // ── Screen 4 — Review ──────────────────────
  function _buildAndReview() {
    const attrs   = Engine.buildAttributes(_draft.position, _draft.age, _draft.trait);
    const overall = Engine.calcOVR(attrs, _draft.position);
    const pot     = Engine.calcPotential(overall, _draft.age);

    _draft.attrs   = attrs;
    _draft.overall = overall;
    _draft.potential = pot;

    const nat   = NATIONS.find(n => n.name === _draft.nation) || {flag:'🌍'};
    const pos   = POSITIONS.find(p => p.acronym === _draft.position) || {};
    const trait = TRAITS[_draft.trait] || {};

    // Player card
    document.getElementById('reviewPlayerCard').innerHTML = UI.playerCard(_draft, null);

    // Summary pills
    document.getElementById('summaryGrid').innerHTML = [
      {label:'Full Name',      value:`${_draft.firstName} ${_draft.lastName}`},
      {label:'Nickname',       value: _draft.nickname || '—'},
      {label:'Nationality',    value:`${nat.flag} ${_draft.nation}`},
      {label:'Position',       value:`${_draft.position} · ${pos.name||''}`},
      {label:'Preferred Foot', value: _draft.foot},
      {label:'Playing Style',  value:`${trait.icon||''} ${trait.name||''}`},
      {label:'Starting Age',   value:`${_draft.age} yrs`},
      {label:'Potential',      value:`${pot} OVR`},
    ].map(({label,value}) => `
      <div class="summary-item">
        <div class="s-label">${label}</div>
        <div class="s-value">${value}</div>
      </div>`).join('');

    // Stat bars
    document.getElementById('statBars').innerHTML = UI.statBarsHTML(attrs);
    // Trigger animation next tick
    setTimeout(() => {
      document.querySelectorAll('.stat-bar-fill').forEach(bar => {
        bar.style.width = bar.style.width; // force reflow
      });
    }, 50);
  }

  function startCareer() {
    const playerData = { ..._draft };
    State.init(playerData);
    goTo(5);
  }

  // ── Screen 5 — Dashboard ───────────────────
  function _renderDashboard() {
    const s = State.get();
    if (!s) return;

    const { player, season, seasonStats, careerStats, careerLog, form } = s;
    const nat   = NATIONS.find(n => n.name === player.nation) || {flag:'🌍'};
    const startYear = season.startYear;
    const endYear   = startYear + 1;

    // Greeting
    document.getElementById('dashGreeting').textContent =
      `Season ${season.number} · ${player.nickname || player.firstName} ${player.lastName}`;
    document.getElementById('dashSubtitle').textContent =
      `${nat.flag} ${player.nation} · ${player.position} · ${season.club.clubName} · ${season.club.name}`;
    document.getElementById('seasonBadge').textContent =
      `${startYear}/${String(endYear).slice(2)} Season`;

    // Player card
    document.getElementById('dashPlayerCard').innerHTML = UI.playerCard(player, season.club);

    // Season progress
    document.getElementById('seasonProgress').innerHTML =
      UI.seasonProgressBar(season.week, season.totalWeeks);

    // Season stat pills
    document.getElementById('seasonStatPills').innerHTML =
      UI.seasonStatPills(seasonStats, season.club);

    // Attributes
    document.getElementById('dashAttrs').innerHTML = UI.attrGridHTML(player.attrs);

    // Form
    document.getElementById('formDots').innerHTML = UI.formHTML(form);

    // Potential
    document.getElementById('potDisplay').textContent = player.potential + ' OVR';

    // Career log
    document.getElementById('careerLog').innerHTML =
      [...careerLog].reverse().map(UI.careerLogEntry).join('');

    // Week label
    const wl = season.week < season.totalWeeks
      ? Engine.getWeekLabel(season.week)
      : 'End of Season';
    document.getElementById('currentWeekLabel').textContent = wl;

    // Buttons
    const advBtn    = document.getElementById('advanceBtn');
    const skipBtn   = document.getElementById('skipMonthBtn');
    if (season.finished) {
      if (advBtn)  { advBtn.textContent  = '🏁 Season Finished'; advBtn.disabled = true; }
      if (skipBtn) { skipBtn.style.display = 'none'; }
      _showSeasonEndModal();
    } else {
      if (advBtn)  { advBtn.textContent  = '▶ Advance Week'; advBtn.disabled = false; }
      if (skipBtn) { skipBtn.style.display = ''; }
    }

    // History
    _renderHistory();
  }

  function _renderHistory() {
    const s = State.get();
    if (!s) return;
    const el = document.getElementById('weekHistory');
    if (!el) return;
    if (s.weekLog.length === 0) {
      el.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:12px;">No weeks played yet.</div>';
      return;
    }
    el.innerHTML = [...s.weekLog].reverse().map(entry => {
      const matchEv = entry.events.find(e => e.type === 'match');
      const growEv  = entry.events.find(e => e.type === 'growth');
      let summary = 'Training week';
      let badge = '';
      if (matchEv) {
        summary = matchEv.title;
        const rc = matchEv.resultColor || '#999';
        badge = `<span class="hr-badge" style="color:${rc};">${matchEv.result} ${matchEv.resultStr}</span>`;
        if (matchEv.goals > 0) badge += ` <span style="font-size:10px;color:var(--text-dim);">⚽${matchEv.goals}</span>`;
        if (matchEv.isMotm)   badge += ` <span style="font-size:10px;color:var(--gold);">★</span>`;
      }
      if (growEv && !matchEv) {
        summary = growEv.title;
        badge = `<span style="font-size:10px;color:var(--accent);">📈</span>`;
      }
      return `
        <div class="history-row">
          <span class="hr-week">${entry.weekLabel}</span>
          <span class="hr-summary">${summary}</span>
          <span>${badge}</span>
        </div>`;
    }).join('');
  }

  // ── Advance week ───────────────────────────
  function advanceWeek() {
    const s = State.get();
    if (!s || s.season.finished) return;

    const entry = State.advanceWeek();
    if (!entry) return;

    // Update last week events panel
    const evEl = document.getElementById('lastWeekEvents');
    if (evEl && entry.events.length > 0) {
      evEl.innerHTML = entry.events.map(UI.weekEventHTML).join('');
    }

    // Re-render dynamic parts without full screen refresh
    _updateDashParts();

    // Toast for notable events
    const match = entry.events.find(e => e.type === 'match');
    if (match?.isMotm)  _toast('🌟 Man of the Match!');
    if (match?.goals > 1) _toast(`🎯 ${match.goals} goals this week!`);
    const milestone = entry.events.find(e => e.type === 'milestone');
    if (milestone) _toast(`🏆 ${milestone.title}`);
    const growth = entry.events.find(e => e.type === 'growth');
    if (growth) _toast(`📈 ${growth.title}`);
  }

  function skipMonth() {
    const s = State.get();
    if (!s || s.season.finished) return;
    // Advance 4 weeks (but stop if season ends)
    for (let i = 0; i < 4; i++) {
      if (s.season.finished) break;
      State.advanceWeek();
    }
    _updateDashParts();
    // Show last week events summary
    const log  = s.weekLog;
    const last  = log[log.length - 1];
    const evEl  = document.getElementById('lastWeekEvents');
    if (evEl && last) {
      evEl.innerHTML = last.events.map(UI.weekEventHTML).join('');
    }
    _toast('⏩ Skipped to next month');
  }

  function _updateDashParts() {
    const s = State.get();
    if (!s) return;
    const { player, season, seasonStats, careerLog, form } = s;

    // Season progress
    document.getElementById('seasonProgress').innerHTML =
      UI.seasonProgressBar(season.week, season.totalWeeks);

    // Stat pills
    document.getElementById('seasonStatPills').innerHTML =
      UI.seasonStatPills(seasonStats, season.club);

    // Week label
    const wl = season.week < season.totalWeeks
      ? Engine.getWeekLabel(season.week)
      : '— End of Season —';
    document.getElementById('currentWeekLabel').textContent = wl;

    // Attributes (may have grown)
    document.getElementById('dashAttrs').innerHTML = UI.attrGridHTML(player.attrs);
    document.getElementById('formDots').innerHTML  = UI.formHTML(form);

    // Career log
    document.getElementById('careerLog').innerHTML =
      [...careerLog].reverse().map(UI.careerLogEntry).join('');

    // History log
    _renderHistory();

    // Player card OVR may have changed
    document.getElementById('dashPlayerCard').innerHTML = UI.playerCard(player, season.club);

    // Season end?
    if (season.finished) {
      const advBtn  = document.getElementById('advanceBtn');
      const skipBtn = document.getElementById('skipMonthBtn');
      if (advBtn)  { advBtn.textContent = '🏁 Season Finished'; advBtn.disabled = true; }
      if (skipBtn) skipBtn.style.display = 'none';
      setTimeout(_showSeasonEndModal, 600);
    }
  }

  // ── Season end modal ───────────────────────
  function _showSeasonEndModal() {
    const s = State.get();
    if (!s) return;
    const { seasonStats, player, season, careerStats } = s;

    const result = seasonStats.wins > seasonStats.losses ? 'Strong season!' :
                   seasonStats.wins === seasonStats.losses ? 'Solid effort.' : 'Room to grow.';

    const newOvr = player.overall;
    document.getElementById('modalContent').innerHTML = `
      <p style="color:var(--text-dim);font-size:14px;margin-bottom:16px;">
        ${player.firstName} ${player.lastName} — Season ${season.number} in the books.
        <strong>${result}</strong>
      </p>
      <div class="modal-stat-grid">
        <div class="modal-stat"><div class="ms-label">Goals</div><div class="ms-val" style="color:var(--accent);">${seasonStats.goals}</div></div>
        <div class="modal-stat"><div class="ms-label">Assists</div><div class="ms-val" style="color:var(--blue);">${seasonStats.assists}</div></div>
        <div class="modal-stat"><div class="ms-label">Appearances</div><div class="ms-val">${seasonStats.appearances}</div></div>
        <div class="modal-stat"><div class="ms-label">Avg Rating</div><div class="ms-val" style="color:var(--gold);">${seasonStats.avgRating || '—'}</div></div>
        <div class="modal-stat"><div class="ms-label">MOTM</div><div class="ms-val" style="color:var(--gold);">${seasonStats.motm}</div></div>
        <div class="modal-stat"><div class="ms-label">New OVR</div><div class="ms-val" style="color:var(--accent2);">${newOvr}</div></div>
      </div>
      <p style="font-size:13px;color:var(--text-dim);margin-top:8px;">
        Age: ${player.age} · Club: ${season.club.clubName}
      </p>
    `;
    document.getElementById('seasonEndModal').style.display = 'flex';
  }

  function nextSeason() {
    document.getElementById('seasonEndModal').style.display = 'none';
    State.startNewSeason();
    _renderDashboard();
    document.getElementById('lastWeekEvents').innerHTML = `
      <div class="empty-state">
        <div style="font-size:36px;margin-bottom:10px;">🏟️</div>
        <div>New season begins — click <strong>Advance Week</strong> to kick off!</div>
      </div>`;
    _toast('🆕 New season started!');
  }

  // ── Utilities ──────────────────────────────
  function _showErr(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'block'; el.classList.add('show'); }
  }
  function _hideErr(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.classList.remove('show'); }
  }
  function _toast(msg, ms = 2800) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), ms);
  }

  // ── Init ───────────────────────────────────
  function init() {
    updateAge(17);
    document.getElementById('foot-Right')?.classList.add('selected');
  }

  // Public
  return {
    goTo, resetGame,
    updateAge,
    validateStep1, validateStep2, validateStep3,
    filterNations, selectNation,
    selectPos, selectFoot, selectTrait,
    startCareer,
    advanceWeek, skipMonth,
    nextSeason,
    init,
  };

})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);
