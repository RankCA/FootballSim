// ════════════════════════════════════════════════════════════
//  ProPath v3 — app.js
//  Main controller: screen navigation, creation, advance logic
// ════════════════════════════════════════════════════════════

// ── Creation state ────────────────────────────────────────────
let draft={firstName:'',lastName:'',nickname:'',age:17,nation:null,position:null,foot:'Right',trait:null};
let creationStep=1;

// ── Screen management ─────────────────────────────────────────
const App = {
  currentTab:'overview',

  goTo(n){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-'+n)?.classList.add('active');
    if(n===1){creationStep=1;draft={firstName:'',lastName:'',nickname:'',age:17,nation:null,position:null,foot:'Right',trait:null};renderCreationStep();}
    if(n===5)App.renderDashboard();
    if(n===6)UI.renderHOF();
    window.scrollTo({top:0,behavior:'smooth'});
  },

  renderDashboard(){
    const p=G.player,s=G.season,cl=G.club;
    if(!p)return;
    document.getElementById('dashGreeting').textContent=`Season ${s.number} · ${p.nickname||p.firstName} ${p.lastName}`;
    document.getElementById('dashSubtitle').textContent=`${NATIONS.find(n=>n.name===p.nation)?.flag||''} ${p.nation} · ${p.position} · Age ${p.age}`;
    document.getElementById('seasonBadge').textContent=`${s.startYear}/${String(s.startYear+1).slice(2)}`;
    document.getElementById('walletChip').textContent=`💰 ${UI.fmtMoney(G.wallet)}`;
    document.getElementById('currentDayLabel').textContent=E.getDayLabel(s.dayOfSeason);
    document.getElementById('freeAgentBanner').style.display=cl.isFreeAgent?'block':'none';

    const fin=s.finished||cl.isFreeAgent;
    const advBtn=document.getElementById('advanceBtn');
    const skipW=document.getElementById('skipWeekBtn');
    const skipM=document.getElementById('skipMonthBtn');
    if(advBtn){advBtn.disabled=fin;advBtn.textContent=fin?'Season Over':'▶ Next Day';}
    if(skipW)skipW.disabled=fin;
    if(skipM)skipM.disabled=fin;

    UI.renderPlayerCard();
    UI.renderAttrs();
    UI.renderProgress();
    UI.renderStatPills();
    UI.renderCareerLog();
    UI.renderRecentLog();
    UI.updateTransferBadge();

    // Refresh active tab
    App.refreshTab(App.currentTab);
  },

  switchTab(tab){
    App.currentTab=tab;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    const tabBtn=document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if(tabBtn)tabBtn.classList.add('active');
    const pane=document.getElementById('tab-'+tab);
    if(pane)pane.classList.add('active');
    App.refreshTab(tab);
  },

  refreshTab(tab){
    if(tab==='league')UI.renderLeagueTable();
    if(tab==='cups')UI.renderCupsTab();
    if(tab==='training')UI.renderTrainingTab();
    if(tab==='career')UI.renderCareerTab();
    if(tab==='transfers')UI.renderTransfersTab();
    if(tab==='manager')UI.renderManagerTab();
  },

  // ── Day advance ────────────────────────────────────────────
  advanceDay(){
    if(!G.season||G.season.finished)return;
    const result=simulateDay();
    G.dayLog.push({date:E.getDayLabel(G.season.dayOfSeason),events:result.events});

    const evEl=document.getElementById('lastDayEvents');
    if(evEl)evEl.innerHTML=result.events.map(e=>UI.renderDayEvent(e)).join('');

    G.season.dayOfSeason++;
    if(G.season.dayOfSeason>=G.season.totalDays){
      endSeason();
    } else {
      App.renderDashboard();
      // Show blocking event if any
      if(result.blockingEvent){
        UI.showBlockingEvent(result.blockingEvent);
        return;
      }
      // Show new transfer offer notice
      if(G.pendingTransferOffers.some(o=>!o._notified)){
        G.pendingTransferOffers.filter(o=>!o._notified).forEach(o=>o._notified=true);
        // Notification already toasted in state.js
      }
    }
  },

  skipDays(n){
    if(!G.season||G.season.finished)return;
    let lastEvents=[];
    for(let i=0;i<n;i++){
      if(G.season.finished||G.season.dayOfSeason>=G.season.totalDays)break;
      const result=simulateDay();
      G.dayLog.push({date:E.getDayLabel(G.season.dayOfSeason),events:result.events});
      lastEvents=result.events;
      G.season.dayOfSeason++;
      // If blocking event, stop and show
      if(result.blockingEvent){
        App.renderDashboard();
        UI.showBlockingEvent(result.blockingEvent);
        return;
      }
    }
    if(G.season.dayOfSeason>=G.season.totalDays)endSeason();
    else{
      const evEl=document.getElementById('lastDayEvents');
      if(evEl&&lastEvents.length)evEl.innerHTML=lastEvents.map(e=>UI.renderDayEvent(e)).join('');
      App.renderDashboard();
    }
  },

  skipWeek(){ App.skipDays(7); showToast('⏩ Week skipped',''); },
  skipMonth(){ App.skipDays(30); showToast('⏭ Month skipped',''); },

  resolveBlockingEvent(fnName){
    if(fnName==='showBetUI'){
      G.pendingEvent=null;
      UI.showBetModal();
      return;
    }
    resolveEvent(fnName);
  },

  buyTraining(key){
    const cur=G.player.attrs[key];
    const cost=E.trainCost(cur);
    if(G.wallet<cost){showToast('Not enough money!','err');return;}
    if(cur>=99){showToast('Already maxed!','warn');return;}
    G.wallet-=cost;
    G.player.attrs[key]=E.clamp(cur+1,0,99);
    G.player.overall=E.calcOVR(G.player.attrs,G.player.position);
    UI.renderTrainingTab();
    UI.renderAttrs();
    UI.renderPlayerCard();
    showToast(`💪 ${key} improved to ${G.player.attrs[key]}!`,'');
  },

  acceptTransfer(offerId){
    showModal(`
      <div class="event-modal-header">
        <span class="event-modal-emoji">✈️</span>
        <div class="event-modal-title">Confirm Transfer</div>
        <div class="event-modal-subtitle">All other pending offers will expire once you sign.</div>
      </div>
      <div class="event-choices">
        <button class="event-choice gold" onclick="acceptTransferOffer('${offerId}')"><div class="ec-label">✍️ Sign and transfer</div><div class="ec-outcome">A new chapter begins.</div></button>
        <button class="event-choice" onclick="closeModal()"><div class="ec-label">↩ Think again</div><div class="ec-outcome">Come back when ready.</div></button>
      </div>`);
  },

  declineTransfer(offerId){declineTransferOffer(offerId);},
  saveOffer(offerId){saveOfferForLater(offerId);},

  saveGame(){saveGame();},
  loadGame(){
    try{
      const raw=localStorage.getItem('propath3_save');
      if(!raw){showToast('No save found.','warn');return;}
      const s=JSON.parse(raw);
      s.achievements=new Set(s.achievements||[]);
      s.triggeredEvents=new Set(s.triggeredEvents||[]);
      G=s;
      App.goTo(5);
      showToast('✅ Career loaded!','');
      // If game was saved mid season-end (season finished but no new season started), reshow the modal
      if(G.season&&G.season.finished){
        setTimeout(()=>{
          if(G.player.age>=34){UI.showAgeCapModal();}
          else{UI.showSeasonEndModal();}
        },400);
      }
    }catch(e){showToast('❌ Load failed','err');}
  },

  confirmRetirement(){
    closeModal();
    showModal(`
      <div class="modal-title">🏆 Retire to Hall of Fame?</div>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:20px;">Your legend will be immortalised. This career will end and your stats will be preserved forever.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" style="flex:1;" onclick="saveToHOF();closeModal();App.goTo(0);">🏆 Retire Now</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="closeModal();UI.showSeasonEndModal()">↩ Go Back</button>
      </div>`);
  },

  confirmNewCareer(){
    showModal(`
      <div class="modal-title">Start New Career?</div>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:20px;">This will end your current career. Consider retiring to the Hall of Fame first to preserve your legacy.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-danger" style="flex:1;" onclick="saveToHOF();closeModal();App.goTo(0)">🏆 Retire &amp; New Career</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button>
      </div>`);
  },

  showFreeAgentOffers(){UI.showFreeAgentOffers();},
};

