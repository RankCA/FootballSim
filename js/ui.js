// ════════════════════════════════════════════════════════════
//  ProPath v4 — ui.js
// ════════════════════════════════════════════════════════════

// ── Cup bracket match card ─────────────────────────────────────────────────────
// Renders a single match card for the bracket view.
// home/away = team names, homeScore/awayScore = null if not yet played,
// winner = winning team name or null, myClub = player's club name,
// isMyMatch = true if player's club is involved, upcoming = true if this is next match to be played.
function _bracketMatchCard(home, away, homeScore, awayScore, winner, myClub, isMyMatch, upcoming){
  const played = homeScore !== null;
  const isHomeMy = home === myClub;
  const isAwayMy = away === myClub;
  const homeWon = played && homeScore > awayScore;
  const awayWon = played && awayScore > homeScore;
  const homeBg = isHomeMy
    ? 'rgba(0,229,160,.12)'
    : homeWon ? 'rgba(245,200,66,.06)' : 'var(--surface2)';
  const awayBg = isAwayMy
    ? 'rgba(0,229,160,.12)'
    : awayWon ? 'rgba(245,200,66,.06)' : 'var(--surface2)';
  const homeTxtColor = isHomeMy ? 'var(--accent)' : homeWon ? 'var(--gold)' : 'var(--text)';
  const awayTxtColor = isAwayMy ? 'var(--accent)' : awayWon ? 'var(--gold)' : 'var(--text)';
  const border = upcoming ? '1px solid rgba(0,229,160,.4)' : isMyMatch ? '1px solid rgba(0,229,160,.2)' : '1px solid var(--border)';
  const homeLoser = played && !homeWon;
  const awayLoser = played && !awayWon;
  const scoreHTML = played
    ? `<div style="display:flex;gap:3px;font-size:11px;font-weight:700;font-family:'DM Mono',monospace;">
        <span style="color:${homeWon?'var(--gold)':'var(--text-muted)'};">${homeScore}</span>
        <span style="color:var(--text-muted);">–</span>
        <span style="color:${awayWon?'var(--gold)':'var(--text-muted)'};">${awayScore}</span>
       </div>`
    : `<div style="font-size:9px;color:var(--text-muted);font-family:'DM Mono',monospace;">${upcoming?'NEXT':'TBD'}</div>`;
  const teamRow=(name,bg,txtColor,loser,isMe)=>{
    const badge=typeof clubBadgeImg==='function'?clubBadgeImg(name,'14px','margin-right:3px;flex-shrink:0;'):'';
    return`<div style="
    display:flex;align-items:center;justify-content:space-between;
    background:${bg};padding:5px 8px;
    opacity:${loser?0.45:1};
  ">
    <span style="font-size:11px;font-weight:${isMe?700:400};color:${txtColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:95px;display:flex;align-items:center;">${badge}${isMe?'⭐ ':''}<span title="${name}">${name.length>14?name.slice(0,13)+'…':name}</span></span>
  </div>`;
  };
  return `<div style="border:${border};border-radius:7px;overflow:hidden;margin-bottom:2px;background:var(--surface);">
    ${teamRow(home,homeBg,homeTxtColor,homeLoser,isHomeMy)}
    <div style="display:flex;align-items:center;justify-content:space-between;padding:3px 8px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      ${scoreHTML}
    </div>
    ${teamRow(away,awayBg,awayTxtColor,awayLoser,isAwayMy)}
  </div>`;
}

