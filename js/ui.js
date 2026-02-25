// ════════════════════════════════════════════════════════════
//  ProPath v3 — ui.js
//  All rendering, modal display, and UI helpers
// ════════════════════════════════════════════════════════════

const UI = {

  // ── Helpers ────────────────────────────────────────────────
  ratingColor(v){if(v>=80)return'#00e5a0';if(v>=70)return'#f5c842';if(v>=60)return'#ff6b35';return'#ff4757';},
  statColor(v){return v>=75?'good':v>=60?'mid':'low';},
  fmtMoney(n){
    if(n>=1000000)return`£${(n/1000000).toFixed(2)}m`;
    if(n>=1000)return`£${(n/1000).toFixed(n>=100000?1:1)}k`;
    return`£${n}`;
  },
  formDot(r){const c=r>=72?'#00e5a0':r>=62?'#f5c842':'#ff4757';return`<div class="form-dot" style="background:${c}" title="Rating ${r}"></div>`;},

  // ── Player Card ─────────────────────────────────────────────
  renderPlayerCard(){
    const p=G.player,cl=G.club;
    const nat=NATIONS.find(n=>n.name===p.nation)||{flag:'🌍'};
    const trait=TRAITS[p.trait]||{};
    const tierNames=['—','Premier League','Championship','League One','League Two','Youth'];
    document.getElementById('dashPlayerCard').innerHTML=`
      <div class="player-card-preview">
        <div class="card-avatar">${nat.flag}</div>
        <div class="card-info">
          <div class="card-name">${p.firstName.toUpperCase()} ${p.nickname?'"'+p.nickname+'"':''} ${p.lastName.toUpperCase()}</div>
          <div class="card-meta">
            <span class="meta-pill pos">${p.position}</span>
            <span class="meta-pill age">Age ${p.age}</span>
            <span class="meta-pill nat">${nat.flag} ${p.nation}</span>
            <span class="meta-pill" style="color:var(--accent2);border-color:rgba(255,107,53,.3);">${trait.icon||''} ${trait.name||''}</span>
            ${!cl.isFreeAgent
              ?`<span class="meta-pill" style="color:var(--blue);border-color:rgba(74,158,255,.3);">🏟️ ${cl.name}</span>`
              :'<span class="meta-pill chip-red">🔓 Free Agent</span>'}
            ${G.agentUpgraded?'<span class="meta-pill chip-purple">🤵 Elite Agent</span>':''}
          </div>
        </div>
        <div class="card-rating-box">
          <div class="rating-num">${p.overall}</div>
          <div class="rating-label">OVR</div>
        </div>
      </div>`;
  },

  // ── Attrs ─────────────────────────────────────────────────
  renderAttrs(){
    const a=G.player.attrs;
    const labels=['PAC','SHO','PAS','DRI','DEF','PHY'];
    const keys=['pace','shooting','passing','dribbling','defending','physical'];
    document.getElementById('dashAttrs').innerHTML=keys.map((k,i)=>
      `<div class="attr-box"><div class="attr-v ${UI.statColor(a[k])}">${a[k]}</div><div class="attr-l">${labels[i]}</div></div>`
    ).join('');
    document.getElementById('formDots').innerHTML=G.form.length
      ?G.form.map(r=>UI.formDot(r)).join('')
      :'<span style="color:var(--text-muted);font-size:11px;">No matches yet</span>';
    const pot=document.getElementById('potDisplay');
    if(pot)pot.textContent=`${G.player.potential} OVR`;
  },

  // ── Progress bar ──────────────────────────────────────────
  renderProgress(){
    const s=G.season;
    const pct=Math.round((s.dayOfSeason/s.totalDays)*100);
    document.getElementById('seasonProgress').innerHTML=`
      <div class="season-prog">
        <div class="prog-labels"><span>Season ${s.number} · ${E.getDayLabel(s.dayOfSeason)}</span><span>${pct}%</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>`;
  },

  // ── Stat pills ────────────────────────────────────────────
  renderStatPills(){
    const st=G.seasonStats;
    const items=[
      {icon:'⚽',label:'Goals',val:st.goals},{icon:'🎯',label:'Assists',val:st.assists},
      {icon:'👕',label:'Apps',val:st.apps},{icon:'🌟',label:'MOTM',val:st.motm},
      {icon:'⭐',label:'Avg Rat',val:st.avgRating||'—'},{icon:'🟨',label:'Cards',val:st.yellows},
    ];
    document.getElementById('seasonStatPills').innerHTML=items.map(({icon,label,val})=>
      `<div class="stat-pill"><span class="sp-icon">${icon}</span><span class="sp-val">${val}</span><span class="sp-label">${label}</span></div>`
    ).join('');
  },

  // ── Career log ────────────────────────────────────────────
  renderCareerLog(){
    document.getElementById('careerLog').innerHTML=[...G.careerLog].reverse().slice(0,20).map(e=>
      `<li class="timeline-event"><div class="te-icon">${e.icon}</div><div class="te-content"><div class="te-title">${e.title}</div><div class="te-meta">${e.detail}${e.date?` · ${e.date}`:''}</div></div></li>`
    ).join('');
  },

  // ── Recent log ────────────────────────────────────────────
  renderRecentLog(){
    const el=document.getElementById('recentLog');
    const recent=[...G.dayLog].reverse().slice(0,60);
    if(!recent.length){el.innerHTML='<div style="font-size:12px;color:var(--text-muted);padding:8px;">Click Next Day to begin.</div>';return;}
    el.innerHTML=recent.map(entry=>{
      const ev=entry.events[0];
      const matchEv=entry.events.find(e=>e.type==='match'&&e.result);
      let badge='';
      if(matchEv){const c=matchEv.result==='W'?'var(--accent)':matchEv.result==='D'?'var(--gold)':'var(--red)';badge=`<span style="font-weight:700;color:${c};margin-left:auto;">${matchEv.result} ${matchEv.hg}-${matchEv.ag}</span>`;}
      return`<div class="log-row"><span class="lr-date">${entry.date}</span><span class="lr-desc">${ev?.title||'Training day'}</span>${badge}</div>`;
    }).join('');
  },

  // ── League table ──────────────────────────────────────────
  renderLeagueTable(){
    const sorted=getSortedTable();
    const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    document.getElementById('leagueName').textContent=G.league.name;
    const qual=[];
    if(league.promoted>0)qual.push(`Top ${league.promoted}: Promoted`);
    if(G.club.tier===1)qual.push('Top 4: Europa Elite');
    if(league.relegated)qual.push(`Bottom ${league.relegated}: Relegated`);
    document.getElementById('leagueQualInfo').textContent=qual.join(' · ');

    const el=document.getElementById('leagueTable');
    el.querySelector('thead').innerHTML=`<tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Form</th></tr>`;
    el.querySelector('tbody').innerHTML=sorted.map((t,i)=>{
      const pos=i+1;
      const pc=pos<=league.promoted?'top':pos>sorted.length-(league.relegated||0)?'rel':'mid';
      const fd=UI.formDots(t.form);
      return`<tr class="${t.isPlayer?'my-team':''}">
        <td class="pos-col ${pc}">${pos}</td>
        <td class="team-col" style="min-width:130px;font-size:12px;">${t.name}${t.isPlayer?' ⭐':''}</td>
        <td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td>
        <td>${t.gf}</td><td>${t.ga}</td><td>${t.gd>0?'+':''}${t.gd}</td>
        <td style="font-weight:700;color:var(--text);">${t.pts}</td>
        <td><div class="form-dots">${fd}</div></td>
      </tr>`;
    }).join('');
  },

  formDots(arr){
    return(arr||[]).slice(-5).map(r=>{
      const c=r==='W'?'#00e5a0':r==='D'?'#f5c842':'#ff4757';
      return`<div class="form-dot" style="background:${c}" title="${r}"></div>`;
    }).join('');
  },

  // ── Cups tab ──────────────────────────────────────────────
  renderCupsTab(){
    const el=document.getElementById('cupsList');
    const avail=CUPS.filter(c=>G.cups&&G.cups[c.id]);
    if(!avail.length){el.innerHTML='<div class="empty-state">⚽<br><br>No cup competitions this season.<br><span style="color:var(--text-muted);font-size:11px;">Qualify for cups by playing in higher divisions.</span></div>';return;}
    el.innerHTML=avail.map(cd=>{
      const c=G.cups[cd.id];
      let status='In progress',color='var(--text-dim)';
      if(c.winner){status='🏆 Winner!';color='var(--gold)';}
      else if(c.eliminated){status=`Eliminated at ${cd.rounds[Math.max(0,c.stage-1)]}`;color='var(--red)';}
      else{status=`Next: ${cd.rounds[c.stage]||'Final'}`;color='var(--accent)';}
      return`<div class="comp-row">
        <div class="comp-badge" style="background:rgba(245,200,66,.1);">${cd.icon}</div>
        <div class="comp-info"><div class="comp-name">${cd.name}</div><div class="comp-status">${cd.desc}</div></div>
        <div class="comp-result" style="color:${color}">${status}</div>
      </div>`;
    }).join('');
  },

  // ── Training tab ──────────────────────────────────────────
  renderTrainingTab(){
    const keys=['pace','shooting','passing','dribbling','defending','physical'];
    const labels={pace:'Pace',shooting:'Shooting',passing:'Passing',dribbling:'Dribbling',defending:'Defending',physical:'Physical'};
    const colors={pace:'#00e5a0',shooting:'#ff6b35',passing:'#4a9eff',dribbling:'#f5c842',defending:'#a78bfa',physical:'#fb7185'};
    document.getElementById('walletAmount').textContent=UI.fmtMoney(G.wallet);
    document.getElementById('weeklySalaryLabel').textContent=`Wages: £${G.weeklySalary.toLocaleString()}/wk${G.passiveIncome>0?` + £${G.passiveIncome.toLocaleString()} passive`:''}`;
    document.getElementById('trainingGrid').innerHTML=keys.map(k=>{
      const cur=G.player.attrs[k];
      const cost=E.trainCost(cur);
      const canAfford=G.wallet>=cost;
      const maxed=cur>=99;
      return`<div class="train-item">
        <div class="train-stat-name" style="color:${colors[k]}">${labels[k]}</div>
        <div class="train-current" style="color:${colors[k]}">${cur}</div>
        <div class="train-cost ${canAfford&&!maxed?'':'cant-afford'}">${maxed?'Maxed out':`+1 costs ${UI.fmtMoney(cost)}`}</div>
        <button class="btn ${canAfford&&!maxed?'btn-primary':'btn-ghost'}" style="width:100%;padding:9px;font-size:12px;" ${!canAfford||maxed?'disabled':''} onclick="App.buyTraining('${k}')">
          ${maxed?'Max':'Upgrade +1'}
        </button>
      </div>`;
    }).join('');
    this.renderInvestmentsGrid();
  },

  renderInvestmentsGrid(){
    const el=document.getElementById('investmentGrid');
    if(!el)return;
    el.innerHTML=INVESTMENTS.map(inv=>{
      const owned=G.investments.includes(inv.id);
      const canAfford=G.wallet>=inv.cost;
      return`<div class="invest-card ${owned?'owned':''}">
        <div class="invest-icon">${inv.icon}</div>
        <div class="invest-name">${inv.name}</div>
        <div class="invest-desc">${inv.desc}</div>
        <div class="invest-meta">
          <span class="invest-cost">💸 ${UI.fmtMoney(inv.cost)}</span>
          <span class="invest-return">📈 £${inv.weeklyReturn.toLocaleString()}/wk</span>
        </div>
        ${owned
          ?'<div class="btn btn-ghost" style="width:100%;text-align:center;cursor:default;">✅ Owned</div>'
          :`<button class="btn ${canAfford?'btn-gold':'btn-ghost'}" style="width:100%;font-size:12px;padding:9px;" ${canAfford?'':'disabled'} onclick="purchaseInvestment('${inv.id}')">
            ${canAfford?'Purchase':'Need more funds'}
          </button>`
        }
      </div>`;
    }).join('');
  },

  // ── Transfers tab ─────────────────────────────────────────
  renderTransfersTab(){
    const el=document.getElementById('transfersContent');
    if(!el)return;
    const offers=G.pendingTransferOffers||[];
    if(!offers.length){
      el.innerHTML=`<div class="empty-state">📭<br><br>No transfer offers at the moment.<br><span style="font-size:11px;color:var(--text-muted);">Score goals, get MOTM, or request a transfer listing to attract clubs.</span></div>`;
      return;
    }
    el.innerHTML=`<div class="transfer-inbox">${offers.map(o=>`
      <div class="transfer-offer pending">
        <div class="offer-header">
          <div class="offer-club">🏟️ ${o.fromClub}</div>
          <div style="font-size:10px;font-family:'DM Mono',monospace;color:var(--text-muted);">Expires: ${E.getDayLabel(o.expires)}</div>
        </div>
        <div class="offer-detail" style="margin-bottom:12px;">${o.league} · £${o.salary.toLocaleString()}/wk · ${o.contractYears}-year contract</div>
        <div class="offer-actions">
          <button class="btn btn-primary" style="font-size:12px;padding:9px 16px;" onclick="App.acceptTransfer('${o.id}')">✍️ Accept</button>
          <button class="btn btn-ghost" onclick="App.declineTransfer('${o.id}')">❌ Decline</button>
          ${!o.saved?`<button class="btn btn-secondary" style="font-size:12px;" onclick="App.saveOffer('${o.id}')">🔖 Think About It</button>`:''}
        </div>
      </div>`).join('')}</div>`;
    UI.updateTransferBadge();
  },

  updateTransferBadge(){
    const count=(G.pendingTransferOffers||[]).length;
    const tabBtn=document.querySelector('.tab-btn[data-tab="transfers"]');
    if(!tabBtn)return;
    const existing=tabBtn.querySelector('.tab-notif');
    if(count>0&&!existing){tabBtn.insertAdjacentHTML('beforeend','<span class="tab-notif"></span>');}
    else if(!count&&existing){existing.remove();}
  },

  // ── Manager tab ───────────────────────────────────────────
  renderManagerTab(){
    const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
    const moodColors={favourable:'var(--accent)',good:'var(--accent)',neutral:'var(--gold)',sceptical:'var(--accent2)',poor:'var(--red)'};
    const moodEmoji={favourable:'😄',good:'🙂',neutral:'😐',sceptical:'🤨',poor:'😠'};
    document.getElementById('managerContent').innerHTML=`
      <div class="manager-card">
        <div class="manager-avatar">🧑‍💼</div>
        <div class="manager-info">
          <div class="manager-name">${G.manager.name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Head Coach · ${LEAGUES.find(l=>l.tier===G.club.tier)?.name||'—'}</div>
          <div style="font-size:12px;color:${moodColors[op.opinion]}">${moodEmoji[op.opinion]} ${op.text}</div>
        </div>
      </div>
      <div class="manager-opts">
        <div class="manager-opt" onclick="requestNewContract()">
          <div class="mo-icon">✍️</div>
          <div class="mo-title">Request New Contract</div>
          <div class="mo-desc">Ask the manager to improve your deal. He might say no.</div>
        </div>
        <div class="manager-opt" onclick="requestTransferListing()">
          <div class="mo-icon">📋</div>
          <div class="mo-title">Request Transfer Listing</div>
          <div class="mo-desc">Tell the manager you want to leave. Expect multiple offers.</div>
        </div>
        <div class="manager-opt" onclick="UI.showContractStatus()">
          <div class="mo-icon">📄</div>
          <div class="mo-title">View Contract Status</div>
          <div class="mo-desc">${G.club.isFreeAgent?'No contract — you\'re a free agent':`${G.club.contractYears} year${G.club.contractYears!==1?'s':''} remaining on your deal`}</div>
        </div>
        <div class="manager-opt" onclick="UI.showSquadStatus()">
          <div class="mo-icon">👥</div>
          <div class="mo-title">Squad Standing</div>
          <div class="mo-desc">See where you rank in the manager's plans.</div>
        </div>
      </div>`;
  },

  showContractStatus(){
    showModal(`<div class="modal-title">📄 Your Contract</div>
    <div class="modal-stat-grid">
      <div class="modal-stat"><div class="ms-label">Club</div><div class="ms-val" style="font-size:16px;">${G.club.isFreeAgent?'Free Agent':G.club.name}</div></div>
      <div class="modal-stat"><div class="ms-label">Years Remaining</div><div class="ms-val">${G.club.isFreeAgent?'None':G.club.contractYears}</div></div>
      <div class="modal-stat"><div class="ms-label">Weekly Wage</div><div class="ms-val" style="color:var(--gold);">£${G.weeklySalary.toLocaleString()}</div></div>
      <div class="modal-stat"><div class="ms-label">Passive Income</div><div class="ms-val" style="color:var(--accent);">£${G.passiveIncome.toLocaleString()}/wk</div></div>
    </div>
    <button class="btn btn-ghost" onclick="closeModal()" style="width:100%;margin-top:12px;">Close</button>`);
  },

  showSquadStatus(){
    const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
    const pos=getLeaguePosition();
    showModal(`<div class="modal-title">👥 Squad Standing</div>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">${op.text}</p>
    <div class="modal-stat-grid">
      <div class="modal-stat"><div class="ms-label">Your OVR</div><div class="ms-val" style="color:var(--accent);">${G.player.overall}</div></div>
      <div class="modal-stat"><div class="ms-label">Team Avg OVR</div><div class="ms-val">${G.manager.teamAvgOVR}</div></div>
      <div class="modal-stat"><div class="ms-label">League Position</div><div class="ms-val">${pos}</div></div>
      <div class="modal-stat"><div class="ms-label">Forced Starts Left</div><div class="ms-val">${G.forcedStarter}</div></div>
    </div>
    <button class="btn btn-ghost" onclick="closeModal()" style="width:100%;margin-top:12px;">Close</button>`);
  },

  // ── Career tab ────────────────────────────────────────────
  renderCareerTab(){
    const cs=G.careerStats;
    document.getElementById('careerStatsGrid').innerHTML=[
      {l:'Goals',v:cs.goals,c:'var(--accent)'},{l:'Assists',v:cs.assists,c:'var(--blue)'},
      {l:'Appearances',v:cs.apps,c:'var(--text)'},{l:'MOTM Awards',v:cs.motm,c:'var(--gold)'},
      {l:'Seasons',v:cs.seasons,c:'var(--text)'},{l:'Trophies',v:cs.trophies,c:'var(--gold)'},
      {l:'Best OVR',v:cs.bestOVR,c:'var(--accent2)'},{l:'Red Cards',v:cs.reds,c:'var(--red)'},
      {l:'Total Investments',v:G.investments.length,c:'var(--accent)'},{l:'Passive Income',v:`£${G.passiveIncome.toLocaleString()}/wk`,c:'var(--gold)'},
    ].map(({l,v,c})=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:12px;color:var(--text-dim);">${l}</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${c};">${v}</span>
    </div>`).join('');

    const ach=[...G.achievements];
    document.getElementById('achievementsList').innerHTML=ach.length
      ?`<div style="display:flex;flex-wrap:wrap;gap:8px;">${ach.map(a=>`<span class="chip chip-gold">🏅 ${a}</span>`).join('')}</div>`
      :`<div class="empty-state">No achievements yet — keep playing!</div>`;

    // Career match history
    const mh=document.getElementById('careerMatchHistory');
    if(mh){
      mh.innerHTML=[...G.matchHistory].reverse().slice(0,25).map(m=>{
        const rc=m.result==='W'?'var(--accent)':m.result==='D'?'var(--gold)':'var(--red)';
        return`<div class="log-row">
          <span class="lr-date">${m.date}</span>
          <span class="lr-desc" style="flex:1;">${m.home} ${m.hg}–${m.ag} ${m.away}${m.isCup?' 🏆':''}</span>
          <span style="font-weight:700;color:${rc};margin:0 8px;">${m.result}</span>
          ${m.goals?`<span class="chip chip-green">⚽${m.goals}</span>`:''}
          ${m.motm?'<span class="chip chip-gold">⭐</span>':''}
          <span style="font-size:11px;font-weight:700;color:${UI.ratingColor(m.rating||0)};margin-left:6px;">${m.rating||'—'}</span>
        </div>`;
      }).join('')||'<div class="empty-state">No matches yet</div>';
    }
  },

  // ── Season end modal ──────────────────────────────────────
  showSeasonEndModal(){
    const st=G.seasonStats,p=G.player;
    const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    const pos=getLeaguePosition();
    const promoted=league.promoted&&pos<=league.promoted;
    const relegated=league.relegated&&pos>G.league.teams.length-league.relegated;
    const champion=pos===1;
    // isBlocking=true: clicking outside does nothing — no more softlock
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">${champion?'🏆':promoted?'🚀':relegated?'📉':'🏁'}</span>
        <div class="event-modal-title">Season ${G.season.number} Complete</div>
        <div class="event-modal-subtitle">
          ${G.club.name} finished <strong>${pos}${pos===1?'st':pos===2?'nd':pos===3?'rd':'th'}</strong> in the ${G.league.name}
          ${champion?' — <strong style="color:var(--gold)">League Champions!</strong>':''}
          ${promoted&&!champion?' — <strong style="color:var(--accent)">Promoted!</strong>':''}
          ${relegated?' — <strong style="color:var(--red)">Relegated</strong>':''}
        </div>
      </div>
      <div class="modal-stat-grid">
        <div class="modal-stat"><div class="ms-label">Goals</div><div class="ms-val" style="color:var(--accent)">${st.goals}</div></div>
        <div class="modal-stat"><div class="ms-label">Assists</div><div class="ms-val" style="color:var(--blue)">${st.assists}</div></div>
        <div class="modal-stat"><div class="ms-label">Appearances</div><div class="ms-val">${st.apps}</div></div>
        <div class="modal-stat"><div class="ms-label">Avg Rating</div><div class="ms-val" style="color:var(--gold)">${st.avgRating||'—'}</div></div>
        <div class="modal-stat"><div class="ms-label">MOTM Awards</div><div class="ms-val" style="color:var(--gold)">${st.motm}</div></div>
        <div class="modal-stat"><div class="ms-label">New OVR</div><div class="ms-val" style="color:var(--accent2)">${p.overall}</div></div>
        <div class="modal-stat"><div class="ms-label">W/D/L</div><div class="ms-val">${st.wins}/${st.draws}/${st.losses}</div></div>
        <div class="modal-stat"><div class="ms-label">Age</div><div class="ms-val">${p.age}</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
        <button class="btn btn-primary" style="flex:1;" onclick="startNewSeason()">➡ Next Season</button>
        <button class="btn btn-ghost" onclick="App.confirmRetirement();" style="flex:1;">🏆 Retire</button>
      </div>`,true);
  },

  // ── Age cap modal ─────────────────────────────────────────────
  showAgeCapModal(){
    const p=G.player;
    const idx=getExtensionIndex();
    const maxExtensions=EXTENSION_COSTS.length;
    const canExtend=idx<maxExtensions;
    const extCost=canExtend?EXTENSION_COSTS[idx]:0;
    const extLabel=canExtend?EXTENSION_LABELS[idx]:'—';
    const canAfford=G.wallet>=extCost;
    const st=G.seasonStats;
    const pos=getLeaguePosition();
    const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    const promoted=league.promoted&&pos<=league.promoted;
    const relegated=league.relegated&&pos>G.league.teams.length-league.relegated;
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">⏳</span>
        <div class="event-modal-title">Father Time is Calling</div>
        <div class="event-modal-subtitle">You've turned <strong>${p.age}</strong> years old. Football doesn't wait forever.</div>
      </div>
      <div class="modal-stat-grid">
        <div class="modal-stat"><div class="ms-label">Season Goals</div><div class="ms-val" style="color:var(--accent)">${st.goals}</div></div>
        <div class="modal-stat"><div class="ms-label">Appearances</div><div class="ms-val">${st.apps}</div></div>
        <div class="modal-stat"><div class="ms-label">Career Apps</div><div class="ms-val">${G.careerStats.apps}</div></div>
        <div class="modal-stat"><div class="ms-label">OVR</div><div class="ms-val" style="color:var(--accent2)">${p.overall}</div></div>
        <div class="modal-stat"><div class="ms-label">League Finish</div><div class="ms-val">${pos}${pos===1?'st':pos===2?'nd':pos===3?'rd':'th'}${promoted?' 🚀':relegated?' 📉':''}</div></div>
        <div class="modal-stat"><div class="ms-label">Balance</div><div class="ms-val" style="color:var(--gold);">${UI.fmtMoney(G.wallet)}</div></div>
      </div>
      <div style="background:rgba(255,71,87,.07);border:1px solid rgba(255,71,87,.25);border-radius:10px;padding:14px;margin:14px 0;font-size:12px;color:var(--text-dim);line-height:1.7;">
        ${canExtend
          ?`Pay <strong style="color:var(--gold)">£${extCost.toLocaleString()}</strong> to extend your career by one more season <em>(${extLabel})</em>. This is extension <strong>${idx+1}</strong> of ${maxExtensions} — each one costs significantly more.`
          :`You've used all ${maxExtensions} career extensions. This is your final chapter — go out on your own terms.`}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${canExtend&&canAfford
          ?`<button class="btn btn-gold" style="width:100%;padding:13px;font-size:14px;" onclick="extendCareer()">⏳ Pay £${extCost.toLocaleString()} — Play On (${extLabel})</button>`
          :''}
        ${canExtend&&!canAfford
          ?`<div class="btn btn-ghost" style="width:100%;text-align:center;opacity:.5;cursor:not-allowed;">⏳ Extend career (£${extCost.toLocaleString()}) — Insufficient funds</div>`
          :''}
        <button class="btn btn-primary" style="width:100%;padding:13px;font-size:14px;" onclick="App.confirmRetirement()">🏆 Retire to Hall of Fame</button>
      </div>`,true);
  },

  // ── Free agent offers ─────────────────────────────────────
  showFreeAgentOffers(){
    const offers=generateFreeAgentOffers();
    G._faOffers=offers;
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">🔓</span>
        <div class="event-modal-title">Free Agent</div>
        <div class="event-modal-subtitle">You're without a club. Sign anywhere — no transfer window needed.</div>
      </div>
      <div class="club-offers">${offers.map(o=>`
        <div class="club-offer">
          <div class="offer-info"><div class="offer-club" style="font-weight:700;">🏟️ ${o.fromClub}</div>
          <div class="offer-detail">${o.league} · £${o.salary.toLocaleString()}/wk · ${o.contractYears}yr</div></div>
          <button class="btn btn-primary" style="padding:9px 14px;font-size:12px;" onclick="signFreeAgent('${o.id}')">Sign</button>
        </div>`).join('')}
      </div>`);
  },

  // ── Blocking event modal ──────────────────────────────────
  showBlockingEvent(ev){
    if(!ev)return;
    const bodyText=ev.body?.replace('{{position}}',G.player.position)||'';
    const rarityBadge={rare:'🔶 Rare Event',very_rare:'💎 Very Rare Event',uncommon:'⬦ Uncommon Event',common:''}[ev.rarity]||'';
    const choicesHTML=ev.choices.map(c=>{
      const isDanger=c.label.includes('👊')||c.label.includes('😡');
      const isGold=c.label.includes('💰')||c.label.includes('✍️')||c.label.includes('✈️')||c.label.includes('🎥')||c.label.includes('🤝');
      const cls=isDanger?'danger':isGold?'gold':'';
      return`<button class="event-choice ${cls}" onclick="App.resolveBlockingEvent('${c.fn}')">
        <div class="ec-label" style="color:var(--text);font-size:13px;font-weight:600;margin-bottom:4px;">${c.label}</div>
        <div class="ec-outcome" style="color:var(--text-dim);font-size:11px;">${c.outcome}</div>
      </button>`;
    }).join('');
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">${ev.icon}</span>
        ${rarityBadge?`<div style="font-size:9px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--accent2);margin-bottom:6px;">${rarityBadge}</div>`:''}
        <div class="event-modal-title">${ev.title}</div>
        <div class="event-modal-subtitle">${ev.subtitle}</div>
      </div>
      <p style="color:var(--text-dim);font-size:13px;line-height:1.75;margin-bottom:16px;">${bodyText}</p>
      <div class="event-choices">${choicesHTML}</div>`,true);
  },

  // ── Bet modal ─────────────────────────────────────────────
  showBetModal(){
    const opp=G.league.teams.find(t=>!t.isPlayer)||{name:'Opponents'};
    const myTeamStrength=G.manager.teamAvgOVR;
    let selected='win';
    let betAmount=500;
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">🎰</span>
        <div class="event-modal-title">Place Your Bet</div>
        <div class="event-modal-subtitle">${G.club.name} vs ${opp.name}</div>
      </div>
      <div class="bet-options">
        <div class="bet-opt selected" id="bopt-win" onclick="UI.selectBet('win')"><div class="bet-label">${G.club.name} Win</div><div class="bet-odds">Odds: 2.1×</div></div>
        <div class="bet-opt" id="bopt-draw" onclick="UI.selectBet('draw')"><div class="bet-label">Draw</div><div class="bet-odds">Odds: 3.4×</div></div>
        <div class="bet-opt" id="bopt-lose" onclick="UI.selectBet('lose')"><div class="bet-label">${opp.name} Win</div><div class="bet-odds">Odds: 4.0×</div></div>
      </div>
      <div class="field-label" style="margin-top:14px;">Bet Amount</div>
      <div class="bet-input-row">
        <input type="number" id="betAmountInput" value="${betAmount}" min="100" max="${G.wallet}" style="flex:1;" oninput="UI._betAmt=parseInt(this.value)||0">
      </div>
      <div class="bet-quick" style="margin-top:6px;">
        ${[500,1000,5000,10000].map(a=>`<div class="bet-q-btn" onclick="UI.quickBet(${a})">£${a.toLocaleString()}</div>`).join('')}
        <div class="bet-q-btn" onclick="UI.quickBet(${G.wallet})">All In</div>
      </div>
      <p style="font-size:11px;color:var(--red);margin-top:10px;">⚠️ Gambling can result in serious financial loss. This is in-game only.</p>
      <button class="btn btn-danger" style="width:100%;margin-top:12px;" onclick="UI.confirmBet()">🎲 Place Bet</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:6px;" onclick="closeModal()">Walk away</button>`,false);
    UI._betSel='win';UI._betAmt=betAmount;
  },

  selectBet(outcome){
    UI._betSel=outcome;
    ['win','draw','lose'].forEach(o=>{document.getElementById(`bopt-${o}`)?.classList.toggle('selected',o===outcome);});
  },

  quickBet(amount){
    UI._betAmt=Math.min(amount,G.wallet);
    const inp=document.getElementById('betAmountInput');
    if(inp)inp.value=UI._betAmt;
  },

  confirmBet(){
    resolveBet(UI._betSel||'win',UI._betAmt||0);
  },

  // ── HOF ───────────────────────────────────────────────────
  renderHOF(){
    const hof=getHOF();
    const el=document.getElementById('hofContent');
    if(!hof.length){
      el.innerHTML=`<div class="hof-empty"><div style="font-size:56px;margin-bottom:16px;">🏆</div><div style="font-size:20px;font-weight:700;margin-bottom:8px;">No Legends Yet</div><div style="color:var(--text-dim);font-size:13px;">Complete a career and retire to enshrine your first legend.</div></div>`;
      return;
    }
    el.innerHTML=`<div class="hof-grid">${[...hof].reverse().map(p=>`
      <div class="hof-card">
        <div class="hof-name">${p.name}</div>
        <div class="hof-meta">${NATIONS.find(n=>n.name===p.nation)?.flag||''} ${p.nation} · ${p.position} · ${p.seasons} season${p.seasons!==1?'s':''} · Class of ${p.date}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px;">Peak: ${p.bestOVR} OVR · Highest: ${p.highestLeague} · ${p.investments} investments</div>
        <div class="hof-stats">
          <div class="hof-stat"><div class="hof-stat-v" style="color:var(--accent)">${p.goals}</div><div class="hof-stat-l">Goals</div></div>
          <div class="hof-stat"><div class="hof-stat-v" style="color:var(--blue)">${p.assists}</div><div class="hof-stat-l">Assists</div></div>
          <div class="hof-stat"><div class="hof-stat-v">${p.apps}</div><div class="hof-stat-l">Apps</div></div>
          <div class="hof-stat"><div class="hof-stat-v" style="color:var(--gold)">${p.trophies}</div><div class="hof-stat-l">Trophies</div></div>
        </div>
      </div>`).join('')}</div>`;
  },

  // ── Day event renderer ────────────────────────────────────
  renderDayEvent(ev){
    let tags='';
    if(ev.type==='match'){
      if(ev.result){const c=ev.result==='W'?'#00e5a0':ev.result==='D'?'#f5c842':'#ff4757';tags+=`<span class="tag tag-result" style="color:${c};border-color:${c}40;">${ev.result} ${ev.hg||0}–${ev.ag||0}</span>`;}
      if(ev.myGoals>0)tags+=`<span class="tag tag-goal">⚽${ev.myGoals}</span>`;
      if(ev.myAssists>0)tags+=`<span class="tag tag-goal">🎯${ev.myAssists}</span>`;
      if(ev.motm)tags+=`<span class="tag tag-motm">🌟 MOTM</span>`;
      if(ev.red)tags+=`<span class="tag tag-red">🟥</span>`;
      if(ev.myRating)tags+=`<span class="tag tag-rat" style="color:${UI.ratingColor(ev.myRating)};">${ev.myRating}</span>`;
    }
    if(ev.type==='growth')tags+=`<span class="tag tag-goal">${ev.title}</span>`;
    if(ev.type==='milestone')tags+=`<span class="tag tag-motm">🏆 Milestone</span>`;
    if(ev.type==='salary'&&G.passiveIncome>0)tags+=`<span class="tag" style="color:var(--gold);border-color:rgba(245,200,66,.3);background:rgba(245,200,66,.1);">+Passive</span>`;
    return`<div class="day-ev type-${ev.type}"><span class="dv-icon">${ev.icon||'📋'}</span><div class="dv-body"><div class="dv-title">${ev.title}</div><div class="dv-detail">${ev.detail||''}</div><div class="dv-tags">${tags}</div></div></div>`;
  },
};