// ── Modal helpers ─────────────────────────────────────────────
function showModal(html, isBlocking=false){
  const layer=document.getElementById('modalLayer');
  layer.style.display='flex';
  const blockClick=isBlocking?'':'onclick="closeModal()"';
  layer.innerHTML=`<div class="modal-backdrop" ${blockClick} style="animation:fadeIn .25s ease;"><div class="modal-box modal-box-anim" onclick="event.stopPropagation()">${html}</div></div>`;
}
function closeModal(){
  const layer=document.getElementById('modalLayer');
  layer.style.display='none';layer.innerHTML='';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg,type=''){
  const wrap=document.getElementById('toastWrap');
  if(!wrap)return;
  const t=document.createElement('div');
  t.className=`toast ${type}`;t.textContent=msg;
  wrap.appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},2800);
}

// ── Character Creation ────────────────────────────────────────
function renderCreationStep(){
  document.getElementById('creation-content').innerHTML=creationStep===1?stepIdentityHTML():creationStep===2?stepNationalityHTML():creationStep===3?stepPositionHTML():stepReviewHTML();
  renderStepsBar();
}

function renderStepsBar(){
  const labels=['Identity','Nationality','Position','Review'];
  document.getElementById('steps-bar').innerHTML=labels.map((l,i)=>{
    const n=i+1,cls=n<creationStep?'step done':n===creationStep?'step active':'step';
    return`<div class="${cls}"><div class="step-dot">${n<creationStep?'✓':n}</div><span style="display:none;">${l}</span></div>${i<3?'<div class="step-line"></div>':''}`;
  }).join('');
}

