// ═══════════════════════════════════════════════
//  ProPath — Data & Constants
// ═══════════════════════════════════════════════

const NATIONS = [
  {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},{name:'Spain',flag:'🇪🇸'},{name:'France',flag:'🇫🇷'},
  {name:'Germany',flag:'🇩🇪'},{name:'Italy',flag:'🇮🇹'},{name:'Brazil',flag:'🇧🇷'},
  {name:'Argentina',flag:'🇦🇷'},{name:'Portugal',flag:'🇵🇹'},{name:'Netherlands',flag:'🇳🇱'},
  {name:'Belgium',flag:'🇧🇪'},{name:'Uruguay',flag:'🇺🇾'},{name:'Colombia',flag:'🇨🇴'},
  {name:'Mexico',flag:'🇲🇽'},{name:'USA',flag:'🇺🇸'},{name:'Japan',flag:'🇯🇵'},
  {name:'South Korea',flag:'🇰🇷'},{name:'Senegal',flag:'🇸🇳'},{name:'Morocco',flag:'🇲🇦'},
  {name:'Nigeria',flag:'🇳🇬'},{name:'Ghana',flag:'🇬🇭'},{name:'Egypt',flag:'🇪🇬'},
  {name:'Ivory Coast',flag:'🇨🇮'},{name:'Cameroon',flag:'🇨🇲'},{name:'Algeria',flag:'🇩🇿'},
  {name:'Croatia',flag:'🇭🇷'},{name:'Denmark',flag:'🇩🇰'},{name:'Switzerland',flag:'🇨🇭'},
  {name:'Poland',flag:'🇵🇱'},{name:'Ukraine',flag:'🇺🇦'},{name:'Serbia',flag:'🇷🇸'},
  {name:'Turkey',flag:'🇹🇷'},{name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿'},{name:'Wales',flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿'},
  {name:'Republic of Ireland',flag:'🇮🇪'},{name:'Austria',flag:'🇦🇹'},{name:'Sweden',flag:'🇸🇪'},
  {name:'Norway',flag:'🇳🇴'},{name:'Ecuador',flag:'🇪🇨'},{name:'Peru',flag:'🇵🇪'},
  {name:'Chile',flag:'🇨🇱'},{name:'Venezuela',flag:'🇻🇪'},{name:'Paraguay',flag:'🇵🇾'},
  {name:'Saudi Arabia',flag:'🇸🇦'},{name:'Iran',flag:'🇮🇷'},{name:'Australia',flag:'🇦🇺'},
  {name:'Canada',flag:'🇨🇦'},{name:'Czech Republic',flag:'🇨🇿'},{name:'Slovakia',flag:'🇸🇰'},
  {name:'Hungary',flag:'🇭🇺'},{name:'Romania',flag:'🇷🇴'},{name:'Greece',flag:'🇬🇷'},
];

const POSITIONS = [
  {acronym:'GK',  name:'Goalkeeper'},
  {acronym:'CB',  name:'Centre Back'},
  {acronym:'LB',  name:'Left Back'},
  {acronym:'RB',  name:'Right Back'},
  {acronym:'CDM', name:'Def. Midfielder'},
  {acronym:'CM',  name:'Centre Mid'},
  {acronym:'CAM', name:'Att. Midfielder'},
  {acronym:'LM',  name:'Left Mid'},
  {acronym:'RM',  name:'Right Mid'},
  {acronym:'LW',  name:'Left Winger'},
  {acronym:'RW',  name:'Right Winger'},
  {acronym:'CF',  name:'Centre Forward'},
  {acronym:'ST',  name:'Striker'},
];

const TRAITS = [
  {icon:'⚡',name:'Pace Monster',       desc:'Blistering speed, explosive acceleration.',   boosts:{pace:6,dribbling:2}},
  {icon:'🎯',name:'Clinical Finisher',  desc:'Elite composure and finishing in the box.',    boosts:{shooting:7,physical:2}},
  {icon:'🧠',name:'Playmaker',          desc:'Vision & passing that unlocks every defence.', boosts:{passing:7,dribbling:2}},
  {icon:'💪',name:'Physical Beast',     desc:'Dominant in duels, outstanding stamina.',      boosts:{physical:7,defending:2}},
  {icon:'🛡️',name:'Rock Solid',         desc:'Impeccable positioning, reading of the game.', boosts:{defending:8,physical:2}},
  {icon:'🪄',name:'Dribble Wizard',     desc:'Low centre of gravity, silky ball control.',  boosts:{dribbling:8,pace:2}},
  {icon:'🦅',name:'Aerial Threat',      desc:'Dominant in the air, powerful headers.',       boosts:{physical:5,shooting:3}},
  {icon:'🔮',name:'Long Shot Specialist',desc:'Thunderbolt shots from range.',               boosts:{shooting:5,passing:3}},
];

