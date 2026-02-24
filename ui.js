// ═══════════════════════════════════════════════
//  ProPath — UI Renderer
// ═══════════════════════════════════════════════

const UI = (() => {

  // ── Shared helpers ─────────────────────────
  function ratingColor(v) {
    if (v >= 80) return '#00e5a0';
    if (v >= 70) return '#f5c842';
    if (v >= 60) return '#ff6b35';
    return '#ff4757';
  }

  function statColor(v) {
    if (v >= 75) return 'good';
    if (v >= 60) return 'mid';
    return 'low';
  }

  function formDot(r) {
    const c = r >= 72 ? '#00e5a0' : r >= 60 ? '#f5c842' : '#ff4757';
    return `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin:0 2px;" title="Rating: ${r}"></span>`;
  }

  // ── Player card HTML ───────────────────────
  function playerCard(player, club) {
    const nat = NATIONS.find(n => n.name === player.nation) || {flag:'🌍'};
    const trait = TRAITS[player.trait] || {};
    return `
      <div class="player-card-preview">
        <div class="card-avatar">${nat.flag}</div>
        <div class="card-info">
          <div class="card-name">${player.firstName.toUpperCase()} ${player.lastName.toUpperCase()}</div>
          <div class="card-meta">
            <span class="meta-pill pos">${player.position}</span>
            <span class="meta-pill age">Age ${player.age}</span>
            <span class="meta-pill nat">${nat.flag} ${player.nation}</span>
            <span class="meta-pill" style="color:var(--accent2);border-color:rgba(255,107,53,.3);">${trait.icon||''} ${trait.name||''}</span>
            ${club ? `<span class="meta-pill" style="color:var(--blue);border-color:rgba(74,158,255,.3);">🏟️ ${club.clubName}</span>` : ''}
          </div>
        </div>
        <div class="card-rating">
          <div class="rating-num" style="color:#fff;">${player.overall}</div>
          <div class="rating-label">OVR</div>
        </div>
      </div>`;
  }

  // ── Stat bars ──────────────────────────────
  function statBarsHTML(attrs) {
    const stats = [
      {name:'PACE',      key:'pace',      color:'#00e5a0'},
      {name:'SHOOTING',  key:'shooting',  color:'#ff6b35'},
      {name:'PASSING',   key:'passing',   color:'#4a9eff'},
      {name:'DRIBBLING', key:'dribbling', color:'#f5c842'},
      {name:'DEFENDING', key:'defending', color:'#a78bfa'},
      {name:'PHYSICAL',  key:'physical',  color:'#fb7185'},
    ];
    return stats.map(({name,key,color}) => {
      const val = attrs[key] || 0;
      return `
        <div class="stat-row">
          <span class="stat-name">${name}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${val}%;background:${color};"></div>
          </div>
          <span class="stat-val" style="color:${color};">${val}</span>
        </div>`;
    }).join('');
  }

  // ── Attr grid (compact) ────────────────────
  function attrGridHTML(attrs) {
    const items = [
      {l:'PAC',k:'pace'},{l:'SHO',k:'shooting'},{l:'PAS',k:'passing'},
      {l:'DRI',k:'dribbling'},{l:'DEF',k:'defending'},{l:'PHY',k:'physical'},
    ];
    return items.map(({l,k}) => {
      const v = attrs[k] || 0;
      return `<div class="attr-box"><div class="attr-v ${statColor(v)}">${v}</div><div class="attr-l">${l}</div></div>`;
    }).join('');
  }

  // ── Season stats bar ───────────────────────
  function seasonStatPills(st, club) {
    const items = [
      {icon:'⚽',label:'Goals',   val:st.goals},
      {icon:'🎯',label:'Assists', val:st.assists},
      {icon:'👕',label:'Apps',    val:st.appearances},
      {icon:'🌟',label:'MOTM',    val:st.motm},
      {icon:'⭐',label:'Avg Rat', val:st.avgRating || '—'},
      {icon:'🟨',label:'Yellows', val:st.yellowCards},
    ];
    return items.map(({icon,label,val}) =>
      `<div class="stat-pill"><span class="sp-icon">${icon}</span><span class="sp-val">${val}</span><span class="sp-label">${label}</span></div>`
    ).join('');
  }

  // ── Week event card ────────────────────────
  function weekEventHTML(event) {
    let extra = '';
    if (event.type === 'match') {
      const rc = event.resultColor || '#ccc';
      extra = `<span class="result-badge" style="background:${rc}20;color:${rc};border-color:${rc}40;">${event.result} ${event.resultStr}</span>`;
      if (event.goals > 0 || event.assists > 0) {
        extra += `<span class="mini-tag">⚽×${event.goals}</span><span class="mini-tag">🎯×${event.assists}</span>`;
      }
      if (event.isMotm) extra += `<span class="mini-tag motm">🌟 MOTM</span>`;
      if (event.gotRed) extra += `<span class="mini-tag red">🟥 RED</span>`;
      extra += `<span class="mini-tag rat" style="color:${ratingColor(event.rating)};">${event.rating}</span>`;
    }
    if (event.type === 'growth') {
      extra = `<span class="mini-tag growth">+${event.statDelta} ${event.title.split(' ')[0]}</span>`;
    }
    if (event.type === 'milestone') {
      extra = `<span class="mini-tag motm">🏆 Milestone</span>`;
    }

    return `
      <div class="week-event ${event.type}">
        <span class="we-icon">${event.icon || '📋'}</span>
        <div class="we-body">
          <div class="we-title">${event.title}</div>
          <div class="we-detail">${event.detail || ''}</div>
        </div>
        <div class="we-tags">${extra}</div>
      </div>`;
  }

  // ── Career log entry ───────────────────────
  function careerLogEntry(entry) {
    return `
      <li class="timeline-event">
        <div class="te-icon">${entry.icon}</div>
        <div class="te-content">
          <div class="te-title">${entry.title}</div>
          <div class="te-meta">${entry.detail}${entry.week ? ` · ${entry.week}` : ''}</div>
        </div>
      </li>`;
  }

  // ── Form indicator ─────────────────────────
  function formHTML(form) {
    if (!form || form.length === 0) return '<span style="color:var(--text-muted);font-size:12px;">No matches yet</span>';
    return form.map(formDot).join('');
  }

  // ── Progress bar (season) ──────────────────
  function seasonProgressBar(week, total) {
    const pct = Math.round((week / total) * 100);
    const monthIdx = Math.floor(week / 4);
    const month    = SEASON_MONTHS[monthIdx] || 'End';
    return `
      <div class="season-prog">
        <div class="prog-labels">
          <span>Season Progress</span>
          <span>${Engine.getWeekLabel(Math.min(week, total-1))} · ${pct}%</span>
        </div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>`;
  }

  return {
    playerCard, statBarsHTML, attrGridHTML,
    seasonStatPills, weekEventHTML, careerLogEntry,
    formHTML, seasonProgressBar, ratingColor, statColor,
  };

})();