function stepIdentityHTML(){
  return`
    <div class="section-label">Step 1 of 4</div><h2>Who Are You?</h2>
    <p class="lead">Your name and starting age — the first page of your story.</p>
    <div class="form-grid">
      <div class="form-group"><label>First Name</label><input type="text" id="f-firstName" value="${draft.firstName}" placeholder="Marcus" maxlength="20"><span class="field-error" id="err-first">Enter your first name</span></div>
      <div class="form-group"><label>Last Name</label><input type="text" id="f-lastName" value="${draft.lastName}" placeholder="Silva" maxlength="24"><span class="field-error" id="err-last">Enter your last name</span></div>
      <div class="form-group full"><label>Nickname <span style="font-size:10px;color:var(--text-muted);text-transform:none;letter-spacing:0;">(optional)</span></label><input type="text" id="f-nickname" value="${draft.nickname}" placeholder="The Flash" maxlength="20"></div>
      <div class="form-group full">
        <label>Starting Age</label>
        <div class="age-slider-wrap">
          <div class="age-display" id="ageDisplay">${draft.age}</div>
          <div class="age-info">
            <input type="range" id="ageSlider" min="15" max="30" value="${draft.age}" oninput="updateAge(this.value)">
            <div class="range-labels"><span>15 — Youth Academy</span><span>30 — Veteran</span></div>
            <p class="age-desc-text" id="ageDesc">${AGE_DESC[draft.age]||''}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" onclick="App.goTo(0)">← Back</button>
      <button class="btn btn-primary" onclick="step1Next()">Continue →</button>
    </div>`;
}