const UI = {

  ratingColor(v){if(v>=80)return'#00e5a0';if(v>=70)return'#f5c842';if(v>=60)return'#ff6b35';return'#ff4757';},
  statColor(v){return v>=75?'good':v>=60?'mid':'low';},
  fmtMoney(n){
    if(n>=1000000)return`£${(n/1000000).toFixed(2)}m`;
    if(n>=1000)return`£${(n/1000).toFixed(1)}k`;
    return`£${n}`;
  },
  formDot(r){const c=r>=72?'#00e5a0':r>=62?'#f5c842':'#ff4757';return`<div class="form-dot" style="background:${c}" title="Rating ${r}"></div>`;},

  renderPlayerCard(){
    const p=G.player,cl=G.club;
    const nat=NATIONS.find(n=>n.name===p.nation)||{flag:'🌍'};
    const trait=TRAITS[p.trait]||{};
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
            ${!cl.isFreeAgent?`<span class="meta-pill" style="color:var(--blue);border-color:rgba(74,158,255,.3);display:inline-flex;align-items:center;gap:3px;">${typeof clubBadgeImg==='function'?clubBadgeImg(cl.name,'14px',''):''} ${cl.name}</span>`:'<span class="meta-pill chip-red">🔓 Free Agent</span>'}
            ${G.agentUpgraded?'<span class="meta-pill chip-purple">🤵 Elite Agent</span>':''}
          </div>
        </div>
        <div class="card-rating-box"><div class="rating-num">${p.overall}</div><div class="rating-label">OVR</div></div>
      </div>`;
  },

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
    const pot=document.getElementById('potDisplay');if(pot)pot.textContent=`${G.player.potential} OVR`;
  },

  renderProgress(){
    const s=G.season,pct=Math.round((s.dayOfSeason/s.totalDays)*100);
    document.getElementById('seasonProgress').innerHTML=`
      <div class="season-prog"><div class="prog-labels"><span>Season ${s.number} · ${E.getDayLabel(s.dayOfSeason)}</span><span>${pct}%</span></div>
      <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div></div>`;
  },

  renderStatPills(){
    const st=G.seasonStats;
    const items=[{icon:'⚽',label:'Goals',val:st.goals},{icon:'🎯',label:'Assists',val:st.assists},{icon:'👕',label:'Apps',val:st.apps},{icon:'🌟',label:'MOTM',val:st.motm},{icon:'⭐',label:'Avg Rat',val:st.avgRating||'—'},{icon:'🟨',label:'Cards',val:st.yellows}];
    document.getElementById('seasonStatPills').innerHTML=items.map(({icon,label,val})=>
      `<div class="stat-pill"><span class="sp-icon">${icon}</span><span class="sp-val">${val}</span><span class="sp-label">${label}</span></div>`
    ).join('');
  },

  renderCareerLog(){
    document.getElementById('careerLog').innerHTML=[...G.careerLog].reverse().slice(0,20).map(e=>
      `<li class="timeline-event"><div class="te-icon">${e.icon}</div><div class="te-content"><div class="te-title">${e.title}</div><div class="te-meta">${e.detail}${e.date?` · ${e.date}`:''}</div></div></li>`
    ).join('');
  },

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

  renderLeagueTable(){
    const sel=document.getElementById('leagueViewSelect');
    if(sel){
      // My league first
      let opts=`<option value="league">🏆 ${G.league.name} (My League)</option>`;
      // All other domestic league tiers from allLeagues
      // (skip if player is in a foreign league — they have their own league)
      if(G.allLeagues&&!G.club.isForeign){
        LEAGUES.forEach(l=>{
          if(l.tier===G.league.tier) return; // already shown as "My League"
          const tierIcons={1:'🔵',2:'🟢',3:'🟡',4:'🟠',5:'⚫'};
          opts+=`<option value="tier_${l.tier}">${tierIcons[l.tier]||'⚽'} ${l.name}</option>`;
        });
      }
      // Cups
      Object.entries(G.cups||{}).forEach(([id,cup])=>{
        const cd=CUPS.find(c=>c.id===id);if(!cd)return;
        opts+=`<option value="cup_${id}">${cd.icon} ${cd.name}</option>`;
      });
      if(sel.innerHTML!==opts)sel.innerHTML=opts;
      if(!sel.value||sel.value==='')sel.value='league';
    }
    const view=(sel?.value)||'league';
    UI.switchLeagueView(view);
  },

  switchLeagueView(view){
    const tableWrap=document.getElementById('leagueTableWrapper');
    const cupWrap=document.getElementById('cupBracketView');
    const qualEl=document.getElementById('leagueQualInfo');
    const nameEl=document.getElementById('leagueName');
    if(!tableWrap||!cupWrap)return;

    const renderTable=(teams, leagueData, isMyLeague)=>{
      tableWrap.style.display='';cupWrap.style.display='none';
      if(nameEl)nameEl.textContent=leagueData.name+(isMyLeague?' ⭐':'');
      const qual=[];
      if(leagueData.promoted>0)qual.push(`Top ${leagueData.promoted}: Promoted`);
      if(leagueData.tier===1)qual.push('Top 4: Champions League');
      if(leagueData.relegated)qual.push(`Bottom ${leagueData.relegated}: Relegated`);
      if(qualEl)qualEl.textContent=qual.join(' · ');
      const sorted=[...teams].sort((a,b)=>b.pts-a.pts||(b.gd-a.gd)||(b.gf-a.gf));
      const el=document.getElementById('leagueTable');
      el.querySelector('thead').innerHTML=`<tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Form</th></tr>`;
      el.querySelector('tbody').innerHTML=sorted.map((t,i)=>{
        const pos=i+1;
        const pc=pos<=leagueData.promoted?'top':pos>sorted.length-(leagueData.relegated||0)?'rel':'mid';
        const badgeHtml=typeof clubBadgeImg==='function'?clubBadgeImg(t.name,'18px','vertical-align:middle;margin-right:5px;flex-shrink:0;'):'';
        return`<tr class="${t.isPlayer?'my-team':''}">
          <td class="pos-col ${pc}">${pos}</td>
          <td class="team-col" style="min-width:130px;font-size:12px;"><span style="display:flex;align-items:center;">${badgeHtml}<span>${t.name}${t.isPlayer?' ⭐':''}</span></span></td>
          <td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td>
          <td>${t.gf}</td><td>${t.ga}</td><td>${t.gd>0?'+':''}${t.gd}</td>
          <td style="font-weight:700;color:var(--text);">${t.pts}</td>
          <td><div class="form-dots">${UI.formDots(t.form)}</div></td>
        </tr>`;
      }).join('');
    };

    if(view==='league'){
      // My own league
      const leagueData=LEAGUES.find(l=>l.tier===G.league.tier)||LEAGUES[0];
      renderTable(G.league.teams, leagueData, true);
      // Append cup mini-summaries below the table
      const cupSummary=document.getElementById('leagueCupSummary');
      if(cupSummary){
        const avail=CUPS.filter(c=>G.cups&&G.cups[c.id]);
        if(avail.length){
          cupSummary.style.display='';
          cupSummary.innerHTML=`<div class="section-label" style="margin:16px 0 8px;">Cup Competitions</div>`+avail.map(cd=>{
            const c=G.cups[cd.id];
            let status,color,nextDate='';
            if(c.winner){status='🏆 Winner!';color='var(--gold)';}
            else if(c.eliminated){status=`Eliminated — ${cd.rounds[Math.max(0,c.stage-1)]||'early'}`;color='var(--red)';}
            else{
              status=`Next: ${cd.rounds[c.stage]||'Final'}`;color='var(--accent)';
              const nd=(c.matchDays||[]).find(d=>d>G.season.dayOfSeason);
              if(nd)nextDate=` · ${E.getDayLabel(nd)}`;
            }
            const pct=(c.stage/(cd.rounds.length))*100;
            return`<div class="comp-row" style="cursor:pointer;" onclick="document.getElementById('leagueViewSelect').value='cup_${cd.id}';UI.switchLeagueView('cup_${cd.id}')">
              <div class="comp-badge" style="background:rgba(245,200,66,.1);">${cd.icon}</div>
              <div class="comp-info" style="flex:1;">
                <div class="comp-name">${cd.name}</div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                  <div style="flex:1;height:3px;background:var(--border);border-radius:2px;">
                    <div style="width:${c.eliminated||c.winner?100:pct}%;height:100%;background:${color};border-radius:2px;transition:width .5s;"></div>
                  </div>
                  <span style="font-size:10px;font-family:'DM Mono',monospace;color:var(--text-muted);">${c.stage}/${cd.rounds.length}</span>
                </div>
              </div>
              <div class="comp-result" style="color:${color};font-size:11px;">${status}${nextDate}</div>
            </div>`;
          }).join('');
        } else {
          cupSummary.style.display='none';
        }
      }
    } else if(view.startsWith('tier_')){
      // Another league tier from allLeagues
      const tier=parseInt(view.replace('tier_',''));
      const leagueData=LEAGUES.find(l=>l.tier===tier)||LEAGUES[0];
      const al=G.allLeagues?.[tier];
      if(!al){tableWrap.style.display='';cupWrap.style.display='none';
        if(nameEl)nameEl.textContent=leagueData.name;
        document.getElementById('leagueTable').querySelector('tbody').innerHTML=
          '<tr><td colspan="11" style="text-align:center;color:var(--text-muted);padding:20px;">No data yet — play some matches first.</td></tr>';
        return;
      }
      renderTable(al.teams, leagueData, false);
    } else {
      // ── Cup bracket view ─────────────────────────────────────
      tableWrap.style.display='none';cupWrap.style.display='';
      const cupId=view.replace('cup_','');
      const cup=G.cups?.[cupId];
      const cd=CUPS.find(c=>c.id===cupId);
      if(!cup||!cd){cupWrap.innerHTML='<div class="empty-state">Cup data unavailable.</div>';return;}
      if(nameEl)nameEl.textContent=cd.name;
      if(qualEl)qualEl.textContent=cd.euroQualify?'Top 4 finish required to qualify':'';

      const rounds=cd.rounds||[];
      const myClub=G.club.name;
      const bracketRounds=cup.bracketRounds||[];

      // Status banner
      let statusHTML;
      if(cup.winner){
        statusHTML=`<div style="background:rgba(245,200,66,.12);border:1px solid rgba(245,200,66,.35);border-radius:10px;padding:12px 16px;margin-bottom:14px;text-align:center;">
          <span style="font-size:24px;">🏆</span>
          <div style="font-weight:700;color:var(--gold);font-size:14px;margin-top:4px;">WINNER — ${cd.name}</div>
        </div>`;
      } else if(cup.eliminated){
        const exitRound=rounds[Math.max(0,cup.stage-1)]||'Early rounds';
        statusHTML=`<div style="background:rgba(255,71,87,.06);border:1px solid rgba(255,71,87,.2);border-radius:10px;padding:12px 16px;margin-bottom:14px;text-align:center;">
          <span style="font-size:20px;">💔</span>
          <div style="font-weight:700;color:var(--red);font-size:13px;margin-top:4px;">Eliminated — ${exitRound}</div>
        </div>`;
      } else {
        const nextDay=(cup.matchDays||[]).find(d=>d>G.season.dayOfSeason);
        statusHTML=`<div style="background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.2);border-radius:10px;padding:12px 16px;margin-bottom:14px;text-align:center;">
          <span style="font-size:20px;">▶</span>
          <div style="font-weight:700;color:var(--accent);font-size:13px;margin-top:4px;">Still In — Next: ${rounds[cup.stage]||'Final'}</div>
          ${nextDay?`<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${E.getDayLabel(nextDay)}</div>`:''}
        </div>`;
      }

      // ── Build bracket HTML ──────────────────────────────────────────────────
      // Only display rounds that have actually been generated (bracketRounds array length).
      // Unplayed future rounds are shown as placeholder columns with "?" cards.
      const numRounds=rounds.length;
      let bracketHTML='';
      if(bracketRounds.length>0){
        bracketHTML=`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:8px;">
        <div style="display:flex;gap:0;min-width:${numRounds*158}px;align-items:flex-start;">`;
        for(let r=0;r<numRounds;r++){
          const br=bracketRounds[r]; // may be undefined for future rounds
          const isCurrentRound=r===cup.stage&&!cup.eliminated&&!cup.winner;
          const isPastRound=r<cup.stage||(cup.eliminated&&r<=cup.stage)||(cup.winner);
          const isFuture=r>=bracketRounds.length&&!cup.eliminated&&!cup.winner;
          const colColor=isCurrentRound?'var(--accent)':isPastRound?'var(--text-dim)':'var(--text-muted)';
          let matchCards='';
          if(isFuture){
            // Future round — how many matches? Half of previous survivors
            const prevLen=bracketRounds[bracketRounds.length-1]?.matches?.filter(m=>m.away!=='BYE').length||1;
            const futureMatches=Math.max(1,Math.ceil(prevLen/2));
            for(let i=0;i<futureMatches;i++){
              matchCards+=`<div style="border:1px dashed var(--border);border-radius:7px;overflow:hidden;margin-bottom:2px;background:var(--surface);opacity:0.4;">
                <div style="padding:7px 8px;font-size:11px;color:var(--text-muted);">TBD</div>
                <div style="height:1px;background:var(--border);"></div>
                <div style="padding:7px 8px;font-size:11px;color:var(--text-muted);">TBD</div>
              </div>`;
            }
          } else if(br){
            const visibleMatches=br.matches.filter(m=>m.away!=='BYE');
            visibleMatches.forEach(m=>{
              const played=m.homeScore!==null;
              const isMyMatch=m.home===myClub||m.away===myClub;
              matchCards+=_bracketMatchCard(m.home,m.away,m.homeScore,m.awayScore,m.winner,myClub,isMyMatch,!played&&isCurrentRound&&isMyMatch);
            });
          }
          bracketHTML+=`<div style="flex:1;min-width:150px;display:flex;flex-direction:column;gap:0;">
            <div style="font-size:9px;font-family:'DM Mono',monospace;letter-spacing:1.2px;color:${colColor};text-align:center;padding:6px 4px 10px;border-bottom:1px solid var(--border);margin-bottom:8px;text-transform:uppercase;">${rounds[r]}</div>
            <div style="display:flex;flex-direction:column;gap:5px;padding:0 4px;">${matchCards||'<div style="font-size:10px;color:var(--text-muted);padding:8px;text-align:center;">—</div>'}</div>
          </div>${r<numRounds-1?`<div style="width:1px;background:var(--border);align-self:stretch;margin:26px 0 0;"></div>`:''}`;
        }
        bracketHTML+=`</div></div>`;
      } else {
        bracketHTML=`<div style="font-size:12px;color:var(--text-muted);padding:16px;text-align:center;">Draw not yet made.</div>`;
      }

      cupWrap.innerHTML=`
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px;">${cd.desc}</div>
        ${statusHTML}
        <div style="font-size:10px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--text-muted);margin-bottom:10px;">BRACKET</div>
        ${bracketHTML}`;
    }
  },

  formDots(arr){
    return(arr||[]).slice(-5).map(r=>{const c=r==='W'?'#00e5a0':r==='D'?'#f5c842':'#ff4757';return`<div class="form-dot" style="background:${c}" title="${r}"></div>`;}).join('');
  },

  renderCupsTab(){
    const el=document.getElementById('cupsList');
    const avail=CUPS.filter(c=>G.cups&&G.cups[c.id]);
    if(!avail.length){el.innerHTML='<div class="empty-state">⚽<br><br>No cup competitions this season.</div>';return;}
    el.innerHTML=avail.map(cd=>{
      const c=G.cups[cd.id];
      let status,color;
      if(c.winner){status='🏆 Winner!';color='var(--gold)';}
      else if(c.eliminated){status=`Eliminated at ${cd.rounds[Math.max(0,c.stage-1)]}`;color='var(--red)';}
      else{status=`Next: ${cd.rounds[c.stage]||'Final'}`;color='var(--accent)';}
      return`<div class="comp-row"><div class="comp-badge" style="background:rgba(245,200,66,.1);">${cd.icon}</div>
        <div class="comp-info"><div class="comp-name">${cd.name}</div><div class="comp-status">${cd.desc}</div></div>
        <div class="comp-result" style="color:${color}">${status}</div></div>`;
    }).join('');
  },

  renderTrainingTab(){
    const keys=['pace','shooting','passing','dribbling','defending','physical'];
    const labels={pace:'Pace',shooting:'Shooting',passing:'Passing',dribbling:'Dribbling',defending:'Defending',physical:'Physical'};
    const colors={pace:'#00e5a0',shooting:'#ff6b35',passing:'#4a9eff',dribbling:'#f5c842',defending:'#a78bfa',physical:'#fb7185'};
    document.getElementById('walletAmount').textContent=UI.fmtMoney(G.wallet);
    document.getElementById('weeklySalaryLabel').textContent=`Wages: £${G.weeklySalary.toLocaleString()}/wk${G.passiveIncome>0?` + £${G.passiveIncome.toLocaleString()} passive`:''}`;
    document.getElementById('trainingGrid').innerHTML=keys.map(k=>{
      const cur=G.player.attrs[k];const cost=E.trainCost(cur);const canAfford=G.wallet>=cost;const maxed=cur>=99;
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
    const el=document.getElementById('investmentGrid');if(!el)return;
    el.innerHTML=INVESTMENTS.map(inv=>{
      const owned=G.investments.includes(inv.id);const canAfford=G.wallet>=inv.cost;
      return`<div class="invest-card ${owned?'owned':''}">
        <div class="invest-icon">${inv.icon}</div><div class="invest-name">${inv.name}</div>
        <div class="invest-desc">${inv.desc}</div>
        <div class="invest-meta"><span class="invest-cost">💸 ${UI.fmtMoney(inv.cost)}</span><span class="invest-return">📈 £${inv.weeklyReturn.toLocaleString()}/wk</span></div>
        ${owned?'<div class="btn btn-ghost" style="width:100%;text-align:center;cursor:default;">✅ Owned</div>'
          :`<button class="btn ${canAfford?'btn-gold':'btn-ghost'}" style="width:100%;font-size:12px;padding:9px;" ${canAfford?'':'disabled'} onclick="purchaseInvestment('${inv.id}')">${canAfford?'Purchase':'Need more funds'}</button>`}
      </div>`;
    }).join('');
  },

  renderTransfersTab(){
    const el=document.getElementById('transfersContent');if(!el)return;
    const offers=G.pendingTransferOffers||[];
    const day=G.season.dayOfSeason;
    const win=isInTransferWindow(day);
    const winBanner=win
      ?`<div style="background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.25);border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;"><span style="font-size:18px;">🟢</span><div><div style="font-size:12px;font-weight:700;color:var(--accent);">${win==='summer'?'Summer':'January'} Transfer Window Open</div><div style="font-size:11px;color:var(--text-dim);">You can accept or negotiate transfers right now.</div></div></div>`
      :`<div style="background:rgba(255,71,87,.06);border:1px solid rgba(255,71,87,.2);border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;"><span style="font-size:18px;">🔴</span><div><div style="font-size:12px;font-weight:700;color:var(--red);">Transfer Window Closed</div><div style="font-size:11px;color:var(--text-dim);">Summer window: July–August. Winter window: January. Offers survive until the window they were received in closes — they don't disappear mid-season.</div></div></div>`;
    if(!offers.length){el.innerHTML=winBanner+`<div class="empty-state">📭<br><br>No transfer offers at the moment.<br><span style="font-size:11px;color:var(--text-muted);">Score goals, get MOTM, or request a transfer listing to attract clubs.</span></div>`;return;}
    el.innerHTML=winBanner+`<div class="transfer-inbox">${offers.map(o=>`
      <div class="transfer-offer pending">
        <div class="offer-header"><div class="offer-club" style="display:flex;align-items:center;gap:6px;">${typeof clubBadgeImg==='function'?clubBadgeImg(o.fromClub,'20px',''):(o.isForeign?'🌍':'🏟️')} ${o.fromClub}</div>
        <div style="font-size:10px;font-family:'DM Mono',monospace;color:var(--text-muted);">Expires: ${E.getDayLabel(o.expires)}</div></div>
        <div class="offer-detail" style="margin-bottom:4px;">${o.league}</div>
        <div style="font-size:13px;font-weight:700;color:var(--gold);margin-bottom:12px;">£${o.salary.toLocaleString()}/wk · ${o.contractYears}-year contract${o.counterMade?' · Counter made':''}</div>
        <div class="offer-actions">
          ${win
            ?`<button class="btn btn-gold" style="font-size:12px;padding:9px 16px;" onclick="openNegotiation('${o.id}')">🤝 Negotiate</button>
               <button class="btn btn-ghost" onclick="declineTransferOffer('${o.id}');App.renderDashboard();">❌ Decline</button>`
            :`<div style="font-size:11px;color:var(--text-muted);font-style:italic;">Window closed — offer held until next window</div>
               <button class="btn btn-ghost" style="font-size:11px;margin-top:6px;" onclick="declineTransferOffer('${o.id}');App.renderDashboard();">🗑️ Clear offer</button>`
          }
        </div>
      </div>`).join('')}</div>`;
    UI.updateTransferBadge();
  },

  updateTransferBadge(){
    const count=(G.pendingTransferOffers||[]).length;
    const tabBtn=document.querySelector('.tab-btn[data-tab="transfers"]');
    if(!tabBtn)return;
    const existing=tabBtn.querySelector('.tab-notif');
    if(count>0&&!existing)tabBtn.insertAdjacentHTML('beforeend','<span class="tab-notif"></span>');
    else if(!count&&existing)existing.remove();
  },

  // ── Next Fixture Panel ───────────────────────────────────
  renderNextFixture(){
    const el=document.getElementById('nextFixturePanel');if(!el)return;
    const day=G.season.dayOfSeason;
    // matchdays are removed when played, so find(d > day) is always the true next fixture
    const nextLeagueDay=(G.league.matchdays||[]).find(d=>d>day)??null;
    let nextCupDay=null,nextCupLabel='';
    Object.entries(G.cups||{}).forEach(([id,cup])=>{
      if(cup.eliminated||cup.winner)return;
      const cd=CUPS.find(c=>c.id===id);
      const nd=(cup.matchDays||[]).find(d=>d>day)??null;
      if(nd!==null&&(nextCupDay===null||nd<nextCupDay)){nextCupDay=nd;nextCupLabel=`${cd?.name||'Cup'} — ${cd?.rounds?.[cup.stage]||'Final'}`;}
    });
    const fixtures=[];
    if(nextLeagueDay!==null)fixtures.push({day:nextLeagueDay,label:G.league.name,icon:'⚽',isCup:false});
    if(nextCupDay!==null)fixtures.push({day:nextCupDay,label:nextCupLabel,icon:'🏆',isCup:true});
    fixtures.sort((a,b)=>a.day-b.day);
    const next=fixtures[0];
    if(!next){el.innerHTML=`<div class="fixture-empty">No upcoming fixtures</div>`;return;}
    const daysAway=Math.max(0,next.day-day);
    // Use fixture list to show real next opponent
    let opp='Opponents';
    if(!next.isCup&&G.league.fixtures&&G.league.fixtures.length>0){
      const fi=G.league.fixtures[(G.league.nextMatchIdx||0)%G.league.fixtures.length];
      opp=fi?(fi.home===G.club.name?fi.away:fi.home):'Opponents';
    } else if(next.isCup){
      // Find cup and get bracket opponent
      const activeCups=Object.entries(G.cups||{}).filter(([,c])=>!c.eliminated&&!c.winner);
      for(const [,cup] of activeCups){
        const br=cup.bracketRounds?.[cup.stage];
        const pm=br?.matches?.find(m=>m.isPlayer);
        if(pm){opp=pm.away||'Cup Opponents';break;}
      }
    }
    const urgency=daysAway<=3?'style="color:var(--accent);font-weight:700;"':daysAway<=7?'style="color:var(--gold);"':'';
    const daysLabel=daysAway===0?'<span style="color:var(--accent);font-weight:700;">TODAY</span>':daysAway===1?'<span style="color:var(--gold);font-weight:700;">Tomorrow</span>':`<span ${urgency}>In ${daysAway} days</span>`;
    const myBadge=typeof clubBadgeImg==='function'?clubBadgeImg(G.club.name,'20px','margin-right:2px;'):'';
    const oppBadge=typeof clubBadgeImg==='function'?clubBadgeImg(opp,'20px','margin-right:2px;'):'';
    el.innerHTML=`<div class="fixture-pill">
      <span class="fix-badge">${next.isCup?'🏆':'⚽'} NEXT FIXTURE</span>
      <span class="fix-teams" style="display:flex;align-items:center;gap:4px;">
        ${myBadge}<span>${G.club.name}</span>
        <em style="color:var(--text-muted);font-style:normal;margin:0 4px;">vs</em>
        ${oppBadge}<span>${opp}</span>
      </span>
      <span class="fix-comp" style="margin-left:auto;">${next.label}</span>
      <span class="fix-days">${daysLabel}</span>
    </div>`;
  },

  renderManagerTab(){
    const el=document.getElementById('managerContent');if(!el)return;

    // Loan mode — completely different UI
    if(G.loanActive&&G.loanOriginalClub){
      const orig=G.loanOriginalClub;
      el.innerHTML=`
        <div class="card" style="margin-bottom:14px;border-color:rgba(74,158,255,.3);background:rgba(74,158,255,.04);">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
            <div style="font-size:36px;">✈️</div>
            <div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--blue);letter-spacing:1px;">ON LOAN</div>
              <div style="font-size:13px;color:var(--text-dim);">${G.club.name} · ${G.loanDaysLeft} day${G.loanDaysLeft!==1?'s':''} remaining</div>
            </div>
          </div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.7;margin-bottom:14px;">
            Your parent club is <strong style="color:var(--text);">${orig.name}</strong>. You're on an emergency loan and must return when it expires. Transfer requests and contract negotiations are suspended during this period.
          </div>
          <div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px;">
            <div style="font-size:11px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--blue);margin-bottom:8px;">LOAN MANAGER</div>
            <div style="font-size:13px;font-weight:700;">${G.manager.name}</div>
            <div style="font-size:11px;color:var(--text-dim);">${G.club.name} · ${LEAGUES.find(l=>l.tier===G.club.tier)?.name||'—'}</div>
          </div>
        </div>
        <div class="manager-opts">
          <div class="manager-opt" onclick="requestLoanCallback()" style="${G._loanRecallUsed?'opacity:.45;':''}">
            <div class="mo-icon">${G._loanRecallUsed?'🔒':'📞'}</div>
            <div class="mo-title">${G._loanRecallUsed?'Recall Already Requested':'Request Loan Recall'}</div>
            <div class="mo-desc">${G._loanRecallUsed?'You had one chance — see out the loan.':'Ask your parent club to bring you back early. One attempt only.'}</div>
          </div>
          <div class="manager-opt" onclick="UI.showContractStatus()">
            <div class="mo-icon">📄</div>
            <div class="mo-title">View Contract Status</div>
            <div class="mo-desc">See your parent club contract details.</div>
          </div>
        </div>`;
      return;
    }

    const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);
    const moodColors={favourable:'var(--accent)',good:'var(--accent)',neutral:'var(--gold)',sceptical:'var(--accent2)',poor:'var(--red)'};
    const moodEmoji={favourable:'😄',good:'🙂',neutral:'😐',sceptical:'🤨',poor:'😠'};
    const morale=G.morale||50;
    const moraleColor=morale>=70?'var(--accent)':morale>=45?'var(--gold)':'var(--red)';
    const moraleLabel=morale>=80?'Excellent':morale>=65?'Good':morale>=45?'Neutral':morale>=25?'Low':'Poor';
    const brand=G.brand||0;
    el.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        <div style="background:var(--surface2);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-family:'DM Mono',monospace;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:6px;">TEAM MORALE</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
              <div style="width:${morale}%;height:100%;background:${moraleColor};border-radius:3px;transition:width .5s;"></div>
            </div>
            <span style="font-size:12px;font-weight:700;color:${moraleColor};">${moraleLabel}</span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);line-height:1.5;">
            ${morale>=75?'🔥 Performance bonus active — higher ratings & selection priority':''}
            ${morale>=50&&morale<75?'✅ Normal — affects selection chance slightly':''}
            ${morale<50?'⚠️ Low morale — harder to get selected, lower ratings':''}
          </div>
        </div>
        <div style="background:var(--surface2);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-family:'DM Mono',monospace;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:4px;">BRAND</div>
          <div style="font-size:18px;font-weight:700;color:var(--gold);margin-bottom:4px;">${brand>0?'+':''}${brand} <span style="font-size:11px;color:var(--text-muted);">pts</span></div>
          <div style="font-size:10px;color:var(--text-muted);line-height:1.5;">
            ${brand>=40?'🌟 Superstar: +£600/wk passive deal active':brand>=20?'⭐ Rising star: +£300/wk passive deal active':brand>=10?'📈 Building — unlock deals at 20+ pts':'📊 Earn pts via press conferences & media events'}
            <br>💰 Earning £${Math.floor(brand/5)*100}/wk bonus from brand
          </div>
        </div>
      </div>
      <div class="manager-card">
        <div class="manager-avatar">🧑‍💼</div>
        <div class="manager-info">
          <div class="manager-name">${G.manager.name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">${G.manager.title||'Head Coach'} · ${LEAGUES.find(l=>l.tier===G.club.tier)?.name||'—'}</div>
          <div style="font-size:12px;color:${moodColors[op.opinion]}">${moodEmoji[op.opinion]} ${op.text}</div>
        </div>
      </div>
      <div class="manager-opts">
        <div class="manager-opt" onclick="requestNewContract()"><div class="mo-icon">✍️</div><div class="mo-title">Request New Contract</div><div class="mo-desc">Ask the manager to improve your deal.</div></div>
        <div class="manager-opt" onclick="requestTransferListing()"><div class="mo-icon">📋</div><div class="mo-title">Request Transfer Listing</div><div class="mo-desc">Tell the manager you want to leave.</div></div>
        <div class="manager-opt" onclick="UI.showContractStatus()"><div class="mo-icon">📄</div><div class="mo-title">View Contract Status</div><div class="mo-desc">${G.club.isFreeAgent?'No contract — you\'re a free agent':`${G.club.contractYears} year${G.club.contractYears!==1?'s':''} remaining`}</div></div>
        <div class="manager-opt" onclick="UI.showSquadStatus()"><div class="mo-icon">👥</div><div class="mo-title">Squad Standing</div><div class="mo-desc">See where you rank in the manager's plans.</div></div>
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
    const op=E.managerOpinion(G.player.overall,G.manager.teamAvgOVR);const pos=getLeaguePosition();
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

  renderCareerTab(){
    const cs=G.careerStats;
    document.getElementById('careerStatsGrid').innerHTML=[
      {l:'Goals',v:cs.goals,c:'var(--accent)'},{l:'Assists',v:cs.assists,c:'var(--blue)'},
      {l:'Appearances',v:cs.apps,c:'var(--text)'},{l:'MOTM Awards',v:cs.motm,c:'var(--gold)'},
      {l:'Seasons',v:cs.seasons,c:'var(--text)'},{l:'Trophies',v:cs.trophies,c:'var(--gold)'},
      {l:'Best OVR',v:cs.bestOVR,c:'var(--accent2)'},{l:'Red Cards',v:cs.reds,c:'var(--red)'},
      {l:'Int\'l Caps',v:cs.intlCaps||0,c:'var(--blue)'},{l:'Passive Income',v:`£${G.passiveIncome.toLocaleString()}/wk`,c:'var(--gold)'},
    ].map(({l,v,c})=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:12px;color:var(--text-dim);">${l}</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${c};">${v}</span>
    </div>`).join('');
    const ach=[...G.achievements];
    document.getElementById('achievementsList').innerHTML=ach.length
      ?`<div style="display:flex;flex-wrap:wrap;gap:8px;">${ach.map(a=>`<span class="chip chip-gold">🏅 ${a}</span>`).join('')}</div>`
      :`<div class="empty-state">No achievements yet — keep playing!</div>`;
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

  showSeasonEndModal(){
    const st=G.seasonStats,p=G.player;
    const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    const pos=getLeaguePosition();
    const promoted=league.promoted&&pos<=league.promoted;
    const relegated=league.relegated&&pos>G.league.teams.length-league.relegated;
    const champion=pos===1;
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">${champion?'🏆':promoted?'🚀':relegated?'📉':'🏁'}</span>
        <div class="event-modal-title">Season ${G.season.number} Complete</div>
        <div class="event-modal-subtitle">${G.club.name} finished <strong>${pos}${pos===1?'st':pos===2?'nd':pos===3?'rd':'th'}</strong> in the ${G.league.name}
          ${champion?' — <strong style="color:var(--gold)">Champions!</strong>':''}
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

  showAgeCapModal(){
    const p=G.player,idx=getExtensionIndex(),maxExt=EXTENSION_COSTS.length;
    const canExtend=idx<maxExt,extCost=canExtend?EXTENSION_COSTS[idx]:0,extLabel=canExtend?EXTENSION_LABELS[idx]:'—';
    const canAfford=G.wallet>=extCost,st=G.seasonStats,pos=getLeaguePosition();
    const league=LEAGUES.find(l=>l.tier===G.club.tier)||LEAGUES[0];
    const promoted=league.promoted&&pos<=league.promoted,relegated=league.relegated&&pos>G.league.teams.length-league.relegated;
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">⏳</span>
        <div class="event-modal-title">Father Time is Calling</div>
        <div class="event-modal-subtitle">You've turned <strong>${p.age}</strong> years old.</div>
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
        ${canExtend?`Pay <strong style="color:var(--gold)">£${extCost.toLocaleString()}</strong> to extend your career one more season <em>(${extLabel})</em>. Extension ${idx+1} of ${maxExt}.`:`You've used all ${maxExt} career extensions. Go out on your own terms.`}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${canExtend&&canAfford?`<button class="btn btn-gold" style="width:100%;padding:13px;font-size:14px;" onclick="extendCareer()">⏳ Pay £${extCost.toLocaleString()} — Play On (${extLabel})</button>`:''}
        ${canExtend&&!canAfford?`<div class="btn btn-ghost" style="width:100%;text-align:center;opacity:.5;cursor:not-allowed;">⏳ Extend career (£${extCost.toLocaleString()}) — Insufficient funds</div>`:''}
        <button class="btn btn-primary" style="width:100%;padding:13px;font-size:14px;" onclick="App.confirmRetirement()">🏆 Retire to Hall of Fame</button>
      </div>`,true);
  },

  showFreeAgentOffers(){
    const offers=generateFreeAgentOffers();G._faOffers=offers;
    showModal(`
      <div class="event-modal-header"><span class="event-modal-emoji">🔓</span><div class="event-modal-title">Free Agent</div><div class="event-modal-subtitle">You're without a club. Sign anywhere.</div></div>
      <div class="club-offers">${offers.map(o=>`
        <div class="club-offer"><div class="offer-info"><div class="offer-club" style="font-weight:700;">🏟️ ${o.fromClub}</div>
        <div class="offer-detail">${o.league} · £${o.salary.toLocaleString()}/wk · ${o.contractYears}yr</div></div>
        <button class="btn btn-primary" style="padding:9px 14px;font-size:12px;" onclick="signFreeAgent('${o.id}')">Sign</button>
        </div>`).join('')}
      </div>`);
  },

  showBlockingEvent(ev){
    if(!ev)return;
    if(ev.isWorldCup){UI.showWorldCupModal(ev);return;}
    const bodyText=ev.body?.replace('{{position}}',G.player.position)||'';

    // Press conference gets special treatment
    if(ev.isPressConf){
      const moraleVal=G.morale||50;
      const moraleColor=moraleVal>=70?'var(--accent)':moraleVal>=45?'var(--gold)':'var(--red)';
      const brandVal=G.brand||0;
      const choicesHTML=ev.choices.map(c=>`
        <button class="event-choice" onclick="App.resolveBlockingEvent('${c.fn}')" style="text-align:left;">
          <div class="ec-label" style="color:var(--text);font-size:13px;font-weight:600;">🎙️ ${c.label}</div>
        </button>`).join('');
      showModal(`
        <div class="event-modal-header">
          <span class="event-modal-emoji">🎤</span>
          <div style="font-size:9px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--accent2);margin-bottom:6px;">📰 PRESS CONFERENCE</div>
          <div class="event-modal-title">${ev.title}</div>
          <div class="event-modal-subtitle">${ev.subtitle}</div>
        </div>
        <div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px;">
          <div style="font-size:12px;color:var(--text-dim);line-height:1.75;font-style:italic;">"${bodyText}"</div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <div style="flex:1;background:var(--surface2);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:10px;color:var(--text-muted);font-family:'DM Mono',monospace;letter-spacing:1px;">MORALE</div>
            <div style="font-size:18px;font-weight:700;color:${moraleColor};">${moraleVal}</div>
          </div>
          <div style="flex:1;background:var(--surface2);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:10px;color:var(--text-muted);font-family:'DM Mono',monospace;letter-spacing:1px;">BRAND</div>
            <div style="font-size:18px;font-weight:700;color:var(--gold);">${brandVal}</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">Choose your response carefully — outcomes are unpredictable:</div>
        <div class="event-choices">${choicesHTML}</div>`,true);
      return;
    }

    const rarityBadge={rare:'🔶 Rare Event',very_rare:'💎 Very Rare Event',legendary:'☠️ LEGENDARY EVENT',uncommon:'⬦ Uncommon Event',common:''}[ev.rarity]||'';
    const choicesHTML=ev.choices.map(c=>{
      const isDanger=c.label.includes('👊')||c.label.includes('😡')||c.label.includes('💀');
      const isGold=c.label.includes('💰')||c.label.includes('✍️')||c.label.includes('✈️')||c.label.includes('🌍')||c.label.includes('🤝');
      return`<button class="event-choice ${isDanger?'danger':isGold?'gold':''}" onclick="App.resolveBlockingEvent('${c.fn}')">
        <div class="ec-label" style="color:var(--text);font-size:13px;font-weight:600;">${c.label}</div>
      </button>`;
    }).join('');
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">${ev.icon}</span>
        ${rarityBadge?`<div style="font-size:9px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--accent2);margin-bottom:6px;">${rarityBadge}</div>`:''}
        <div class="event-modal-title">${ev.title}</div>
        <div class="event-modal-subtitle">${ev.subtitle}</div>
      </div>
      <p style="color:var(--text-dim);font-size:13px;line-height:1.75;margin-bottom:16px;white-space:pre-line;">${bodyText}</p>
      <div class="event-choices">${choicesHTML}</div>`,true);
  },

  // ── World Cup Modal ────────────────────────────────────────
  showWorldCupModal(ev){
    const nat=NATIONS.find(n=>n.name===G.player.nation)||{flag:'🌍',name:G.player.nation,callupOVR:70};
    const year=G.season.startYear;
    showModal(`
      <div class="event-modal-header">
        <div style="font-size:9px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--gold);margin-bottom:6px;">🌍 WORLD CUP CALL-UP</div>
        <span class="event-modal-emoji">${nat.flag}</span>
        <div class="event-modal-title">WORLD CUP ${year}</div>
        <div class="event-modal-subtitle">${nat.flag} ${nat.name} have selected you for the World Cup squad!</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(245,200,66,.08),rgba(0,229,160,.08));border:1px solid rgba(245,200,66,.25);border-radius:12px;padding:16px;margin:14px 0;font-size:13px;line-height:1.9;color:var(--text-dim);">
        🏟️ Up to 7 matches — Group Stage through to the Final<br>
        ⭐ International exposure boosts key attributes<br>
        🏆 Win it and become a true all-time legend
      </div>
      <div class="event-choices">
        <button class="event-choice gold" onclick="App.resolveBlockingEvent('wcPlay')">
          <div class="ec-label" style="color:var(--text);font-size:14px;font-weight:700;">${nat.flag} Represent ${nat.name}</div>
          <div class="ec-outcome" style="color:var(--text-dim);">Accept the call-up. Play for history.</div>
        </button>
        <button class="event-choice danger" onclick="App.resolveBlockingEvent('wcDecline')">
          <div class="ec-label" style="color:var(--text);">❌ Pull out — club commitments</div>
          <div class="ec-outcome" style="color:var(--text-dim);">Withdraw from the squad.</div>
        </button>
      </div>`,true);
  },

  // ── Cup Win Celebration ───────────────────────────────────────
  showCupCelebration(cupDef){
    const confetti=['🎊','🎉','🏆','⭐','🥇','✨','🎆','🎇'];
    const rand=arr=>arr[Math.floor(Math.random()*arr.length)];
    showModal(`
      <div style="text-align:center;padding:8px 0 24px;">
        <div style="font-size:64px;animation:bounceIn .6s cubic-bezier(.22,1,.36,1) both;margin-bottom:12px;">${cupDef.icon}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:3px;color:var(--gold);margin-bottom:6px;text-shadow:0 0 30px rgba(245,200,66,.5);">
          CHAMPIONS!
        </div>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px;color:var(--text);">${cupDef.name}</div>
        <div style="font-size:13px;color:var(--text-dim);margin-bottom:20px;">You've lifted the trophy. This moment is forever.</div>
        <div style="font-size:40px;letter-spacing:6px;margin-bottom:24px;">${Array.from({length:7},()=>rand(confetti)).join('')}</div>
        <div style="background:linear-gradient(135deg,rgba(245,200,66,.1),rgba(0,229,160,.08));border:1px solid rgba(245,200,66,.3);border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-size:11px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--gold);margin-bottom:8px;">SEASON HONOURS</div>
          <div style="font-size:13px;color:var(--text-dim);">🏆 Trophies this career: <strong style="color:var(--gold);">${G.careerStats.trophies}</strong></div>
        </div>
        <button class="btn btn-gold" style="width:100%;padding:14px;font-size:15px;" onclick="closeModal();App.renderDashboard();">
          🎊 Celebrate with the Squad
        </button>
      </div>`,true);
  },
  showBetModal(){
    const opp=G.league.teams.find(t=>!t.isPlayer)||{name:'Opponents'};
    showModal(`
      <div class="event-modal-header"><span class="event-modal-emoji">🎰</span><div class="event-modal-title">Place Your Bet</div><div class="event-modal-subtitle">${G.club.name} vs ${opp.name}</div></div>
      <div class="bet-options">
        <div class="bet-opt selected" id="bopt-win" onclick="UI.selectBet('win')"><div class="bet-label">${G.club.name} Win</div><div class="bet-odds">2.1×</div></div>
        <div class="bet-opt" id="bopt-draw" onclick="UI.selectBet('draw')"><div class="bet-label">Draw</div><div class="bet-odds">3.4×</div></div>
        <div class="bet-opt" id="bopt-lose" onclick="UI.selectBet('lose')"><div class="bet-label">${opp.name} Win</div><div class="bet-odds">4.0×</div></div>
      </div>
      <div class="field-label" style="margin-top:14px;">Stake</div>
      <div class="bet-input-row"><input type="number" id="betAmountInput" value="500" min="100" max="${G.wallet}" style="flex:1;" oninput="UI._betAmt=parseInt(this.value)||0"></div>
      <div class="bet-quick" style="margin-top:6px;">${[500,1000,5000,10000].map(a=>`<div class="bet-q-btn" onclick="UI.quickBet(${a})">£${a.toLocaleString()}</div>`).join('')}<div class="bet-q-btn" onclick="UI.quickBet(${G.wallet})">All In</div></div>
      <p style="font-size:11px;color:var(--red);margin-top:10px;">⚠️ In-game gambling only.</p>
      <button class="btn btn-danger" style="width:100%;margin-top:12px;" onclick="UI.confirmBet()">🎲 Place Bet</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:6px;" onclick="closeModal()">Walk away</button>`,false);
    UI._betSel='win';UI._betAmt=500;
  },
  selectBet(o){UI._betSel=o;['win','draw','lose'].forEach(x=>document.getElementById(`bopt-${x}`)?.classList.toggle('selected',x===o));},
  quickBet(a){UI._betAmt=Math.min(a,G.wallet);const inp=document.getElementById('betAmountInput');if(inp)inp.value=UI._betAmt;},
  confirmBet(){resolveBet(UI._betSel||'win',UI._betAmt||0);},
  _casinoAutosave(){
    try{
      const s={...G,achievements:[...G.achievements],triggeredEvents:[...G.triggeredEvents]};
      localStorage.setItem('propath3_save',JSON.stringify(s));
      showToast('💾 Casino autosaved','');
    }catch(e){}
  },

  // ── Casino Tab ────────────────────────────────────────────
  renderCasinoTab(){
    const el=document.getElementById('casinoContent');if(!el)return;
    el.innerHTML=`
      <div class="card">
        <div style="text-align:center;padding:0 0 16px;border-bottom:1px solid var(--border);margin-bottom:16px;">
          <div style="font-size:36px;margin-bottom:8px;">🎰</div>
          <div style="font-size:18px;font-weight:700;letter-spacing:.5px;margin-bottom:4px;">The ProPath Casino</div>
          <div style="font-size:12px;color:var(--text-dim);">For entertainment only · Gamble responsibly</div>
          <div style="margin-top:8px;font-size:15px;color:var(--gold);font-weight:700;">${UI.fmtMoney(G.wallet)} available</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          ${[
            {icon:'🪙',name:'Coin Flip',desc:'Call it — 1.9×',fn:'UI.playCoinFlip()'},
            {icon:'🎲',name:'Dice Roll',desc:'High/Low — 1.8×',fn:'UI.playDice()'},
            {icon:'🎰',name:'Slots',desc:'Match 3 — up to 10×',fn:'UI.playSlots()'},
            {icon:'🃏',name:'Blackjack',desc:'Beat 21 — 2×',fn:'UI.playBlackjack()'},
            {icon:'🎡',name:'Roulette',desc:'Red/Black/Number',fn:'UI.playRoulette()'},
            {icon:'🎫',name:'Scratchcard',desc:'£500 — instant win',fn:'UI.playScratchcard()'},
          ].map(g=>`<button class="casino-game-btn" onclick="${g.fn}">
            <div style="font-size:28px;margin-bottom:6px;">${g.icon}</div>
            <div style="font-weight:700;font-size:12px;margin-bottom:3px;">${g.name}</div>
            <div style="font-size:10px;color:var(--text-dim);">${g.desc}</div>
          </button>`).join('')}
        </div>
        <p style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:14px;">⚠️ No real money. If gambling affects you in real life, please seek support.</p>
      </div>`;
  },

  // Store the pending game so stake modals can reference it without serializing callbacks
  _pendingGame:null,

  _askStake(gameKey,gameTitle){
    UI._pendingGame=gameKey;
    const stakes=[500,1000,2000,5000,10000,25000,50000].filter(s=>s<=G.wallet);
    if(!stakes.length&&G.wallet>=100)stakes.push(G.wallet);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">💷</span><div class="event-modal-title">${gameTitle}</div><div class="event-modal-subtitle">Balance: ${UI.fmtMoney(G.wallet)}</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:16px 0;">
      ${stakes.map(s=>`<button class="btn btn-primary" style="font-size:12px;padding:10px;" onclick="UI._launchGame(${s})">${UI.fmtMoney(s)}</button>`).join('')}
      ${G.wallet>0?`<button class="btn btn-danger" style="font-size:11px;padding:10px;grid-column:span 3;" onclick="UI._launchGame(${G.wallet})">🔥 ALL IN — ${UI.fmtMoney(G.wallet)}</button>`:''}
    </div>
    <button class="btn btn-ghost" style="width:100%;" onclick="closeModal();UI.renderCasinoTab()">← Back</button>`);
  },

  _launchGame(stake){
    const g=UI._pendingGame;
    if(g==='coinflip')UI._showCoinFlip(stake);
    else if(g==='dice')UI._showDice(stake);
    else if(g==='slots')UI._spinSlots(stake);
    else if(g==='roulette')UI._showRoulette(stake);
    else if(g==='blackjack')UI._bjStart(stake);
    else if(g==='scratchcard')UI._doScratchcard(stake);
  },

  playCoinFlip(){UI._askStake('coinflip','🪙 Coin Flip');},
  _showCoinFlip(stake){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🪙</span><div class="event-modal-title">Coin Flip — ${UI.fmtMoney(stake)}</div><div class="event-modal-subtitle">Call it in the air...</div></div>
    <div style="display:flex;gap:12px;margin:20px 0;">
      <button class="btn btn-primary" style="flex:1;padding:18px;font-size:18px;" onclick="UI._coinResult(${stake},'heads')">🪙 Heads</button>
      <button class="btn btn-gold" style="flex:1;padding:18px;font-size:18px;" onclick="UI._coinResult(${stake},'tails')">🌕 Tails</button>
    </div><button class="btn btn-ghost" style="width:100%;" onclick="closeModal();UI.renderCasinoTab()">← Back</button>`);
  },
  _coinResult(stake,call){
    const r=Math.random()<0.5?'heads':'tails',won=r===call;
    if(won)G.wallet+=Math.floor(stake*0.9);else G.wallet-=stake;
    UI._casinoAutosave();
    addLog(won?'🪙':'💸',won?`Coin Flip WIN +${UI.fmtMoney(Math.floor(stake*.9))}`:`Coin Flip loss -${UI.fmtMoney(stake)}`,'',G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">${won?'🎉':'😬'}</span><div class="event-modal-title">${r.toUpperCase()}! ${won?'WIN':'LOSS'}</div><div class="event-modal-subtitle">${won?`+${UI.fmtMoney(Math.floor(stake*.9))}`:`-${UI.fmtMoney(stake)}`}</div></div>
    <div style="text-align:center;font-size:80px;padding:16px;">${r==='heads'?'🪙':'🌕'}</div>
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playCoinFlip()">Again</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
    App.renderDashboard();
  },

  playDice(){UI._askStake('dice','🎲 Dice Roll');},
  _showDice(stake){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🎲</span><div class="event-modal-title">Dice — ${UI.fmtMoney(stake)}</div><div class="event-modal-subtitle">High (4-6) or Low (1-3)?</div></div>
    <div style="display:flex;gap:12px;margin:20px 0;">
      <button class="btn btn-primary" style="flex:1;padding:16px;" onclick="UI._diceResult(${stake},'high')">🔺 High (4-6)</button>
      <button class="btn btn-gold" style="flex:1;padding:16px;" onclick="UI._diceResult(${stake},'low')">🔻 Low (1-3)</button>
    </div><button class="btn btn-ghost" style="width:100%;" onclick="closeModal();UI.renderCasinoTab()">← Back</button>`);
  },
  _diceResult(stake,call){
    const roll=Math.floor(Math.random()*6)+1,won=(call==='high'&&roll>=4)||(call==='low'&&roll<=3);
    const faces=['','⚀','⚁','⚂','⚃','⚄','⚅'];
    if(won)G.wallet+=Math.floor(stake*0.8);else G.wallet-=stake;
    UI._casinoAutosave();
    addLog(won?'🎲':'💸',won?`Dice WIN +${UI.fmtMoney(Math.floor(stake*.8))}`:`Dice loss -${UI.fmtMoney(stake)}`,'',G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">${won?'🎉':'😬'}</span><div class="event-modal-title">Rolled ${roll}! ${won?'WIN':'LOSS'}</div><div class="event-modal-subtitle">${won?`+${UI.fmtMoney(Math.floor(stake*.8))}`:`-${UI.fmtMoney(stake)}`}</div></div>
    <div style="text-align:center;font-size:80px;padding:16px;">${faces[roll]}</div>
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playDice()">Again</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
    App.renderDashboard();
  },

  playSlots(){UI._askStake('slots','🎰 Slots');},
  _spinSlots(stake){
    const sym=['⚽','🏆','⭐','💰','👑','🎯','🔥','💎'];
    const [a,b,c]=[E.pick(sym),E.pick(sym),E.pick(sym)];
    let mult=0,label='No match';
    if(a===b&&b===c){if(a==='💎'){mult=10;label='💎 JACKPOT 10×!';}else if(a==='👑'){mult=6;label='👑 ROYAL 6×!';}else if(a==='🏆'){mult=5;label='🏆 TROPHY 5×!';}else{mult=3;label=`${a} THREE OF A KIND 3×!`;}}
    else if(a===b||b===c||a===c){mult=1.4;label='Pair — 1.4×';}
    const payout=Math.floor(stake*mult);const net=payout-stake;
    if(net>0)G.wallet+=net;else G.wallet-=stake;
    UI._casinoAutosave();
    addLog(net>0?'🎰':'💸',net>0?`Slots: ${label} +${UI.fmtMoney(net)}`:`Slots loss -${UI.fmtMoney(stake)}`,'',G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🎰</span><div class="event-modal-title">${label}</div><div class="event-modal-subtitle">${net>0?`+${UI.fmtMoney(net)}`:`-${UI.fmtMoney(stake)}`}</div></div>
    <div style="display:flex;justify-content:center;gap:12px;padding:20px;background:var(--surface2);border-radius:12px;margin:12px 0;font-size:52px;">${a}${b}${c}</div>
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playSlots()">Spin Again</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
    App.renderDashboard();
  },

  playRoulette(){UI._askStake('roulette','🎡 Roulette');},
  _showRoulette(stake){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🎡</span><div class="event-modal-title">Roulette — ${UI.fmtMoney(stake)}</div><div class="event-modal-subtitle">Place your chips</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;">
      <button class="btn" style="padding:14px;background:rgba(255,71,87,.15);border-color:var(--red);color:var(--text);" onclick="UI._rouletteColor(${stake},'red',1.9)">🔴 Red (1.9×)</button>
      <button class="btn btn-ghost" style="padding:14px;" onclick="UI._rouletteColor(${stake},'black',1.9)">⚫ Black (1.9×)</button>
      <button class="btn btn-gold" style="padding:14px;" onclick="UI._rouletteColor(${stake},'green',14)">🟢 Green (14×)</button>
      <button class="btn btn-primary" style="padding:14px;" onclick="UI._rouletteNumber(${stake})">🔢 Pick Number (35×)</button>
    </div><button class="btn btn-ghost" style="width:100%;" onclick="closeModal();UI.renderCasinoTab()">← Back</button>`);
  },
  _rouletteColor(stake,bet,mult){
    const num=Math.floor(Math.random()*37),color=num===0?'green':num%2===0?'black':'red';
    const won=color===bet,payout=won?Math.floor(stake*mult):0;
    if(won)G.wallet+=payout-stake;else G.wallet-=stake;
    UI._casinoAutosave();
    const emoji={red:'🔴',black:'⚫',green:'🟢'}[color];
    addLog(won?'🎡':'💸',won?`Roulette WIN +${UI.fmtMoney(payout-stake)}`:`Roulette loss -${UI.fmtMoney(stake)}`,'',G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🎡</span><div class="event-modal-title">${emoji} ${num} — ${color.toUpperCase()}</div><div class="event-modal-subtitle">${won?`+${UI.fmtMoney(payout-stake)}`:`-${UI.fmtMoney(stake)}`}</div></div>
    <div style="text-align:center;font-size:72px;padding:16px;">${emoji}</div>
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playRoulette()">Again</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
    App.renderDashboard();
  },
  _rouletteNumber(stake){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🔢</span><div class="event-modal-title">Pick 0–36 (35×)</div><div class="event-modal-subtitle">Hit it exactly to win big</div></div>
    <input type="number" id="roulNum" min="0" max="36" value="7" style="width:100%;font-size:24px;text-align:center;padding:14px;margin:16px 0;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);">
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI._rouletteNumResult(${stake},parseInt(document.getElementById('roulNum').value)||0)">🎡 Spin!</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
  },
  _rouletteNumResult(stake,pick){
    const num=Math.floor(Math.random()*37),won=num===pick;
    if(won)G.wallet+=Math.floor(stake*35)-stake;else G.wallet-=stake;
    UI._casinoAutosave();
    addLog(won?'🎡':'💸',won?`ROULETTE JACKPOT! +${UI.fmtMoney(Math.floor(stake*35)-stake)}`:`Roulette loss -${UI.fmtMoney(stake)}`,'',G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">${won?'🎉':'🎡'}</span><div class="event-modal-title">Ball: ${num}${won?' — YOUR NUMBER!':''}</div><div class="event-modal-subtitle">${won?`35× WIN! +${UI.fmtMoney(Math.floor(stake*35)-stake)}`:`You picked ${pick}. -${UI.fmtMoney(stake)}`}</div></div>
    <div style="text-align:center;font-size:72px;padding:16px;">${won?'🎉':'💫'}</div>
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playRoulette()">Again</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
    App.renderDashboard();
  },

  playBlackjack(){UI._askStake('blackjack','🃏 Blackjack');},
  _cardVal(c){return Math.min(10,[1,2,3,4,5,6,7,8,9,10,10,10,10][c%13]);},
  _cardStr(c){return[' A','2','3','4','5','6','7','8','9','10',' J',' Q',' K'][c%13];},
  _handVal(h){let s=h.reduce((a,c)=>a+UI._cardVal(c),0);if(s<=11&&h.some(c=>c%13===0))s+=10;return s;},
  _bjStart(stake){
    const deck=Array.from({length:52},(_,i)=>i);
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    UI._bj={stake,player:[deck.pop(),deck.pop()],dealer:[deck.pop(),deck.pop()],deck};
    if(UI._handVal(UI._bj.player)===21)UI._bjEnd('bj');else UI._bjRender();
  },
  _bjRender(done=false,msg=''){
    const{stake,player,dealer}=UI._bj;const pv=UI._handVal(player);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🃏</span><div class="event-modal-title">Blackjack — ${UI.fmtMoney(stake)}</div></div>
    <div style="background:var(--surface2);border-radius:10px;padding:14px;margin:10px 0;">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;">DEALER ${done?UI._handVal(dealer):''}</div>
      <div style="font-size:20px;font-family:monospace;letter-spacing:3px;color:var(--text);">${done?dealer.map(c=>UI._cardStr(c)).join(' '):UI._cardStr(dealer[0])+' 🂠'}</div>
    </div>
    <div style="background:var(--surface2);border-radius:10px;padding:14px;margin:10px 0;">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;">YOU — ${pv}</div>
      <div style="font-size:20px;font-family:monospace;letter-spacing:3px;color:${pv>21?'var(--red)':pv===21?'var(--gold)':'var(--text)'};">${player.map(c=>UI._cardStr(c)).join(' ')}</div>
    </div>
    ${msg?`<div style="background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.2);border-radius:8px;padding:10px;margin:8px 0;font-weight:700;text-align:center;color:var(--accent);">${msg}</div>`:''}
    ${done
      ?`<div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playBlackjack()">New Hand</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`
      :`<div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;padding:14px;" onclick="UI._bjHit()">👊 Hit</button><button class="btn btn-gold" style="flex:1;padding:14px;" onclick="UI._bjStand()">✋ Stand</button></div>`}`);
  },
  _bjHit(){UI._bj.player.push(UI._bj.deck.pop());const pv=UI._handVal(UI._bj.player);if(pv>21)UI._bjEnd('bust');else if(pv===21)UI._bjEnd('stand');else UI._bjRender();},
  _bjStand(){UI._bjEnd('stand');},
  _bjEnd(reason){
    const{stake,player,dealer,deck}=UI._bj;
    while(UI._handVal(dealer)<17)dealer.push(deck.pop());
    UI._bj.dealer=dealer;
    const pv=UI._handVal(player),dv=UI._handVal(dealer);
    let won=false,push=false,msg='';
    if(reason==='bust'){msg=`Bust! ${pv}. -${UI.fmtMoney(stake)}`;}
    else if(reason==='bj'&&player.length===2){won=true;msg=`BLACKJACK! 2.5×!`;}
    else if(dv>21){won=true;msg=`Dealer bust! You win!`;}
    else if(pv>dv){won=true;msg=`${pv} beats ${dv}!`;}
    else if(pv===dv){push=true;msg=`Push — stake returned.`;}
    else{msg=`Dealer wins (${dv} vs ${pv}). -${UI.fmtMoney(stake)}`;}
    const mult=reason==='bj'&&player.length===2?1.5:1;
    if(won)G.wallet+=Math.floor(stake*mult);else if(!push)G.wallet-=stake;
    UI._casinoAutosave();
    addLog(won?'🃏':'💸',won?`Blackjack WIN +${UI.fmtMoney(Math.floor(stake*mult))}`:`Blackjack loss -${UI.fmtMoney(stake)}`,'',G.season.dayOfSeason);
    UI._bjRender(true,msg);App.renderDashboard();
  },

  playScratchcard(){UI._doScratchcard(500);},
  _doScratchcard(stake){
    if(G.wallet<stake){showToast(`Need ${UI.fmtMoney(stake)}!`,'err');return;}
    G.wallet-=stake;
    const prizePool=[0,0,0,0,0,500,500,1000,2500,5000];
    const prize=E.pick(prizePool);if(prize>0)G.wallet+=prize;
    UI._casinoAutosave();
    const cells=Array.from({length:6},(_,i)=>i===0?prize:E.pick(prizePool));
    addLog(prize>0?'🎫':'💸',prize>0?`Scratchcard WIN +${UI.fmtMoney(prize)}`:`Scratchcard — no prize -£500`,'',G.season.dayOfSeason);
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🎫</span><div class="event-modal-title">${prize>0?'🎉 WINNER!':'No prize'}</div><div class="event-modal-subtitle">${prize>0?`+${UI.fmtMoney(prize)}`:'Better luck next time!'}</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 0;">
      ${cells.map(v=>`<div style="background:var(--surface2);border:1px solid ${v>0?'var(--gold)':'var(--border)'};border-radius:8px;padding:14px;text-align:center;font-weight:700;color:${v>0?'var(--gold)':'var(--text-muted)'};">${v>0?UI.fmtMoney(v):'✗'}</div>`).join('')}
    </div>
    <div style="display:flex;gap:10px;"><button class="btn btn-primary" style="flex:1;" onclick="UI.playScratchcard()">Another (£500)</button><button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.renderCasinoTab()">Back</button></div>`);
    App.renderDashboard();
  },


  // ── Calendar Tab (FIFA/FC-style monthly grid) ──────────────
  _calDisplayMonth: null, // {year, month} relative to season start

  _getCalMonthData(relMonth){
    // Season starts in July (month index 0 = July)
    // relMonth: 0=July, 1=Aug, 2=Sep... 11=June
    const MONTH_NAMES=['July','August','September','October','November','December','January','February','March','April','May','June'];
    const MONTH_DAYS=[31,31,30,31,30,31,31,28,31,30,31,30];
    // Day-of-season offsets for start of each month
    const monthStarts=[0,31,62,92,123,153,184,215,243,274,304,335];
    const monthStart=monthStarts[relMonth]||0;
    const monthEnd=monthStart+(MONTH_DAYS[relMonth]||30);
    return{name:MONTH_NAMES[relMonth],monthStart,monthEnd,days:MONTH_DAYS[relMonth]||30};
  },

  _currentRelMonth(){
    const day=G.season.dayOfSeason;
    const monthStarts=[0,31,62,92,123,153,184,215,243,274,304,335];
    for(let i=monthStarts.length-1;i>=0;i--){if(day>=monthStarts[i])return i;}
    return 0;
  },

  renderCalendarTab(){
    if(UI._calDisplayMonth===null) UI._calDisplayMonth=UI._currentRelMonth();
    const m=UI._calDisplayMonth;
    const {name,monthStart,monthEnd,days}=UI._getCalMonthData(m);
    const day=G.season.dayOfSeason;
    // Gather all events in this month
    const leagueDays=new Set((G.league.matchdays||[]).filter(d=>d>=monthStart&&d<monthEnd).map(d=>d-monthStart+1));
    const playedLeague=new Set([...G.matchHistory].filter(mh=>!mh.isCup).map(mh=>{
      // approx: find matchdays that have been consumed (no longer in G.league.matchdays)
      return null; // we use match history date strings instead
    }));
    // Cup days
    const cupDays={}; // dayInMonth -> [{icon, name, stage}]
    Object.entries(G.cups||{}).forEach(([id,cup])=>{
      const cd=CUPS.find(c=>c.id===id);if(!cd)return;
      (cup.matchDays||[]).forEach((d,i)=>{
        if(d>=monthStart&&d<monthEnd){
          const dm=d-monthStart+1;
          if(!cupDays[dm])cupDays[dm]=[];
          cupDays[dm].push({icon:cd.icon,name:cd.name,round:cd.rounds?.[i]||'Round',eliminated:cup.eliminated,winner:cup.winner,stage:cup.stage,roundIdx:i});
        }
      });
    });
    // Past match results from matchHistory keyed by date label
    const pastResults={};
    G.matchHistory.forEach(mh=>{
      pastResults[mh.date]=mh;
    });
    // Build day-of-week header (July starts on a Monday typically; use day offset)
    // Jul 1 of any year — just use a fixed offset per month for display
    const DOW_OFFSETS={0:1,1:4,2:0,3:2,4:5,5:1,6:3,7:6,8:2,9:4,10:0,11:3}; // approximate
    const startDow=DOW_OFFSETS[m]||0; // 0=Mon
    const el=document.getElementById('calendarGrid');if(!el)return;
    const monthTitle=document.getElementById('calMonthTitle');if(monthTitle)monthTitle.textContent=name;
    // Day of week headers
    const dowHeaders='<div class="cal-header">Mon</div><div class="cal-header">Tue</div><div class="cal-header">Wed</div><div class="cal-header">Thu</div><div class="cal-header">Fri</div><div class="cal-header">Sat</div><div class="cal-header">Sun</div>';
    let cells='';
    // Blank cells before month start
    for(let i=0;i<startDow;i++) cells+=`<div class="cal-cell empty"></div>`;
    for(let d=1;d<=days;d++){
      const absDay=monthStart+d-1;
      const dateLabel=E.getDayLabel(absDay);
      const isToday=absDay===day;
      const isPast=absDay<day;
      const hasLeague=leagueDays.has(d);
      const hasCup=!!cupDays[d];
      const pastMatch=pastResults[dateLabel];
      const resultColor=pastMatch?(pastMatch.result==='W'?'#00e5a0':pastMatch.result==='D'?'#f5c842':'#ff4757'):null;
      const cupInfo=cupDays[d]?.[0];
      let cellClass=`cal-cell${isToday?' today':''}${isPast&&!pastMatch?' past':''}`;
      let innerContent=`<div class="cal-day-num">${d}</div>`;
      if(pastMatch){
        const compIcon=pastMatch.isCup?'🏆':'⚽';
        innerContent+=`<div class="cal-fixture" style="background:${resultColor}22;border-left:2px solid ${resultColor};">
          <span style="font-size:8px;">${compIcon}</span>
          <span class="cal-result" style="color:${resultColor};font-weight:700;">${pastMatch.result} ${pastMatch.hg}-${pastMatch.ag}</span>
          ${pastMatch.myGoals?`<span style="font-size:8px;color:#00e5a0;">⚽${pastMatch.myGoals}</span>`:''}
          ${pastMatch.motm?`<span style="font-size:8px;color:var(--gold);">⭐</span>`:''}
        </div>`;
      } else if(hasLeague&&!isPast){
        innerContent+=`<div class="cal-fixture upcoming">
          <span style="font-size:8px;">⚽</span>
          <span style="font-size:9px;font-weight:600;">League</span>
        </div>`;
      }
      if(hasCup&&cupInfo){
        if(isPast){
          const pastCup=pastResults[dateLabel];
          if(pastCup&&pastCup.isCup){} // already shown above
          else{
            const cupColor=cupInfo.eliminated?'#ff4757':cupInfo.winner?'#f5c842':'#4a9eff';
            innerContent+=`<div class="cal-fixture" style="background:${cupColor}18;border-left:2px solid ${cupColor};">
              <span style="font-size:8px;">${cupInfo.icon}</span>
              <span style="font-size:8px;color:${cupColor};">${cupInfo.round}</span>
            </div>`;
          }
        } else {
          innerContent+=`<div class="cal-fixture upcoming" style="border-left:2px solid #4a9eff;">
            <span style="font-size:8px;">${cupInfo.icon}</span>
            <span style="font-size:9px;font-weight:600;">${cupInfo.round}</span>
          </div>`;
        }
      }
      if(isToday) innerContent+=`<div style="width:6px;height:6px;background:var(--accent);border-radius:50%;margin:2px auto 0;"></div>`;
      cells+=`<div class="${cellClass}">${innerContent}</div>`;
    }
    el.innerHTML=`<div class="cal-grid">${dowHeaders}${cells}</div>`;
    // Legend
    const legEl=document.getElementById('calLegend');
    if(legEl) legEl.innerHTML=`
      <span>🟢 <span style="width:12px;height:12px;background:#00e5a022;border-left:2px solid #00e5a0;display:inline-block;"></span> Win</span>
      <span>🟡 <span style="width:12px;height:12px;background:#f5c84222;border-left:2px solid #f5c842;display:inline-block;"></span> Draw</span>
      <span>🔴 <span style="width:12px;height:12px;background:#ff475722;border-left:2px solid #ff4757;display:inline-block;"></span> Loss</span>
      <span>⚽ League · 🏆 Cup</span>
      <span style="display:flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;background:var(--accent);border-radius:50%;"></span> Today</span>`;
  },

  calPrevMonth(){
    if(UI._calDisplayMonth===null) UI._calDisplayMonth=UI._currentRelMonth();
    UI._calDisplayMonth=Math.max(0, UI._calDisplayMonth-1);
    UI.renderCalendarTab();
  },

  calNextMonth(){
    if(UI._calDisplayMonth===null) UI._calDisplayMonth=UI._currentRelMonth();
    UI._calDisplayMonth=Math.min(11, UI._calDisplayMonth+1);
    UI.renderCalendarTab();
  },

  // ── HOF ───────────────────────────────────────────────────
  renderHOF(){
    const hof=getHOF();const el=document.getElementById('hofContent');
    if(!hof.length){
      el.innerHTML=`<div class="hof-empty"><div style="font-size:56px;margin-bottom:16px;">🏆</div><div style="font-size:20px;font-weight:700;margin-bottom:8px;">No Legends Yet</div><div style="color:var(--text-dim);font-size:13px;">Complete a career and retire to enshrine your first legend.</div></div>`;
      return;
    }
    el.innerHTML=`<div class="hof-grid">${[...hof].reverse().map(p=>`
      <div class="hof-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
          <div class="hof-name">${p.name}</div>
          <button onclick="UI.confirmDeleteHOF('${p.id}')" title="Remove" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:15px;padding:0;line-height:1;opacity:.6;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.6">🗑</button>
        </div>
        <div class="hof-meta">${p.flag||''} ${p.nation} · ${p.position} · ${p.seasons} season${p.seasons!==1?'s':''}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">
          ⚽ Retired: ${p.retiredInGame?`${p.retiredInGame}, ${p.retiredInGameYear}`:(p.date?`Season ${p.date}`:'')}
          &nbsp;·&nbsp; 📅 ${p.retiredIRL||'Unknown date'}
        </div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px;">Peak: ${p.bestOVR} OVR · ${p.highestLeague}${p.intlCaps?` · 🌍 ${p.intlCaps} caps`:''}</div>
        <div class="hof-stats">
          <div class="hof-stat"><div class="hof-stat-v" style="color:var(--accent)">${p.goals}</div><div class="hof-stat-l">Goals</div></div>
          <div class="hof-stat"><div class="hof-stat-v" style="color:var(--blue)">${p.assists}</div><div class="hof-stat-l">Assists</div></div>
          <div class="hof-stat"><div class="hof-stat-v">${p.apps}</div><div class="hof-stat-l">Apps</div></div>
          <div class="hof-stat"><div class="hof-stat-v" style="color:var(--gold)">${p.trophies}</div><div class="hof-stat-l">Trophies</div></div>
        </div>
      </div>`).join('')}</div>`;
  },

  confirmDeleteHOF(id){
    showModal(`<div class="event-modal-header"><span class="event-modal-emoji">🗑️</span><div class="event-modal-title">Remove from Hall of Fame?</div><div class="event-modal-subtitle">This legend will be permanently erased. There is no undo.</div></div>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="btn btn-danger" style="flex:1;" onclick="deleteHOFEntry('${id}');closeModal();UI.renderHOF();">🗑️ Remove Forever</button>
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">↩ Keep</button>
    </div>`);
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
