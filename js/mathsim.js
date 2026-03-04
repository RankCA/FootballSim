// ═══════════════════════════════════════════════════════════
//  ProPath — matchsim.js  v3
//  Top-down possession-based match visualiser.
//
//  DESIGN:
//  • Ball passes between static player tokens (snaps to holder)
//  • Possession triggers whole-team shape shift: attackers push
//    forward, defenders drop deep — lerped smoothly
//  • Every pass has an interception chance based on defender
//    proximity to the pass lane midpoint + OVR skill delta
//  • Match result generated LIVE by this engine; state.js stats
//    are computed afterwards using the live hg/ag scoreline
//  • Halftime loop fix: _minute only advances in 'play' phase
//  • Club colours + formations pulled from clubs.js CLUB_DATA
// ═══════════════════════════════════════════════════════════

const MatchSim = (() => {

  // ── Timing ──────────────────────────────────────────────────
  // 60 real seconds = 90 game minutes (fast but watchable)
  const REAL_S          = 60;
  const TICKS_PER_S     = 20;
  const TICK_MS         = 1000 / TICKS_PER_S;      // 50ms
  const TOTAL_PLAY_TICKS= REAL_S * TICKS_PER_S;    // 1200 ticks
  const MIN_PER_TICK    = 90 / TOTAL_PLAY_TICKS;   // 0.075 min/tick

  const KICKOFF_TICKS   = 25;
  const HALFTIME_TICKS  = 70;   // ~3.5s pause
  const GOAL_TICKS      = 55;   // ~2.75s celebration pause
  const PASS_MIN_TICKS  = 5;
  const PASS_MAX_TICKS  = 16;

  // ── Pitch geometry ─────────────────────────────────────────
  const PW = 680, PH = 400;
  const PAD = 36;
  const HUD_H = 50;
  const CMT_H = 80;   // commentary strip height below pitch
  const CW = PW + PAD * 2;
  const CH = PH + PAD * 2 + HUD_H + CMT_H;

  const GOAL_H  = 68, GOAL_D = 14;
  const PE_W = 110, PE_H = 220;
  const SB_W = 42,  SB_H = 110;
  const PSPOT_X = 82;

  // ── Colours ────────────────────────────────────────────────
  const PITCH_D   = '#1a3a1a';
  const PITCH_L   = '#1e4422';
  const LINE_C    = 'rgba(255,255,255,0.58)';
  const BALL_C    = '#ffffff';
  const PLAYER_HL = '#00e5a0';
  const HUD_BG    = 'rgba(5,9,15,0.96)';
  const CMT_BG    = 'rgba(5,9,15,0.91)';

  // ── State ───────────────────────────────────────────────────
  let _canvas, _ctx, _overlay;
  let _raf = null;
  let _running = false;

  let _homeName, _awayName, _homeBadgeImg, _awayBadgeImg;
  let _homeOVR,  _awayOVR;
  let _homeFmt,  _awayFmt;
  let _homeCol,  _awayCol;   // primary hex
  let _isPlayerHome;
  let _playerPos;
  let _onFinish;             // callback(hg, ag)

  // Positions: each player is {bx,by,cx,cy,num,isMe}
  // bx/by = base (formation) pitch coords, lerp from cx/cy
  let _home, _away;

  // Ball: always at holder's current position
  let _bx = PW/2, _by = PH/2;

  // Match state
  let _minute    = 0;
  let _phase     = 'kickoff';   // kickoff|play|halftime|goal|fulltime
  let _pauseTick = 0;
  let _hg = 0, _ag = 0;
  let _poss   = 'home';        // 'home'|'away'
  let _holder = 0;             // index in possessing team array
  let _passTimer = 0;
  let _htFired = false;        // halftime sentinel

  // Commentary
  let _cmts  = [];  // [{min,text}] newest first
  let _drip  = [];  // scheduled [{min,text,fired}]

  // Visual
  let _flashAlpha = 0;
  let _flashIsHome = true;
  let _ballTrail  = [];  // [{x,y,a}] last few ball positions for trail

  // Ball animation: smooth travel between players / shots on goal
  // _ballAnim.active prevents _snapBall() from overriding position mid-flight
  let _ballAnim = {
    active: false,
    sx:0, sy:0,    // start
    tx:0, ty:0,    // target (player or goal mouth)
    t:0,           // progress 0→1
    speed: 0.18,   // fraction of distance covered per tick (pass)
    isShot: false,
    shotIsGoal: false,
    onArrive: null, // callback when ball reaches destination
  };

  // ── Public API ──────────────────────────────────────────────
  return {

    show(homeName, awayName, homeOVR, awayOVR,
         homeFmt, awayFmt, homeCol, awayCol,
         isPlayerHome, playerPos, onFinish) {

      if (_running) return;

      _homeName = homeName; _awayName = awayName;
    // Preload club badge images for HUD display
    if(typeof getClubBadgeUrl==='function'){
      _homeBadgeImg=new Image();_homeBadgeImg.src=getClubBadgeUrl(homeName);
      _awayBadgeImg=new Image();_awayBadgeImg.src=getClubBadgeUrl(awayName);
    }
      _homeOVR  = homeOVR;  _awayOVR  = awayOVR;
      _homeFmt  = homeFmt || '4-4-2';
      _awayFmt  = awayFmt || '4-4-2';
      _homeCol  = homeCol || '#4a9eff';
      _awayCol  = awayCol || '#ff4757';
      _isPlayerHome = isPlayerHome;
      _playerPos    = playerPos;
      _onFinish     = onFinish;

      // Reset
      _minute=0; _hg=0; _ag=0; _htFired=false;
      _phase='kickoff'; _pauseTick=KICKOFF_TICKS;
      _cmts=[]; _flashAlpha=0; _ballTrail=[];
      _ballAnim={active:false,sx:0,sy:0,tx:0,ty:0,t:0,speed:0.18,isShot:false,shotIsGoal:false,onArrive:null};

      _buildDrip();
      _initTeams();
      _bx=PW/2; _by=PH/2;
      _poss='home'; _holder=_attackerIdx('home');
      _snapBall();
      _passTimer = PASS_MIN_TICKS + 3;

      _mount();
      _running = true;
      _lockUI(true);

      // Accumulator: guarantees ticks fire at the correct rate regardless of fps
      let last = performance.now();
      let accum = 0;
      function frame(now) {
        if (!_running) return;
        accum += now - last; last = now;
        // Drain in fixed TICK_MS steps (cap at 5 to avoid spiral-of-death)
        let steps = 0;
        while (accum >= TICK_MS && steps < 5) {
          accum -= TICK_MS;
          _tick();
          steps++;
        }
        _draw();
        _raf = requestAnimationFrame(frame);
      }
      _raf = requestAnimationFrame(now => { last=now; accum=0; _raf=requestAnimationFrame(frame); });
    },

    // Skip: generate a proper OVR-based result instead of reporting the live 0-0
    skip() {
      if (!_running) return;
      const sd = (_homeOVR - _awayOVR) / 100;
      _hg = Math.random()<(0.55+sd+0.06) ? Math.floor(Math.random()*4) : Math.floor(Math.random()*2);
      _ag = Math.random()<(0.50-sd)       ? Math.floor(Math.random()*4) : Math.floor(Math.random()*2);
      _running = false;
      if (_raf) { cancelAnimationFrame(_raf); _raf=null; }
      _lockUI(false);
      _unmount();
      if (_onFinish) _onFinish(_hg, _ag);
    },

    close() {
      if (!_running) return;
      _running = false;
      if (_raf) { cancelAnimationFrame(_raf); _raf=null; }
      _lockUI(false);
      _unmount();
      if (_onFinish) _onFinish(_hg, _ag);
    },
  };

  // ─────────────────────────────────────────────────────────────
  //  INITIALISATION
  // ─────────────────────────────────────────────────────────────

  function _initTeams() {
    const hPts = _getFormPts(_homeFmt, false);
    const aPts = _getFormPts(_awayFmt, true);
    const pShirt = _posToIdx(_playerPos);

    _home = hPts.map((p,i) => ({
      bx:p.x*PW, by:p.y*PH, cx:p.x*PW, cy:p.y*PH,
      num:i+1, isMe:_isPlayerHome && i===pShirt,
    }));
    _away = aPts.map((p,i) => ({
      bx:p.x*PW, by:p.y*PH, cx:p.x*PW, cy:p.y*PH,
      num:i+1, isMe:!_isPlayerHome && i===pShirt,
    }));
  }

  // Returns formation positions, mirrored for away team
  function _getFormPts(fmt, mirror) {
    const F = {
      '4-4-2':[
        {x:.06,y:.50},
        {x:.23,y:.15},{x:.23,y:.38},{x:.23,y:.62},{x:.23,y:.85},
        {x:.48,y:.15},{x:.48,y:.38},{x:.48,y:.62},{x:.48,y:.85},
        {x:.73,y:.35},{x:.73,y:.65},
      ],
      '4-3-3':[
        {x:.06,y:.50},
        {x:.23,y:.15},{x:.23,y:.38},{x:.23,y:.62},{x:.23,y:.85},
        {x:.46,y:.27},{x:.46,y:.50},{x:.46,y:.73},
        {x:.71,y:.14},{x:.71,y:.50},{x:.71,y:.86},
      ],
      '4-2-3-1':[
        {x:.06,y:.50},
        {x:.22,y:.15},{x:.22,y:.38},{x:.22,y:.62},{x:.22,y:.85},
        {x:.40,y:.35},{x:.40,y:.65},
        {x:.57,y:.14},{x:.57,y:.50},{x:.57,y:.86},
        {x:.75,y:.50},
      ],
      '3-5-2':[
        {x:.06,y:.50},
        {x:.24,y:.25},{x:.24,y:.50},{x:.24,y:.75},
        {x:.42,y:.09},{x:.42,y:.30},{x:.42,y:.50},{x:.42,y:.70},{x:.42,y:.91},
        {x:.71,y:.35},{x:.71,y:.65},
      ],
      '5-3-2':[
        {x:.06,y:.50},
        {x:.21,y:.09},{x:.21,y:.28},{x:.21,y:.50},{x:.21,y:.72},{x:.21,y:.91},
        {x:.46,y:.27},{x:.46,y:.50},{x:.46,y:.73},
        {x:.71,y:.35},{x:.71,y:.65},
      ],
    };
    const pts = (F[fmt] || F['4-4-2']).map(p=>({...p}));
    if (mirror) pts.forEach(p => p.x = 1-p.x);
    return pts;
  }

  function _posToIdx(pos) {
    const m={GK:0,CB:2,LB:4,RB:1,CDM:5,CM:6,CAM:9,LW:8,RW:10,CF:10,ST:9};
    return m[pos] ?? 6;
  }

  function _attackerIdx(side) {
    // Return index of a striker-ish player for kickoff
    return side==='home' ? 10 : 10;
  }

  // ─────────────────────────────────────────────────────────────
  //  COMMENTARY SCHEDULE
  // ─────────────────────────────────────────────────────────────

  function _buildDrip() {
    const h=_homeName, a=_awayName;
    _drip = [
      {min:1,  text:`⚽ Kick off! ${h} vs ${a}`, fired:false},
      {min:9,  text:_rnd(['Early pressure — both sides probing.',
                          'Good energy from the home side.',
                          'Slow start — midfield battle taking shape.',
                          'The game is very open early on.']), fired:false},
      {min:22, text:_rnd(['A chance goes begging!',
                          'Midfield pressing hard for second balls.',
                          'The keeper called into action!',
                          'Beautiful combination play — just wide!']), fired:false},
      {min:35, text:_rnd(['We are approaching the break.',
                          'Referee checks his watch.',
                          'Neither side giving an inch.',
                          'A nervy spell before half time.']), fired:false},
      {min:47, text:'🔔 Second half — here we go!', fired:false},
      {min:58, text:_rnd(['Tempo picking up after the restart.',
                          'The manager makes a tactical switch.',
                          'End-to-end stuff now!',
                          'Both sides smelling a chance.']), fired:false},
      {min:74, text:_rnd(['Legs beginning to tire.',
                          'The benches are very restless.',
                          'A crucial period — who wants it more?',
                          'Substitute warming up on the touchline.']), fired:false},
      {min:86, text:_rnd(['Board shows 4 added minutes!',
                          'Almost there… drama still possible.',
                          'Hanging on — or hunting a winner?']), fired:false},
    ];
  }

  // ─────────────────────────────────────────────────────────────
  //  CORE TICK  (called TICKS_PER_S times per real second)
  // ─────────────────────────────────────────────────────────────

  function _tick() {
    if (_phase==='fulltime') return;

    // ── Paused phases: count down, do NOT advance _minute ──────
    if (_phase!=='play') {
      _pauseTick--;
      if (_flashAlpha>0) _flashAlpha = Math.max(0, _flashAlpha-0.04);

      if (_pauseTick<=0) {
        if (_phase==='kickoff') {
          _phase='play';
          _addCmt(0, _drip[0].text); _drip[0].fired=true;
        } else if (_phase==='halftime') {
          _phase='play';
          _addCmt(45,'🔔 Second half — here we go!');
          // Mark the 47' drip as fired so it doesn't double-fire
          const d47=_drip.find(d=>d.min===47); if(d47) d47.fired=true;
          // Reset positions to default (no shape-shift between halves)
          _resetShapes();
        } else if (_phase==='goal') {
          _phase='play';
          _kickOff();
        }
      }
      return;
    }

    // ── Advance game clock (ONLY in 'play') ───────────────────
    _minute = Math.min(90, _minute + MIN_PER_TICK);

    // ── Halftime trigger ──────────────────────────────────────
    if (_minute>=45 && !_htFired) {
      _htFired = true;
      _phase='halftime'; _pauseTick=HALFTIME_TICKS;
      _addCmt(45,'🔔 Half Time');
      _flashAlpha=0.18; _flashIsHome=true;
      return;
    }

    // ── Fulltime ─────────────────────────────────────────────
    if (_minute>=90) {
      _phase='fulltime';
      _addCmt(90,`⏱ Full Time! ${_homeName} ${_hg}–${_ag} ${_awayName}`);
      return;
    }

    // ── Commentary drip ───────────────────────────────────────
    for (const d of _drip) {
      if (!d.fired && _minute>=d.min) {
        d.fired=true;
        // Only add if it wasn't already injected by a phase transition
        if (d.min!==1 && d.min!==47) _addCmt(Math.floor(_minute), d.text);
      }
    }

    // ── Flash decay ───────────────────────────────────────────
    if (_flashAlpha>0) _flashAlpha=Math.max(0,_flashAlpha-0.025);

    // ── Shape shift: whole team moves forward/back ────────────
    _shiftShapes();

    // ── Ball pass timer ───────────────────────────────────────
    _passTimer--;
    if (_passTimer<=0) {
      _passTimer = PASS_MIN_TICKS + Math.floor(Math.random()*(PASS_MAX_TICKS-PASS_MIN_TICKS));
      _doAction();
    }

    // Advance ball animation
    if (_ballAnim.active) {
      _ballAnim.t = Math.min(1, _ballAnim.t + _ballAnim.speed);
      // Ease-out: fast start, smooth finish
      const ease = 1 - Math.pow(1 - _ballAnim.t, 2);
      _bx = _ballAnim.sx + (_ballAnim.tx - _ballAnim.sx) * ease;
      _by = _ballAnim.sy + (_ballAnim.ty - _ballAnim.sy) * ease;
      if (_ballAnim.t >= 1) {
        _ballAnim.active = false;
        if (_ballAnim.onArrive) { _ballAnim.onArrive(); _ballAnim.onArrive=null; }
      }
    } else {
      _snapBall();
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  SHAPE SHIFTING
  // ─────────────────────────────────────────────────────────────

  function _shiftShapes() {
    const ATK_PUSH = 0.13 * PW;   // px forward shift when attacking
    const DEF_DROP = 0.10 * PW;   // px backward shift when defending
    const LERP = 0.055;

    // Home: attacks toward x=PW (right)
    const homeAtk = _poss==='home';
    _home.forEach((p,i)=>{
      if(i===0) return; // GK fixed
      const tx = p.bx + (homeAtk ? ATK_PUSH : -DEF_DROP);
      p.cx += (Math.max(8,Math.min(PW-8,tx)) - p.cx) * LERP;
      p.cy += (p.by - p.cy) * LERP;
    });

    // Away: attacks toward x=0 (left)
    const awayAtk = _poss==='away';
    _away.forEach((p,i)=>{
      if(i===0) return;
      const tx = p.bx + (awayAtk ? -ATK_PUSH : DEF_DROP);
      p.cx += (Math.max(8,Math.min(PW-8,tx)) - p.cx) * LERP;
      p.cy += (p.by - p.cy) * LERP;
    });
  }

  function _resetShapes() {
    _home.forEach(p=>{ p.cx=p.bx; p.cy=p.by; });
    _away.forEach(p=>{ p.cx=p.bx; p.cy=p.by; });
  }

  // ─────────────────────────────────────────────────────────────
  //  BALL / PASS / SHOT LOGIC
  // ─────────────────────────────────────────────────────────────

  function _snapBall() {
    const arr = _poss==='home' ? _home : _away;
    const p = arr[_holder];
    if (p) { _bx=p.cx; _by=p.cy; }
  }

  function _doAction() {
    const myOVR  = _poss==='home' ? _homeOVR : _awayOVR;
    const oppOVR = _poss==='home' ? _awayOVR : _homeOVR;
    const arr    = _poss==='home' ? _home : _away;
    const oArr   = _poss==='home' ? _away : _home;
    const holder = arr[_holder];
    if(!holder) return;

    // Is this player an attacker?  (last 2 in our array = attackers)
    const isAttacker = _holder >= arr.length-2;
    // Is the holder in the attacking third?
    const inAtkThird = _poss==='home' ? holder.cx > PW*0.60 : holder.cx < PW*0.40;

    // Shoot if attacker in dangerous area
    if (isAttacker && inAtkThird && Math.random()<0.42) {
      _shoot(myOVR, oppOVR);
      return;
    }

    // Otherwise: pass to a teammate
    _pass(arr, oArr, myOVR, oppOVR);
  }

  function _pass(arr, oArr, myOVR, oppOVR) {
    const holder = arr[_holder];
    // Build pass candidates: not GK (idx 0), not self, prefer forward
    const fwdDir = _poss==='home' ? 1 : -1;
    const cands = arr
      .map((p,i)=>({p,i}))
      .filter(({i})=>i!==0&&i!==_holder)
      .sort((a,b)=>fwdDir*(b.p.cx-a.p.cx))
      .slice(0,4);

    if (!cands.length) return;
    const {p:target, i:tIdx} = cands[Math.floor(Math.random()*cands.length)];

    // Interception check
    const stolen = _intercept(holder, target, oArr, myOVR, oppOVR);
    if (stolen!==null) {
      // Animate ball to midpoint (interception point) then snap to defender
      const mx=(holder.cx+target.cx)/2, my=(holder.cy+target.cy)/2;
      _ballAnim = { active:true, sx:_bx, sy:_by, tx:mx, ty:my, t:0, speed:0.25, isShot:false, shotIsGoal:false,
        onArrive:()=>{
          _poss = _poss==='home' ? 'away' : 'home';
          _holder = stolen;
          _snapBall();
        }
      };
      _addCmt(Math.floor(_minute), _rnd([
        '🔀 Turnover in midfield!','⚡ Ball won back brilliantly!',
        '🛡 Great interception!','🔵 Possession lost!',
      ]));
      _passTimer = PASS_MIN_TICKS+4;
    } else {
      // Animate ball from holder to target player
      _ballAnim = { active:true, sx:_bx, sy:_by, tx:target.cx, ty:target.cy, t:0, speed:0.20, isShot:false, shotIsGoal:false,
        onArrive:()=>{ _holder = tIdx; _snapBall(); }
      };
    }
  }

  function _intercept(from, to, oArr, myOVR, oppOVR) {
    // Midpoint of the pass lane
    const mx=(from.cx+to.cx)/2, my=(from.cy+to.cy)/2;
    let nearI=null, nearD=Infinity;
    oArr.forEach((p,i)=>{
      const d=Math.hypot(p.cx-mx, p.cy-my);
      if(d<nearD){nearD=d;nearI=i;}
    });
    if(nearI===null) return null;
    // Probability: closer defender + stronger opposition = higher
    const distP  = Math.max(0, 1-nearD/(PW*0.28));
    const skillP = (oppOVR-myOVR)/80;
    const prob   = 0.06 + distP*0.28 + skillP*0.10;
    return Math.random()<prob ? nearI : null;
  }

  function _shoot(myOVR, oppOVR) {
    const skillAdv = (myOVR-oppOVR)/100;
    const prob = 0.20 + skillAdv*0.22 + (Math.random()*0.10);
    const isGoal = Math.random() < prob;
    const isHome = _poss==='home';

    // Goal mouth position (centre of goal on opponent side)
    const goalX = isHome ? PW + GOAL_D/2 : -GOAL_D/2;
    const goalY = PH / 2 + E_rand(-20, 20);

    // Miss: ball flies wide/high — aim off-centre
    const missX = isHome ? PW + GOAL_D + 20 : -GOAL_D - 20;
    const missY = PH/2 + E_rand(-PH*0.3, PH*0.3);

    const tx = isGoal ? goalX : missX;
    const ty = isGoal ? goalY : missY;
    const min = Math.floor(_minute);

    _ballAnim = {
      active: true,
      sx: _bx, sy: _by,
      tx, ty,
      t: 0,
      speed: 0.14,   // shots travel slightly slower so you can see them arc
      isShot: true,
      shotIsGoal: isGoal,
      onArrive: () => {
        if (isGoal) {
          if(isHome) _hg++; else _ag++;
          const teamName = isHome ? _homeName : _awayName;
          _addCmt(min, `⚽ GOAL! ${teamName}! ${_hg}–${_ag}`);
          _flashAlpha=0.80; _flashIsHome=isHome;
          _phase='goal'; _pauseTick=GOAL_TICKS;
        } else {
          _addCmt(min, _rnd([
            '🧤 Great save!','📯 Off the post!','😤 Over the bar!',
            '🔵 Blocked!','🧤 Keeper gathers safely.',
          ]));
          _poss = isHome ? 'away' : 'home';
          _holder = 0;
          _snapBall();
          _passTimer = PASS_MIN_TICKS+5;
        }
      }
    };
  }

  // Tiny helper — can't use E.rand inside MatchSim IIFE (E is global but let's inline for safety)
  function E_rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}

  function _kickOff() {
    _bx=PW/2; _by=PH/2;
    // Conceding team kicks off
    _poss = _hg>_ag ? 'away' : (_ag>_hg ? 'home' : (_poss==='home'?'away':'home'));
    _holder = _attackerIdx(_poss);
    _snapBall();
    _passTimer = PASS_MIN_TICKS+2;
  }

  // ─────────────────────────────────────────────────────────────
  //  DRAWING
  // ─────────────────────────────────────────────────────────────

  function _draw() {
    if(!_ctx) return;
    const ctx=_ctx, W=CW, H=CH;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#04080e'; ctx.fillRect(0,0,W,H);

    // Draw HUD at top
    _drawHUD(ctx, W);

    // Pitch is below HUD
    ctx.save();
    ctx.translate(PAD, HUD_H+PAD);

    _drawPitch(ctx);
    _drawFormLabels(ctx);

    // Goal flash
    if(_flashAlpha>0.005){
      ctx.save();
      ctx.globalAlpha=_flashAlpha*0.30;
      ctx.fillStyle=_flashIsHome ? _homeCol : _awayCol;
      ctx.fillRect(0,0,PW,PH);
      ctx.restore();
    }

    _drawPlayers(ctx);
    _drawBall(ctx);

    ctx.restore();

    // Commentary strip — below the pitch, full width, not obscuring play
    _drawCommentaryStrip(ctx, CW, HUD_H + PH + PAD*2);

    // Overlay (halftime, goal, fulltime)
    if(_phase==='halftime')  _drawBigText(ctx,'HALF TIME',`${_hg} – ${_ag}`,W,H);
    if(_phase==='goal' && _flashAlpha>0.25) _drawBigText(ctx,'GOAL!',`${_hg} – ${_ag}`,W,H);
    if(_phase==='fulltime'){
      _drawBigText(ctx,'FULL TIME',`${_hg} – ${_ag}`,W,H);
      _drawFTBtn(ctx,W,H);
    }
  }

  function _drawPitch(ctx) {
    const sw=PW/8;
    for(let i=0;i<8;i++){
      ctx.fillStyle=i%2===0?PITCH_D:PITCH_L;
      ctx.fillRect(i*sw,0,sw,PH);
    }
    ctx.save();
    ctx.strokeStyle=LINE_C; ctx.lineWidth=1.5;
    ctx.strokeRect(0,0,PW,PH);
    // Halfway
    ctx.beginPath();ctx.moveTo(PW/2,0);ctx.lineTo(PW/2,PH);ctx.stroke();
    // Centre circle + spot
    ctx.beginPath();ctx.arc(PW/2,PH/2,55,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(PW/2,PH/2,3,0,Math.PI*2);ctx.fillStyle=LINE_C;ctx.fill();
    // Penalty areas
    ctx.strokeRect(0,(PH-PE_H)/2,PE_W,PE_H);
    ctx.strokeRect(PW-PE_W,(PH-PE_H)/2,PE_W,PE_H);
    // 6-yard boxes
    ctx.strokeRect(0,(PH-SB_H)/2,SB_W,SB_H);
    ctx.strokeRect(PW-SB_W,(PH-SB_H)/2,SB_W,SB_H);
    // Penalty spots
    ctx.beginPath();ctx.arc(PSPOT_X,PH/2,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(PW-PSPOT_X,PH/2,3,0,Math.PI*2);ctx.fill();
    // Corner arcs
    ctx.lineWidth=1;
    [[0,0,0],[PW,0,Math.PI/2],[0,PH,-Math.PI/2],[PW,PH,Math.PI]].forEach(([cx,cy,sa])=>{
      ctx.beginPath();ctx.arc(cx,cy,10,sa,sa+Math.PI/2);ctx.stroke();
    });
    // Goals (outside pitch)
    ctx.lineWidth=3; ctx.strokeStyle='rgba(255,255,255,0.88)';
    ctx.strokeRect(-GOAL_D,(PH-GOAL_H)/2,GOAL_D,GOAL_H);
    ctx.strokeRect(PW,(PH-GOAL_H)/2,GOAL_D,GOAL_H);
    ctx.restore();
  }

  function _drawFormLabels(ctx) {
    ctx.save();
    ctx.font="bold 11px 'DM Mono',monospace"; ctx.textBaseline='bottom';
    ctx.fillStyle=_homeCol; ctx.textAlign='left';
    ctx.fillText(_homeFmt, 6, PH-4);
    ctx.fillStyle=_awayCol; ctx.textAlign='right';
    ctx.fillText(_awayFmt, PW-6, PH-4);
    ctx.restore();
  }

  function _drawPlayers(ctx) {
    _home.forEach((p,i)=>{
      const hasBall=_poss==='home'&&_holder===i;
      _drawToken(ctx, p.cx, p.cy, p.num, _homeCol, p.isMe, hasBall);
    });
    _away.forEach((p,i)=>{
      const hasBall=_poss==='away'&&_holder===i;
      _drawToken(ctx, p.cx, p.cy, p.num, _awayCol, p.isMe, hasBall);
    });
  }

  function _drawToken(ctx, x, y, num, col, isMe, hasBall) {
    const r=isMe?12:10;
    ctx.save();
    if(isMe){ ctx.shadowColor=PLAYER_HL; ctx.shadowBlur=16; }
    else if(hasBall){ ctx.shadowColor='#fff'; ctx.shadowBlur=10; }
    // Drop shadow
    ctx.beginPath();ctx.arc(x+1.5,y+2,r,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.42)';ctx.fill();
    // Body
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=isMe?PLAYER_HL:col; ctx.fill();
    ctx.strokeStyle=isMe?'#005533':_darken(col,0.55);
    ctx.lineWidth=hasBall?2.5:1.5; ctx.stroke();
    // Number
    ctx.shadowBlur=0;
    ctx.font=`bold ${isMe?9:8}px 'DM Mono',monospace`;
    ctx.fillStyle=isMe?'#040d08':'#ffffff';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(num, x, y+0.5);
    ctx.restore();
  }

  function _drawBall(ctx) {
    ctx.save();
    ctx.beginPath();ctx.ellipse(_bx+2,_by+3,7,4,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.38)';ctx.fill();
    ctx.beginPath();ctx.arc(_bx,_by,6,0,Math.PI*2);
    ctx.fillStyle=BALL_C;ctx.fill();
    ctx.strokeStyle='#aaa';ctx.lineWidth=0.5;ctx.stroke();
    ctx.beginPath();ctx.arc(_bx,_by,2.5,0,Math.PI*2);
    ctx.fillStyle='#ddd';ctx.fill();
    ctx.restore();
  }

  function _drawCommentaryStrip(ctx, W, stripY) {
    ctx.save();
    // Dark strip background
    ctx.fillStyle='rgba(5,9,15,0.96)';
    ctx.fillRect(0, stripY, W, CMT_H);
    // Thin separator line
    ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,stripY);ctx.lineTo(W,stripY);ctx.stroke();
    // Label
    ctx.font="bold 9px 'DM Mono',monospace";
    ctx.fillStyle='rgba(255,255,255,0.28)';
    ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText('COMMENTARY', 14, stripY+8);
    // Entries — horizontal scrolling layout, show last 4
    const entries=_cmts.slice(0,4);
    entries.forEach((c,i)=>{
      ctx.globalAlpha=Math.max(0.15, 1-i*0.22);
      const rowY=stripY+22+i*14;
      ctx.font="bold 9px 'DM Mono',monospace";
      ctx.fillStyle='#f5c842';ctx.textAlign='left';
      ctx.fillText(`${c.min}'`, 14, rowY);
      ctx.font="10px 'DM Sans',sans-serif";
      ctx.fillStyle='#d8e0ea';
      const maxLen=Math.floor((W-60)/6.5);
      const t=c.text.length>maxLen?c.text.slice(0,maxLen-1)+'…':c.text;
      ctx.fillText(t, 46, rowY);
    });
    ctx.globalAlpha=1;ctx.restore();
  }

  function _drawHUD(ctx, W) {
    ctx.save();
    ctx.fillStyle=HUD_BG; ctx.fillRect(0,0,W,HUD_H);
    // Home badge + name
    const badgeSize=20,badgePad=4;
    try{if(_homeBadgeImg&&_homeBadgeImg.complete&&_homeBadgeImg.naturalWidth>0){ctx.drawImage(_homeBadgeImg,badgePad,HUD_H/2-badgeSize/2,badgeSize,badgeSize);}else{ctx.beginPath();ctx.arc(16,HUD_H/2,7,0,Math.PI*2);ctx.fillStyle=_homeCol;ctx.fill();}}catch(e){ctx.beginPath();ctx.arc(16,HUD_H/2,7,0,Math.PI*2);ctx.fillStyle=_homeCol;ctx.fill();}
    ctx.font="bold 13px 'DM Sans',sans-serif";
    ctx.fillStyle='#e8edf2';ctx.textAlign='left';ctx.textBaseline='middle';
    const hn=_homeName.length>22?_homeName.slice(0,20)+'…':_homeName;
    ctx.fillText(hn,badgePad+badgeSize+4,HUD_H/2);
    // Score
    ctx.font="bold 26px 'Bebas Neue',sans-serif";
    ctx.fillStyle='#ffffff';ctx.textAlign='center';
    ctx.fillText(`${_hg}  –  ${_ag}`,W/2,HUD_H/2+2);
    // Minute
    const mStr=_phase==='fulltime'?'FT':_phase==='halftime'?'HT':`${Math.min(90,Math.floor(_minute))}'`;
    ctx.font="bold 10px 'DM Mono',monospace";
    ctx.fillStyle=(_phase==='fulltime'||_phase==='halftime')?'#f5c842':'#00e5a0';
    ctx.fillText(mStr,W/2,HUD_H-10);
    // Away badge + name
    try{if(_awayBadgeImg&&_awayBadgeImg.complete&&_awayBadgeImg.naturalWidth>0){ctx.drawImage(_awayBadgeImg,W-badgePad-badgeSize,HUD_H/2-badgeSize/2,badgeSize,badgeSize);}else{ctx.beginPath();ctx.arc(W-16,HUD_H/2,7,0,Math.PI*2);ctx.fillStyle=_awayCol;ctx.fill();}}catch(e){ctx.beginPath();ctx.arc(W-16,HUD_H/2,7,0,Math.PI*2);ctx.fillStyle=_awayCol;ctx.fill();}
    ctx.font="bold 13px 'DM Sans',sans-serif";
    ctx.fillStyle='#e8edf2';ctx.textAlign='right';
    const an=_awayName.length>22?_awayName.slice(0,20)+'…':_awayName;
    ctx.fillText(an,W-badgePad-badgeSize-4,HUD_H/2);
    ctx.restore();
  }

  function _drawBigText(ctx, line1, line2, W, H) {
    const midY=H/2+10;
    ctx.save();
    ctx.fillStyle='rgba(4,8,14,0.80)';ctx.fillRect(0,midY-54,W,108);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font="bold 48px 'Bebas Neue',sans-serif";
    ctx.fillStyle='#f5c842';ctx.fillText(line1,W/2,midY-14);
    ctx.font="bold 30px 'Bebas Neue',sans-serif";
    ctx.fillStyle='#ffffff';ctx.fillText(line2,W/2,midY+26);
    ctx.restore();
  }

  function _drawFTBtn(ctx, W, H) {
    const bW=220,bH=40,bX=W/2-110,bY=H/2+68;
    ctx.save();
    ctx.fillStyle='#00e5a0';_rRect(ctx,bX,bY,bW,bH,9);ctx.fill();
    ctx.font="bold 14px 'DM Sans',sans-serif";
    ctx.fillStyle='#040d08';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('See Full Time Result →',W/2,bY+bH/2);
    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────
  //  MOUNT / UNMOUNT
  // ─────────────────────────────────────────────────────────────

  function _mount() {
    // roundRect polyfill
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
        r=Math.min(r,w/2,h/2);
        this.beginPath();
        this.moveTo(x+r,y);this.lineTo(x+w-r,y);
        this.quadraticCurveTo(x+w,y,x+w,y+r);
        this.lineTo(x+w,y+h-r);
        this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        this.lineTo(x+r,y+h);
        this.quadraticCurveTo(x,y+h,x,y+h-r);
        this.lineTo(x,y+r);
        this.quadraticCurveTo(x,y,x+r,y);
        this.closePath();
      };
    }

    if (!document.getElementById('_msimStyle')) {
      const s=document.createElement('style');
      s.id='_msimStyle';
      s.textContent='@keyframes _msfI{from{opacity:0}to{opacity:1}}#matchSimOverlay{animation:_msfI .25s ease;}';
      document.head.appendChild(s);
    }

    _overlay=document.createElement('div');
    _overlay.id='matchSimOverlay';
    _overlay.style.cssText=
      'position:fixed;inset:0;z-index:9999;background:#04080e;'+
      'display:flex;flex-direction:column;align-items:center;justify-content:center;';

    _canvas=document.createElement('canvas');
    _canvas.width=CW; _canvas.height=CH;
    _canvas.style.cssText=
      'max-width:97vw;max-height:calc(97vh - 32px);display:block;border-radius:10px;'+
      'box-shadow:0 0 40px rgba(0,229,160,0.10),0 16px 48px rgba(0,0,0,0.75);';

    // FT button click
    _canvas.addEventListener('click',e=>{
      if(_phase!=='fulltime') return;
      const r=_canvas.getBoundingClientRect();
      const sx=_canvas.width/r.width, sy=_canvas.height/r.height;
      const cx=(e.clientX-r.left)*sx, cy=(e.clientY-r.top)*sy;
      const bW=220,bH=40,bX=CW/2-110,bY=CH/2+68;
      if(cx>=bX&&cx<=bX+bW&&cy>=bY&&cy<=bY+bH) MatchSim.close();
    });

    // Skip button
    const sk=document.createElement('div');
    sk.textContent='Skip ⏩';
    sk.style.cssText=
      'margin-top:8px;font-size:11px;color:rgba(255,255,255,0.22);'+
      'cursor:pointer;font-family:"DM Mono",monospace;letter-spacing:2px;transition:color .2s;';
    sk.onmouseenter=()=>sk.style.color='rgba(255,255,255,0.65)';
    sk.onmouseleave=()=>sk.style.color='rgba(255,255,255,0.22)';
    sk.onclick=()=>MatchSim.skip();

    _ctx=_canvas.getContext('2d');
    _overlay.appendChild(_canvas);
    _overlay.appendChild(sk);
    document.body.appendChild(_overlay);
  }

  function _unmount() {
    if(_overlay?.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay=null; _canvas=null; _ctx=null;
  }

  function _lockUI(on) {
    document.querySelectorAll(
      '#screen-5 button,#screen-5 input,#screen-5 select,#advanceBtn'
    ).forEach(el=>{
      if(on){ el.dataset.simLocked='1'; el.setAttribute('disabled','disabled'); }
      else if(el.dataset.simLocked){ el.removeAttribute('disabled'); delete el.dataset.simLocked; }
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────

  function _addCmt(min, text) {
    _cmts.unshift({min:Math.round(min), text});
    if(_cmts.length>10) _cmts.pop();
  }

  function _rRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  function _darken(hex,f){
    try{
      const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
      const d=v=>Math.max(0,Math.round(v*f)).toString(16).padStart(2,'0');
      return`#${d(r)}${d(g)}${d(b)}`;
    }catch{return hex;}
  }

  function _rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

})();