function stepNationalityHTML(){
  const flags=NATIONS.map(n=>`<div class="nation-btn ${draft.nation===n.name?'selected':''}" onclick="selectNation('${n.name.replace(/'/g,"\\'")}')"><span class="nation-flag">${n.flag}</span><span>${n.name}</span></div>`).join('');
  return`
    <div class="section-label">Step 2 of 4</div><h2>Nationality</h2>
    <p class="lead">Where does your footballer come from?</p>
    <input type="text" id="nationSearch" placeholder="🔍 Search country…" oninput="filterNationsGrid(this.value)" style="margin-bottom:10px;">
    <div class="nations-grid" id="nationsGrid">${flags}</div>
    <span class="field-error" id="err-nation" style="margin-top:6px;">Please select a nationality</span>
    <div class="btn-row">
      <button class="btn btn-secondary" onclick="creationStep=1;renderCreationStep()">← Back</button>
      <button class="btn btn-primary" onclick="step2Next()">Continue →</button>
    </div>`;
}

function stepPositionHTML(){
  return`
    <div class="section-label">Step 3 of 4</div><h2>Position & Style</h2>
    <p class="lead">Your role on the pitch and the archetype that defines your game.</p>
    <div class="field-label">Position</div>
    <div class="position-grid">${POSITIONS.map(p=>`<div class="pos-btn ${draft.position===p.acronym?'selected':''}" onclick="selectPos('${p.acronym}')"><span class="pos-acronym">${p.acronym}</span><span class="pos-name">${p.name}</span></div>`).join('')}</div>
    <span class="field-error" id="err-pos">Please select a position</span>
    <div class="field-label" style="margin-top:18px;">Preferred Foot</div>
    <div style="display:flex;gap:8px;margin-bottom:18px;">${['Right','Left','Both'].map(f=>`<div class="pos-btn ${draft.foot===f?'selected':''}" onclick="selectFoot('${f}')" style="min-width:90px;"><span class="pos-acronym">${f[0]}</span><span class="pos-name">${f} Foot</span></div>`).join('')}</div>
    <div class="field-label">Playing Style</div>
    <div class="trait-grid">${TRAITS.map((t,i)=>`<div class="trait-card ${draft.trait===i?'selected':''}" onclick="selectTrait(${i})"><span class="trait-icon">${t.icon}</span><div class="trait-name">${t.name}</div><div class="trait-desc">${t.desc}</div></div>`).join('')}</div>
    <span class="field-error" id="err-trait">Please pick a playing style</span>
    <div class="btn-row">
      <button class="btn btn-secondary" onclick="creationStep=2;renderCreationStep()">← Back</button>
      <button class="btn btn-primary" onclick="step3Next()">Continue →</button>
    </div>`;
}

