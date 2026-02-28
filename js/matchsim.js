// ═══════════════════════════════════════════════════════════
//  ProPath — matchsim.js  (Top-Down Match Visualiser)
//  Renders a 90-second animated top-down pitch sim before
//  revealing the pre-computed match result.
// ═══════════════════════════════════════════════════════════

const MatchSim = (() => {

  // ── Config ─────────────────────────────────────────────
  const SIM_DURATION_MS = 90000; // 90 real seconds = 90 game minutes
  const TICK_MS         = 80;    // physics update interval
  const MIN_PER_TICK    = SIM_DURATION_MS / TICK_MS / 90; // game-minutes per tick

  // Pitch dimensions (logical units)
  const PW = 680, PH = 420;  // pitch play area
  const PADDING = 32;        // canvas padding around pitch
  const CW = PW + PADDING * 2;
  const CH = PH + PADDING * 2;

  // Colours
  const C = {
    pitchDark : '#1a3a1a',
    pitchLight: '#1d4021',
    line      : 'rgba(255,255,255,0.55)',
    home      : '#4a9eff',   // blue tokens
    homeOutline:'#2060cc',
    away      : '#ff4757',   // red tokens
    awayOutline:'#cc2233',
    player    : '#00e5a0',   // accent green for the player's token
    playerOut : '#f5c842',   // bench/out
    ball      : '#ffffff',
    ballShadow: 'rgba(0,0,0,0.35)',
    hud       : 'rgba(8,12,16,0.88)',
    hudText   : '#e8edf2',
    commentBg : 'rgba(8,12,16,0.92)',
    goalFlash : 'rgba(245,200,66,0.22)',
  };

  // ── State ───────────────────────────────────────────────
  let _canvas, _ctx, _overlay;
  let _raf = null, _interval = null;
  let _running = false;
  let _matchData = null;   // pre-computed result from runMatchSim
  let _onFinish  = null;   // callback when sim ends

  // Sim variables
  let _minute   = 0;       // current game minute (float)
  let _homeScore = 0, _awayScore = 0;
  let _phase    = 'kickoff'; // kickoff | play | goal_anim | halftime | fulltime
  let _phaseTimer = 0;
  let _goalEvents = [];    // {minute, scorer, isHome}
  let _commentary = [];    // [{min, text}]
  let _flashAlpha = 0;
  let _ftShown = false;

  // Players
  let _homePlayers = [];
  let _awayPlayers = [];
  let _ball = { x: PW/2, y: PH/2, vx: 0, vy: 0 };

  // ── Public API ──────────────────────────────────────────
  return {

    // Call this instead of directly resolving a match.
    // matchResult = the object returned by runMatchSim
    // onFinish(matchResult) is called when the user closes the sim
    show(homeName, awayName, matchResult, onFinish) {
      if (_running) return;
      _matchData = matchResult;
      _onFinish  = onFinish;
      _buildGoalSchedule();
      _initPlayers();
      _mount();
      _running = true;
      _minute = 0;
      _homeScore = 0; _awayScore = 0;
      _phase = 'kickoff';
      _phaseTimer = 0;
      _commentary = [];
      _flashAlpha = 0;
      _ftShown = false;

      // Lock the rest of the UI
      _lockUI(true);

      // Start ticks
      let last = performance.now();
      let gameMsAccum = 0;

      function frame(now) {
        const dt = now - last; last = now;
        if (!_running) return;

        // Accumulate real time → game time
        gameMsAccum += dt;
        while (gameMsAccum >= TICK_MS) {
          gameMsAccum -= TICK_MS;
          _tick();
        }

        _draw(homeName, awayName);
        _raf = requestAnimationFrame(frame);
      }
      _raf = requestAnimationFrame(t => { last = t; _raf = requestAnimationFrame(frame); });
    },

    close() {
      _running = false;
      if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
      _lockUI(false);
      _unmount();
      if (_onFinish && _matchData) _onFinish(_matchData);
    },
  };

  // ── Private ─────────────────────────────────────────────

  function _buildGoalSchedule() {
    const md = _matchData;
    const hg = md.hg || 0, ag = md.ag || 0;
    _goalEvents = [];

    // Distribute home goals across the match, weighted toward second half
    for (let i = 0; i < hg; i++) {
      const min = _randGoalMinute(i, hg);
      _goalEvents.push({ minute: min, isHome: true,
        text: _goalCommentary(md.selection === 'out' ? null : G.player.firstName + ' ' + G.player.lastName, true) });
    }
    for (let i = 0; i < ag; i++) {
      const min = _randGoalMinute(i, ag, true);
      _goalEvents.push({ minute: min, isHome: false,
        text: `GOAL! ${_matchData.away || 'Opposition'} score!` });
    }

    // Halftime always at 45
    _goalEvents.push({ minute: 45, isHalftime: true });

    // Mark player events
    if (md.motm) _goalEvents.push({ minute: _randRange(60, 90), isPlayerMOTM: true });
    if (md.yellow) _goalEvents.push({ minute: _randRange(20, 80), isYellow: true });
    if (md.red) _goalEvents.push({ minute: _randRange(30, 85), isRed: true });

    _goalEvents.sort((a, b) => a.minute - b.minute);

    // Build commentary list
    _commentary = [
      { min: 0,  text: `🎙️ Kick off! ${_matchData.homeTeam || 'Home'} vs ${_matchData.awayTeam || 'Away'}` },
      { min: 10, text: _pick(['Good early pressure from the home side.','Both teams feeling each other out early.',
                              'The crowd is electric — a crunch match in prospect.','Early fouls interrupting the flow.']) },
      { min: 25, text: _pick(['Building nicely in midfield.','A thunderous tackle breaks up the attack.',
                              'The winger cuts inside — denied!','Goalkeeper distributes quickly.']) },
      { min: 40, text: _pick(['Approaching half time now.','A nervy few minutes before the break.',
                              'The referee checks his watch.','Both defences holding firm.']) },
      { min: 50, text: _pick(['Strong start to the second half.','Substitution warming up on the touchline.',
                              'High tempo — both teams pushing for a breakthrough.']) },
      { min: 70, text: _pick(['The legs are starting to tire.','Tactical switch from the manager on the sideline.',
                              'A crucial period of the match — who wants it more?']) },
      { min: 85, text: _pick(['The fourth official raises the board — 4 minutes added.',
                              'Almost there! The whistle beckons.','Drama could still be coming!']) },
    ];
  }

  function _goalCommentary(playerName, isHome) {
    const scorerPart = playerName
      ? _pick([`${playerName} finishes coolly!`, `GOAL by ${playerName}!`,
                `${playerName} with a stunning finish!`, `${playerName} breaks the deadlock!`])
      : 'GOAL! The home side are ahead!';
    return `⚽ GOAL! ${scorerPart}`;
  }

  function _randGoalMinute(i, total, isAway) {
    // Spread goals across 90 minutes, bias later in the game
    const slot = isAway ? (90 / (total + 1)) * (i + 1) + _randRange(-5, 5)
                        : (90 / (total + 1)) * (i + 1) + _randRange(-8, 8);
    return Math.max(2, Math.min(89, Math.round(slot)));
  }

  function _randRange(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Player initialisation ─────────────────────────────

  function _initPlayers() {
    _homePlayers = []; _awayPlayers = [];

    // Formation positions (0..1 normalised, home attacks right→)
    const homeFormation = _formation442(false);
    const awayFormation = _formation442(true);

    for (let i = 0; i < 11; i++) {
      const hp = homeFormation[i];
      _homePlayers.push({
        x: hp.x * PW, y: hp.y * PH,
        tx: hp.x * PW, ty: hp.y * PH,
        bx: hp.x * PW, by: hp.y * PH, // base position
        num: i + 1,
        spd: 1.4 + Math.random() * 0.8,
        wanderTimer: _randRange(0, 60),
        isPlayer: i === _playerShirtNum(),
      });
      const ap = awayFormation[i];
      _awayPlayers.push({
        x: ap.x * PW, y: ap.y * PH,
        tx: ap.x * PW, ty: ap.y * PH,
        bx: ap.x * PW, by: ap.y * PH,
        num: i + 1,
        spd: 1.4 + Math.random() * 0.8,
        wanderTimer: _randRange(0, 60),
        isPlayer: false,
      });
    }

    _ball.x = PW / 2; _ball.y = PH / 2;
    _ball.vx = 0; _ball.vy = 0;
  }

  function _playerShirtNum() {
    // Map position to rough shirt number for display
    const pos = G.player?.position || 'CM';
    const map = { GK: 0, CB: 5, LB: 3, RB: 2, CDM: 6, CM: 8, CAM: 10, LW: 11, RW: 7, CF: 9, ST: 9 };
    return (map[pos] || 8) % 11;
  }

  function _formation442(isAway) {
    const flip = isAway;
    const f = (x, y) => ({ x: flip ? 1 - x : x, y });
    return [
      f(0.05, 0.5),                          // GK
      f(0.2,  0.18), f(0.2, 0.4), f(0.2, 0.6), f(0.2, 0.82), // DEF
      f(0.45, 0.22), f(0.45, 0.44), f(0.45, 0.56), f(0.45, 0.78), // MID
      f(0.7,  0.36), f(0.7,  0.64),          // ATT
    ];
  }

  // ── Physics tick ──────────────────────────────────────

  function _tick() {
    if (_phase === 'fulltime') return;

    // Each tick advances game time: total sim = SIM_DURATION_MS at TICK_MS per tick
    // ticksTotal = SIM_DURATION_MS / TICK_MS; gameMinPerTick = 90 / ticksTotal
    const ticksTotal = SIM_DURATION_MS / TICK_MS;
    _minute = Math.min(90, _minute + 90 / ticksTotal);

    // Check halftime
    if (_minute >= 45 && _phase === 'play') {
      _phase = 'halftime'; _phaseTimer = 0;
    }
    if (_phase === 'halftime') {
      _phaseTimer++;
      if (_phaseTimer > 18) { // ~1.4 seconds halftime pause
        _phase = 'play';
        _addComment(45, '🔔 Second half underway!');
      }
      return;
    }
    if (_minute >= 90 && _phase === 'play') {
      _phase = 'fulltime'; _ftShown = false; _phaseTimer = 0; return;
    }

    // Kickoff pause
    if (_phase === 'kickoff') {
      _phaseTimer++;
      if (_phaseTimer > 10) _phase = 'play';
      return;
    }

    // Process goal events
    for (const ev of _goalEvents) {
      if (!ev._fired && !ev.isHalftime && _minute >= ev.minute) {
        ev._fired = true;
        if (ev.isHome) { _homeScore++; _triggerGoalAnim(ev.text); }
        else if (!ev.isHome && !ev.isYellow && !ev.isRed && !ev.isPlayerMOTM) { _awayScore++; _triggerGoalAnim(ev.text); }
        if (ev.isYellow) _addComment(ev.minute, `🟨 Yellow card! Free kick awarded.`);
        if (ev.isRed)    _addComment(ev.minute, `🟥 RED CARD! Down to 10 men!`);
        if (ev.isPlayerMOTM) _addComment(ev.minute, `🌟 Outstanding performance — Man of the Match candidate!`);
      }
      if (!ev._fired && ev.isHalftime && _minute >= 45) ev._fired = true;
    }

    // Commentary drip
    for (const c of _commentary) {
      if (!c._fired && _minute >= c.min) { c._fired = true; _addComment(c.min, c.text); }
    }

    // Flash decay
    if (_flashAlpha > 0) _flashAlpha = Math.max(0, _flashAlpha - 0.012);

    // Move players
    _movePlayers();
    _moveBall();
  }

  function _triggerGoalAnim(text) {
    _flashAlpha = 0.7;
    _addComment(Math.round(_minute), text);
    // Scatter players toward goal for celebration
    const celebrating = _homeScore > _awayScore ? _homePlayers : _awayPlayers;
    celebrating.forEach(p => {
      p.tx = PW * 0.75 + _randRange(-40, 40);
      p.ty = PH * 0.5  + _randRange(-40, 40);
    });
  }

  function _addComment(min, text) {
    _commentary.unshift({ min: Math.round(min), text, _time: Date.now() });
    if (_commentary.length > 12) _commentary.pop();
  }

  function _movePlayers() {
    const allPl = [..._homePlayers, ..._awayPlayers];
    allPl.forEach(p => {
      // Wander: periodically pick new target near base
      p.wanderTimer--;
      if (p.wanderTimer <= 0) {
        p.wanderTimer = _randRange(30, 80);
        p.tx = p.bx + _randRange(-60, 60);
        p.ty = p.by + _randRange(-50, 50);
        // Clamp inside pitch
        p.tx = Math.max(8, Math.min(PW - 8, p.tx));
        p.ty = Math.max(8, Math.min(PH - 8, p.ty));
      }
      // Move toward target
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 2) {
        p.x += (dx / dist) * Math.min(dist, p.spd);
        p.y += (dy / dist) * Math.min(dist, p.spd);
      }
    });

    // Ball carrier logic: nearest player chases ball
    const allArr = [..._homePlayers, ..._awayPlayers];
    let nearest = null, nearDist = Infinity;
    for (const p of allArr) {
      const dx = _ball.x - p.x, dy = _ball.y - p.y;
      const d = dx*dx + dy*dy;
      if (d < nearDist) { nearDist = d; nearest = p; }
    }
    if (nearest && nearDist < 3600) {
      nearest.x += (_ball.x - nearest.x) * 0.12;
      nearest.y += (_ball.y - nearest.y) * 0.12;
    }
  }

  function _moveBall() {
    _ball.x += _ball.vx;
    _ball.y += _ball.vy;
    _ball.vx *= 0.94;
    _ball.vy *= 0.94;

    // Bounce off pitch edges
    if (_ball.x < 0)   { _ball.x = 0;   _ball.vx *= -0.6; }
    if (_ball.x > PW)  { _ball.x = PW;  _ball.vx *= -0.6; }
    if (_ball.y < 0)   { _ball.y = 0;   _ball.vy *= -0.6; }
    if (_ball.y > PH)  { _ball.y = PH;  _ball.vy *= -0.6; }

    // Periodically kick ball toward attacking third
    if (Math.random() < 0.018) {
      const dir = (_homeScore > _awayScore) ? 1 : -1;
      _ball.vx = dir * _randRange(2, 5) + (Math.random() - 0.5) * 3;
      _ball.vy = (Math.random() - 0.5) * 4;
    }
  }

  // ── Drawing ───────────────────────────────────────────

  function _draw(homeName, awayName) {
    const ctx = _ctx;
    const W = CW, H = CH;
    const P = PADDING;

    ctx.clearRect(0, 0, W, H);

    // ── Pitch background stripes ──
    _drawPitch(ctx, P);

    // ── Goal flash ──
    if (_flashAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = _flashAlpha;
      ctx.fillStyle = C.goalFlash;
      ctx.fillRect(P, P, PW, PH);
      ctx.restore();
    }

    // ── Players ──
    _homePlayers.forEach(p => _drawToken(ctx, P + p.x, P + p.y, p.num, C.home, C.homeOutline, p.isPlayer));
    _awayPlayers.forEach(p => _drawToken(ctx, P + p.x, P + p.y, p.num, C.away, C.awayOutline, false));

    // ── Ball ──
    _drawBall(ctx, P + _ball.x, P + _ball.y);

    // ── HUD bar (top) ──
    _drawHUD(ctx, homeName, awayName, W);

    // ── Commentary feed (bottom-right) ──
    _drawCommentary(ctx, W, H);

    // ── Halftime / FT overlays ──
    if (_phase === 'halftime' && _phaseTimer < 10) {
      _drawOverlayText(ctx, W, H, 'HALF TIME', `${_homeScore} – ${_awayScore}`);
    }
    if (_phase === 'fulltime') {
      _drawOverlayText(ctx, W, H, 'FULL TIME', `${_homeScore} – ${_awayScore}`);
      _drawFTButton(ctx, W, H);
    }

    // ── Minute indicator ──
    if (_phase !== 'fulltime') {
      ctx.save();
      ctx.font = "bold 13px 'DM Mono', monospace";
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.min(90, Math.floor(_minute))}'`, W - 12, H - 12);
      ctx.restore();
    }
  }

  function _drawPitch(ctx, P) {
    // Alternating stripes
    const stripeW = PW / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? C.pitchDark : C.pitchLight;
      ctx.fillRect(P + i * stripeW, P, stripeW, PH);
    }

    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    // Outline
    ctx.strokeRect(P, P, PW, PH);

    // Centre line
    ctx.beginPath(); ctx.moveTo(P + PW/2, P); ctx.lineTo(P + PW/2, P + PH); ctx.stroke();

    // Centre circle
    ctx.beginPath(); ctx.arc(P + PW/2, P + PH/2, 56, 0, Math.PI*2); ctx.stroke();
    // Centre spot
    ctx.beginPath(); ctx.arc(P + PW/2, P + PH/2, 3, 0, Math.PI*2);
    ctx.fillStyle = C.line; ctx.fill();

    // Penalty areas
    const pa = { w: 110, h: 220 }; // logical
    // Home (left)
    ctx.strokeRect(P, P + (PH - pa.h)/2, pa.w, pa.h);
    // Away (right)
    ctx.strokeRect(P + PW - pa.w, P + (PH - pa.h)/2, pa.w, pa.h);

    // Six-yard boxes
    const sb = { w: 42, h: 110 };
    ctx.strokeRect(P, P + (PH - sb.h)/2, sb.w, sb.h);
    ctx.strokeRect(P + PW - sb.w, P + (PH - sb.h)/2, sb.w, sb.h);

    // Penalty spots
    ctx.beginPath(); ctx.arc(P + 82, P + PH/2, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(P + PW - 82, P + PH/2, 3, 0, Math.PI*2); ctx.fill();

    // Goals (outside pitch)
    const gH = 64, gD = 12;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    // Left goal
    ctx.strokeRect(P - gD, P + (PH - gH)/2, gD, gH);
    // Right goal
    ctx.strokeRect(P + PW, P + (PH - gH)/2, gD, gH);

    ctx.restore();
  }

  function _drawToken(ctx, x, y, num, fill, stroke, isPlayerToken) {
    const r = isPlayerToken ? 12 : 10;
    ctx.save();

    // Glow for player token
    if (isPlayerToken) {
      ctx.shadowColor = '#00e5a0';
      ctx.shadowBlur = 14;
    }

    // Shadow
    ctx.beginPath(); ctx.arc(x + 1.5, y + 1.5, r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();

    // Body
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = isPlayerToken ? C.player : fill; ctx.fill();
    ctx.strokeStyle = isPlayerToken ? '#008855' : stroke;
    ctx.lineWidth = 1.5; ctx.stroke();

    // Number
    ctx.shadowBlur = 0;
    ctx.font = `bold ${isPlayerToken ? 9 : 8}px 'DM Mono', monospace`;
    ctx.fillStyle = isPlayerToken ? '#040d08' : '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(num, x, y + 0.5);

    ctx.restore();
  }

  function _drawBall(ctx, x, y) {
    // Shadow
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x + 2, y + 4, 7, 4, 0, 0, Math.PI*2);
    ctx.fillStyle = C.ballShadow; ctx.fill();

    // Ball
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2);
    ctx.fillStyle = C.ball; ctx.fill();
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 0.5; ctx.stroke();

    // Pentagon pattern (simplified)
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2);
    ctx.fillStyle = '#222'; ctx.fill();

    ctx.restore();
  }

  function _drawHUD(ctx, homeName, awayName, W) {
    const H = 48, Y = 0;
    ctx.save();

    // Background
    ctx.fillStyle = C.hud;
    ctx.fillRect(0, Y, W, H);

    // Home team name (left)
    ctx.font = "bold 13px 'DM Sans', sans-serif";
    ctx.fillStyle = C.hudText;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const shortHome = homeName.length > 18 ? homeName.slice(0,16)+'…' : homeName;
    ctx.fillText(shortHome, 16, Y + H/2);

    // Home colour dot
    ctx.beginPath(); ctx.arc(13, Y + H/2, 6, 0, Math.PI*2);
    ctx.fillStyle = C.home; ctx.fill();
    ctx.font = "bold 13px 'DM Sans', sans-serif";
    ctx.fillStyle = C.hudText; ctx.textAlign = 'left';
    ctx.fillText(shortHome, 26, Y + H/2);

    // Score (centre)
    ctx.font = "bold 22px 'Bebas Neue', sans-serif";
    ctx.fillStyle = C.hudText;
    ctx.textAlign = 'center';
    ctx.fillText(`${_homeScore}  –  ${_awayScore}`, W / 2, Y + H/2 + 1);

    // Minute badge
    const minStr = _phase === 'fulltime' ? 'FT' : _phase === 'halftime' ? 'HT' : `${Math.min(90,Math.floor(_minute))}'`;
    ctx.font = "bold 11px 'DM Mono', monospace";
    ctx.fillStyle = _phase === 'fulltime' ? '#f5c842' : '#00e5a0';
    ctx.textAlign = 'center';
    ctx.fillText(minStr, W/2, Y + H/2 + 17);

    // Away team name (right)
    const shortAway = awayName.length > 18 ? awayName.slice(0,16)+'…' : awayName;
    ctx.beginPath(); ctx.arc(W - 26, Y + H/2, 6, 0, Math.PI*2);
    ctx.fillStyle = C.away; ctx.fill();
    ctx.font = "bold 13px 'DM Sans', sans-serif";
    ctx.fillStyle = C.hudText; ctx.textAlign = 'right';
    ctx.fillText(shortAway, W - 34, Y + H/2);

    ctx.restore();
  }

  function _drawCommentary(ctx, W, H) {
    const boxW = 240, boxH = 140, boxX = W - boxW - 8, boxY = H - boxH - 8;
    ctx.save();

    ctx.fillStyle = C.commentBg;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();

    ctx.font = "10px 'DM Mono', monospace";
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('COMMENTARY', boxX + 10, boxY + 14);

    const visible = _commentary.slice(0, 5);
    visible.forEach((c, i) => {
      const alpha = 1 - i * 0.18;
      ctx.globalAlpha = Math.max(0.15, alpha);
      const minBadge = `${c.min}'`;
      ctx.font = "bold 9px 'DM Mono', monospace";
      ctx.fillStyle = '#f5c842';
      ctx.textAlign = 'left';
      ctx.fillText(minBadge, boxX + 10, boxY + 30 + i * 22);

      ctx.font = "10px 'DM Sans', sans-serif";
      ctx.fillStyle = '#e8edf2';
      const text = c.text.length > 32 ? c.text.slice(0, 30) + '…' : c.text;
      ctx.fillText(text, boxX + 38, boxY + 30 + i * 22);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function _drawOverlayText(ctx, W, H, line1, line2) {
    ctx.save();
    ctx.fillStyle = 'rgba(8,12,16,0.72)';
    ctx.fillRect(0, H/2 - 54, W, 108);

    ctx.font = "bold 44px 'Bebas Neue', sans-serif";
    ctx.fillStyle = '#f5c842';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(line1, W/2, H/2 - 16);

    ctx.font = "bold 32px 'Bebas Neue', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line2, W/2, H/2 + 22);
    ctx.restore();
  }

  function _drawFTButton(ctx, W, H) {
    const bW = 200, bH = 40, bX = W/2 - bW/2, bY = H/2 + 60;
    ctx.save();
    ctx.fillStyle = '#00e5a0';
    ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 8); ctx.fill();
    ctx.font = "bold 14px 'DM Sans', sans-serif";
    ctx.fillStyle = '#040d08';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('See Full Time Result →', W/2, bY + bH/2);
    ctx.restore();
  }

  // ── Mounting ──────────────────────────────────────────

  function _mount() {
    // roundRect polyfill for older browsers
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        r = Math.min(r, w/2, h/2);
        this.beginPath();
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
      };
    }
    // Create overlay wrapper
    _overlay = document.createElement('div');
    _overlay.id = 'matchSimOverlay';
    _overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(4,8,12,0.97);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      animation:fadeIn .3s ease;
    `;

    // Add bounce-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes bounceIn{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    `;
    document.head.appendChild(style);

    _canvas = document.createElement('canvas');
    _canvas.width  = CW;
    _canvas.height = CH;
    _canvas.style.cssText = `
      border-radius:12px;
      box-shadow:0 0 60px rgba(0,229,160,0.12),0 20px 60px rgba(0,0,0,0.6);
      max-width:96vw;
      max-height:calc(96vh - 48px);
      display:block;
      cursor:default;
    `;

    // Click handler for FT button
    _canvas.addEventListener('click', e => {
      if (_phase !== 'fulltime') return;
      const rect = _canvas.getBoundingClientRect();
      const scaleX = _canvas.width  / rect.width;
      const scaleY = _canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top)  * scaleY;

      const W = CW, H = CH;
      const bW = 200, bH = 40, bX = W/2 - bW/2, bY = H/2 + 60;
      if (cx >= bX && cx <= bX + bW && cy >= bY && cy <= bY + bH) {
        MatchSim.close();
      }
    });

    // Skip link
    const skipBtn = document.createElement('div');
    skipBtn.textContent = 'Skip ⏩';
    skipBtn.style.cssText = `
      margin-top:10px;font-size:11px;color:rgba(255,255,255,0.3);
      cursor:pointer;font-family:'DM Mono',monospace;letter-spacing:2px;
      transition:color .2s;
    `;
    skipBtn.onmouseenter = () => skipBtn.style.color = 'rgba(255,255,255,0.7)';
    skipBtn.onmouseleave = () => skipBtn.style.color = 'rgba(255,255,255,0.3)';
    skipBtn.onclick = () => MatchSim.close();

    _ctx = _canvas.getContext('2d');

    _overlay.appendChild(_canvas);
    _overlay.appendChild(skipBtn);
    document.body.appendChild(_overlay);
  }

  function _unmount() {
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null; _canvas = null; _ctx = null;
  }

  function _lockUI(locked) {
    // Disable/enable all interactive elements in the game UI
    const targets = document.querySelectorAll(
      '#screen-5 button, #screen-5 input, #screen-5 select, ' +
      '#advanceBtn, #skipWeekBtn'
    );
    targets.forEach(el => {
      if (locked) {
        el.dataset.simDisabled = 'true';
        el.setAttribute('disabled', 'disabled');
      } else {
        if (el.dataset.simDisabled) {
          el.removeAttribute('disabled');
          delete el.dataset.simDisabled;
        }
      }
    });
  }

})();