// Base stats per position — all tuned lower so youth starts ~55-62 OVR
const POS_BASE = {
  GK:  {pace:42,shooting:14,passing:46,dribbling:34,defending:16,physical:54},
  CB:  {pace:48,shooting:28,passing:50,dribbling:36,defending:60,physical:58},
  LB:  {pace:56,shooting:30,passing:54,dribbling:50,defending:52,physical:50},
  RB:  {pace:56,shooting:30,passing:54,dribbling:50,defending:52,physical:50},
  CDM: {pace:50,shooting:38,passing:56,dribbling:46,defending:58,physical:56},
  CM:  {pace:52,shooting:46,passing:58,dribbling:52,defending:42,physical:52},
  CAM: {pace:54,shooting:54,passing:60,dribbling:58,defending:30,physical:46},
  LM:  {pace:60,shooting:48,passing:54,dribbling:58,defending:34,physical:46},
  RM:  {pace:60,shooting:48,passing:54,dribbling:58,defending:34,physical:46},
  LW:  {pace:62,shooting:50,passing:52,dribbling:62,defending:26,physical:44},
  RW:  {pace:62,shooting:50,passing:52,dribbling:62,defending:26,physical:44},
  CF:  {pace:56,shooting:60,passing:52,dribbling:54,defending:24,physical:52},
  ST:  {pace:54,shooting:62,passing:46,dribbling:50,defending:22,physical:56},
};

// OVR weights per position
const POS_WEIGHTS = {
  GK:  {pace:.4,shooting:.05,passing:.7,dribbling:.4,defending:1.8,physical:1.2},
  CB:  {pace:.7,shooting:.3,passing:.9,dribbling:.5,defending:1.9,physical:1.4},
  LB:  {pace:1.4,shooting:.5,passing:1.1,dribbling:.9,defending:1.2,physical:.9},
  RB:  {pace:1.4,shooting:.5,passing:1.1,dribbling:.9,defending:1.2,physical:.9},
  CDM: {pace:.7,shooting:.5,passing:1.1,dribbling:.7,defending:1.8,physical:1.4},
  CM:  {pace:.8,shooting:.9,passing:1.5,dribbling:1.1,defending:.8,physical:1.0},
  CAM: {pace:.9,shooting:1.4,passing:1.5,dribbling:1.4,defending:.3,physical:.7},
  LM:  {pace:1.6,shooting:1.0,passing:.9,dribbling:1.4,defending:.4,physical:.7},
  RM:  {pace:1.6,shooting:1.0,passing:.9,dribbling:1.4,defending:.4,physical:.7},
  LW:  {pace:1.8,shooting:1.1,passing:.8,dribbling:1.7,defending:.3,physical:.6},
  RW:  {pace:1.8,shooting:1.1,passing:.8,dribbling:1.7,defending:.3,physical:.6},
  CF:  {pace:1.2,shooting:1.9,passing:.7,dribbling:1.1,defending:.2,physical:1.1},
  ST:  {pace:1.1,shooting:2.0,passing:.6,dribbling:1.0,defending:.2,physical:1.3},
};

// Season calendar — 10 months, 4 weeks each = 40 weeks per season
const SEASON_MONTHS = [
  'July','August','September','October','November','December',
  'January','February','March','April',
];

// League tiers
const LEAGUES = [
  {name:'National Youth League',  tier:5, prestige:1, salary:500},
  {name:'League Two',             tier:4, prestige:2, salary:2000},
  {name:'League One',             tier:3, prestige:3, salary:5000},
  {name:'Championship',          tier:2, prestige:4, salary:15000},
  {name:'Premier League',        tier:1, prestige:5, salary:60000},
];

// Clubs by tier
const CLUBS = {
  5: ['Stevenage Youth','Fleetwood Youth','Harrogate Town','Morecambe FC','Aldershot Town'],
  4: ['Grimsby Town','Crawley Town','Swindon Town','Bradford City','Barrow AFC'],
  3: ['Portsmouth','Oxford United','Burton Albion','Charlton Athletic','Lincoln City'],
  2: ['Leicester City','Southampton','Leeds United','Burnley','Sheffield United','Middlesbrough','Coventry City'],
  1: ['Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham','Newcastle','Aston Villa'],
};

// Match event flavour
const MATCH_EVENTS = {
  goal:     ['rifled into the top corner','calmly slotted past the keeper','powerful header from a corner','stunning volley from outside the box','tap-in from close range','curled effort into the far post'],
  assist:   ['threaded the perfect through ball','whipped in a delicious cross','dummied and played in the runner','set piece delivery met perfectly'],
  motm:     ['dominated from first whistle','was unplayable tonight','dictated the tempo throughout','put in a masterclass performance'],
  yellow:   ['caught in a rash challenge','argued with the referee','cynical tactical foul'],
  red:      ['two yellows — reckless second challenge','straight red for violent conduct'],
  injury:   ['limped off after a heavy tackle','clutching hamstring — substituted','rolled ankle in training'],
};

const AGE_DESC = {
  15:'Youth academy prodigy — raw talent, enormous ceiling.',
  16:'Youth academy sensation — the club\'s hottest prospect.',
  17:'Breaking into the first team — hungry and determined.',
  18:'First professional contract — the journey begins.',
  19:'Up-and-coming talent with bags of potential.',
  20:'Young professional with something to prove.',
  21:'Promising career gaining real momentum.',
  22:'Entering your prime development years.',
  23:'Honing your craft, ready for a bigger club.',
  24:'Consistent performer, attracting top-tier attention.',
  25:'Peak years approaching — prime time.',
  26:'In the heart of your prime.',
  27:'Prime season — performing at your best.',
  28:'Experienced professional, a dressing room leader.',
  29:'Battle-hardened veteran with wisdom to share.',
  30:'Final chapter begins — what legacy will you leave?',
};