function stepReviewHTML(){
  const attrs=E.buildAttrs(draft.position,draft.age,draft.trait);
  const ovr=E.calcOVR(attrs,draft.position);
  const pot=E.calcPotential(ovr,draft.age);
  draft.attrs=attrs;draft.overall=ovr;draft.potential=pot;
  const nat=NATIONS.find(n=>n.name===draft.nation)||{flag:'🌍'};
  const pos=POSITIONS.find(p=>p.acronym===draft.position)||{};
  const trait=TRAITS[draft.trait]||{};
  const startClub=assignStartClub(draft.age,ovr);
  const keys=['pace','shooting','passing','dribbling','defending','physical'];
  const colors=['#00e5a0','#ff6b35','#4a9eff','#f5c842','#a78bfa','#fb7185'];
  const names=['PACE','SHOOTING','PASSING','DRIBBLING','DEFENDING','PHYSICAL'];
  return`
    <div class="section-label">Step 4 of 4 — Review</div><h2>Ready, Player One?</h2>
    <div class="player-card-preview">
      <div class="card-avatar">${nat.flag}</div>
      <div class="card-info">
        <div class="card-name">${draft.firstName.toUpperCase()} ${draft.lastName.toUpperCase()}</div>
        <div class="card-meta">
          <span class="meta-pill pos">${draft.position}</span>
          <span class="meta-pill age">Age ${draft.age}</span>
          <span class="meta-pill nat">${nat.flag} ${draft.nation}</span>
        </div>
      </div>
      <div class="card-rating-box"><div class="rating-num">${ovr}</div><div class="rating-label">OVR</div></div>
    </div>
    <div class="summary-grid">
      ${[['Full Name',`${draft.firstName} ${draft.lastName}`],['Nationality',`${nat.flag} ${draft.nation}`],['Position',`${draft.position} · ${pos.name||''}`],['Style',`${trait.icon||''} ${trait.name||''}`],['Starting Age',`${draft.age}`],['Potential',`${pot} OVR`],['Starting Club',startClub.clubName],['League',startClub.name]].map(([l,v])=>`<div class="summary-item"><div class="s-label">${l}</div><div class="s-value">${v}</div></div>`).join('')}
    </div>
    <div class="field-label">Starting Attributes</div>
    <div class="stat-bars">${keys.map((k,i)=>`<div class="stat-row"><span class="stat-name">${names[i]}</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${attrs[k]}%;background:${colors[i]};"></div></div><span class="stat-val" style="color:${colors[i]};">${attrs[k]}</span></div>`).join('')}</div>
    <div class="btn-row">
      <button class="btn btn-secondary" onclick="creationStep=3;renderCreationStep()">← Edit</button>
      <button class="btn btn-primary" style="font-size:15px;" onclick="beginCareer()">⚽ Begin Career</button>
    </div>`;
}

// Creation helpers
function updateAge(v){draft.age=parseInt(v);document.getElementById('ageDisplay').textContent=v;document.getElementById('ageDesc').textContent=AGE_DESC[v]||'';}
function filterNationsGrid(q){
  const grid=document.getElementById('nationsGrid');if(!grid)return;
  const filtered=NATIONS.filter(n=>n.name.toLowerCase().includes(q.toLowerCase()));
  grid.innerHTML=filtered.map(n=>`<div class="nation-btn ${draft.nation===n.name?'selected':''}" onclick="selectNation('${n.name.replace(/'/g,"\\'")}')"><span class="nation-flag">${n.flag}</span><span>${n.name}</span></div>`).join('');
}
function selectNation(name){draft.nation=name;document.querySelectorAll('.nation-btn').forEach(b=>b.classList.toggle('selected',b.querySelector('span:last-child')?.textContent===name));}
function selectPos(ac){draft.position=ac;document.querySelectorAll('.pos-btn').forEach(b=>b.classList.toggle('selected',b.querySelector('.pos-acronym')?.textContent===ac));}
function selectFoot(f){draft.foot=f;document.querySelectorAll('.pos-btn').forEach(b=>{const pa=b.querySelector('.pos-acronym');if(pa&&['R','L','B'].includes(pa.textContent))b.classList.toggle('selected',pa.textContent===f[0]);});}
function selectTrait(i){draft.trait=i;document.querySelectorAll('.trait-card').forEach((c,idx)=>c.classList.toggle('selected',idx===i));}

function step1Next(){
  draft.firstName=document.getElementById('f-firstName')?.value.trim()||'';
  draft.lastName=document.getElementById('f-lastName')?.value.trim()||'';
  draft.nickname=document.getElementById('f-nickname')?.value.trim()||'';
  let ok=true;
  if(!draft.firstName){document.getElementById('err-first')?.classList.add('show');ok=false;}else document.getElementById('err-first')?.classList.remove('show');
  if(!draft.lastName){document.getElementById('err-last')?.classList.add('show');ok=false;}else document.getElementById('err-last')?.classList.remove('show');
  if(ok){creationStep=2;renderCreationStep();}
}
function step2Next(){
  if(!draft.nation){document.getElementById('err-nation')?.classList.add('show');return;}
  creationStep=3;renderCreationStep();
}
function step3Next(){
  let ok=true;
  if(!draft.position){document.getElementById('err-pos')?.classList.add('show');ok=false;}else document.getElementById('err-pos')?.classList.remove('show');
  if(draft.trait===null){document.getElementById('err-trait')?.classList.add('show');ok=false;}else document.getElementById('err-trait')?.classList.remove('show');
  if(ok){creationStep=4;renderCreationStep();}
}
function beginCareer(){initGame(draft);App.goTo(5);}
