// ════════════════════════════════════════════════════════════
//  ProPath v3 — data.js
//  All static constants, lookup tables, and content arrays
// ════════════════════════════════════════════════════════════

const NATIONS=[{name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},{name:'Spain',flag:'🇪🇸'},{name:'France',flag:'🇫🇷'},{name:'Germany',flag:'🇩🇪'},{name:'Italy',flag:'🇮🇹'},{name:'Brazil',flag:'🇧🇷'},{name:'Argentina',flag:'🇦🇷'},{name:'Portugal',flag:'🇵🇹'},{name:'Netherlands',flag:'🇳🇱'},{name:'Belgium',flag:'🇧🇪'},{name:'Uruguay',flag:'🇺🇾'},{name:'Colombia',flag:'🇨🇴'},{name:'Mexico',flag:'🇲🇽'},{name:'USA',flag:'🇺🇸'},{name:'Japan',flag:'🇯🇵'},{name:'South Korea',flag:'🇰🇷'},{name:'Senegal',flag:'🇸🇳'},{name:'Morocco',flag:'🇲🇦'},{name:'Nigeria',flag:'🇳🇬'},{name:'Ghana',flag:'🇬🇭'},{name:'Egypt',flag:'🇪🇬'},{name:'Ivory Coast',flag:'🇨🇮'},{name:'Cameroon',flag:'🇨🇲'},{name:'Croatia',flag:'🇭🇷'},{name:'Denmark',flag:'🇩🇰'},{name:'Switzerland',flag:'🇨🇭'},{name:'Poland',flag:'🇵🇱'},{name:'Serbia',flag:'🇷🇸'},{name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿'},{name:'Wales',flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿'},{name:'Republic of Ireland',flag:'🇮🇪'},{name:'Sweden',flag:'🇸🇪'},{name:'Norway',flag:'🇳🇴'},{name:'Australia',flag:'🇦🇺'},{name:'Canada',flag:'🇨🇦'},{name:'Greece',flag:'🇬🇷'},{name:'Turkey',flag:'🇹🇷'},{name:'Ecuador',flag:'🇪🇨'},{name:'Chile',flag:'🇨🇱'},{name:'Jamaica',flag:'🇯🇲'},{name:'Algeria',flag:'🇩🇿'},{name:'Israel',flag:'🇮🇱'},{name:'Palestine',flag:'🇵🇸'}];

const POSITIONS=[{acronym:'GK',name:'Goalkeeper'},{acronym:'CB',name:'Centre Back'},{acronym:'LB',name:'Left Back'},{acronym:'RB',name:'Right Back'},{acronym:'CDM',name:'Def. Midfielder'},{acronym:'CM',name:'Centre Mid'},{acronym:'CAM',name:'Att. Midfielder'},{acronym:'LW',name:'Left Winger'},{acronym:'RW',name:'Right Winger'},{acronym:'CF',name:'Centre Forward'},{acronym:'ST',name:'Striker'}];

const TRAITS=[
  {icon:'⚡',name:'Pace Monster',desc:'Blistering speed & acceleration.',boosts:{pace:6,dribbling:2}},
  {icon:'🎯',name:'Clinical Finisher',desc:'Elite composure in the box.',boosts:{shooting:7,physical:2}},
  {icon:'🧠',name:'Playmaker',desc:'Vision & passing to unlock defences.',boosts:{passing:7,dribbling:2}},
  {icon:'💪',name:'Physical Beast',desc:'Dominant in duels, iron stamina.',boosts:{physical:7,defending:2}},
  {icon:'🛡️',name:'Rock Solid',desc:'Perfect positioning & reading.',boosts:{defending:8,physical:2}},
  {icon:'🪄',name:'Dribble Wizard',desc:'Silky ball control, impossible to stop.',boosts:{dribbling:8,pace:2}},
  {icon:'🦅',name:'Aerial Threat',desc:'Dominant in the air.',boosts:{physical:5,shooting:3}},
  {icon:'🔮',name:'Long Shot Specialist',desc:'Thunderbolt shots from range.',boosts:{shooting:5,passing:3}},
];

const POS_BASE={
  GK:{pace:42,shooting:14,passing:46,dribbling:34,defending:16,physical:54},
  CB:{pace:48,shooting:28,passing:50,dribbling:36,defending:60,physical:58},
  LB:{pace:56,shooting:30,passing:54,dribbling:50,defending:52,physical:50},
  RB:{pace:56,shooting:30,passing:54,dribbling:50,defending:52,physical:50},
  CDM:{pace:50,shooting:38,passing:56,dribbling:46,defending:58,physical:56},
  CM:{pace:52,shooting:46,passing:58,dribbling:52,defending:42,physical:52},
  CAM:{pace:54,shooting:54,passing:60,dribbling:58,defending:30,physical:46},
  LW:{pace:62,shooting:50,passing:52,dribbling:62,defending:26,physical:44},
  RW:{pace:62,shooting:50,passing:52,dribbling:62,defending:26,physical:44},
  CF:{pace:56,shooting:60,passing:52,dribbling:54,defending:24,physical:52},
  ST:{pace:54,shooting:62,passing:46,dribbling:50,defending:22,physical:56},
};

const POS_WEIGHTS={
  GK:{pace:.4,shooting:.05,passing:.7,dribbling:.4,defending:1.8,physical:1.2},
  CB:{pace:.7,shooting:.3,passing:.9,dribbling:.5,defending:1.9,physical:1.4},
  LB:{pace:1.4,shooting:.5,passing:1.1,dribbling:.9,defending:1.2,physical:.9},
  RB:{pace:1.4,shooting:.5,passing:1.1,dribbling:.9,defending:1.2,physical:.9},
  CDM:{pace:.7,shooting:.5,passing:1.1,dribbling:.7,defending:1.8,physical:1.4},
  CM:{pace:.8,shooting:.9,passing:1.5,dribbling:1.1,defending:.8,physical:1.0},
  CAM:{pace:.9,shooting:1.4,passing:1.5,dribbling:1.4,defending:.3,physical:.7},
  LW:{pace:1.8,shooting:1.1,passing:.8,dribbling:1.7,defending:.3,physical:.6},
  RW:{pace:1.8,shooting:1.1,passing:.8,dribbling:1.7,defending:.3,physical:.6},
  CF:{pace:1.2,shooting:1.9,passing:.7,dribbling:1.1,defending:.2,physical:1.1},
  ST:{pace:1.1,shooting:2.0,passing:.6,dribbling:1.0,defending:.2,physical:1.3},
};

const LEAGUES=[
  {id:'L5',name:'National Youth League',tier:5,prestige:1,salary:800,size:12,promoted:2,relegated:2},
  {id:'L4',name:'League Two',tier:4,prestige:2,salary:2500,size:14,promoted:3,relegated:3},
  {id:'L3',name:'League One',tier:3,prestige:3,salary:6000,size:14,promoted:2,relegated:3},
  {id:'L2',name:'Championship',tier:2,prestige:4,salary:18000,size:16,promoted:3,relegated:3},
  {id:'L1',name:'Premier League',tier:1,prestige:5,salary:75000,size:20,promoted:0,relegated:3},
];

const CLUBS={
  // Tier 5 — National Youth League (22 unique clubs, league size 12)
  5:[
    'Stevenage Youth','Harrogate Town Academy','Fleetwood Town Academy','Morecambe Academy',
    'Aldershot Town','Barnet FC','Boreham Wood','Dover Athletic','Woking FC',
    'Bromley Academy','Dagenham & Redbridge','Ebbsfleet United','Eastleigh FC',
    'FC Halifax Town','Hartlepool Academy','King\'s Lynn Town','Maidenhead United',
    'Oldham Athletic','Solihull Moors','Torquay United','Wrexham Academy','York City Academy',
  ],
  // Tier 4 — League Two (22 unique clubs, league size 14)
  4:[
    'Grimsby Town','Crawley Town','Swindon Town','Bradford City','Barrow AFC',
    'Doncaster Rovers','AFC Wimbledon','Colchester United','Salford City',
    'Accrington Stanley','Carlisle United','Crewe Alexandra','Forest Green Rovers',
    'Gillingham FC','Mansfield Town','MK Dons','Newport County','Northampton Town',
    'Port Vale','Rochdale AFC','Stockport County','Tranmere Rovers',
  ],
  // Tier 3 — League One (22 unique clubs, league size 14)
  3:[
    'Portsmouth','Charlton Athletic','Lincoln City','Shrewsbury Town','Peterborough Utd',
    'Oxford United','Exeter City','Derby County','Bristol Rovers',
    'Barnsley FC','Bolton Wanderers','Burton Albion','Cambridge United',
    'Cheltenham Town','Fleetwood Town','Ipswich Town','Leyton Orient','Plymouth Argyle',
    'Reading FC','Rotherham United','Wigan Athletic','Wycombe Wanderers',
  ],
  // Tier 2 — Championship (26 unique clubs, league size 16)
  2:[
    'Southampton','Leeds United','Burnley','Sheffield United','Middlesbrough','Coventry City',
    'Preston NE','Stoke City','Millwall','Swansea City',
    'Birmingham City','Blackburn Rovers','Blackpool FC','Cardiff City','Huddersfield Town',
    'Hull City','Luton Town','Norwich City','QPR','Sheffield Wednesday',
    'Sunderland AFC','Watford FC','West Bromwich Albion','Wigan Athletic','Bristol City','Nottm Forest',
  ],
  // Tier 1 — Premier League (22 unique clubs, league size 20)
  1:[
    'Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham Hotspur',
    'Newcastle United','Aston Villa','West Ham United','Brighton & Hove Albion',
    'Brentford FC','Crystal Palace','Everton FC','Fulham FC','Leicester City',
    'Nottingham Forest','Wolves','Bournemouth','Ipswich Town','Southampton FC',
    'Sunderland FC','Burnley FC',
  ],
};

const CUPS=[
  {id:'fa_cup',name:'The Knockout Cup',icon:'🏆',desc:'The oldest cup competition in football',minTier:4,rounds:['Round 3','Round 4','Round 5','QF','SF','Final']},
  {id:'league_cup',name:'League Shield',icon:'🥇',desc:'Domestic cup for professional clubs',minTier:3,rounds:['Round 2','Round 3','QF','SF','Final']},
  {id:'euro_cup',name:'Europa Elite',icon:'⭐',desc:'Continental prestige for top-tier clubs',minTier:1,rounds:['Group Stage','Last 16','Quarter-Final','Semi-Final','Final']},
];

const MONTHS=['July','August','September','October','November','December','January','February','March','April','May','June'];

const AGE_DESC={15:'Youth academy prodigy — raw talent, enormous ceiling.',16:'Youth academy sensation, turning heads in training.',17:'Breaking into the first team — hungry and determined.',18:'First professional contract — your journey truly starts.',19:'Up-and-coming talent with bags of potential.',20:'Young professional with a point to prove.',21:'Promising career gaining serious momentum.',22:'Entering prime development years — the world is watching.',23:'Honing your craft, ready for a bigger stage.',24:'Consistent performer beginning to attract real attention.',25:'Peak years approaching — every game matters.',26:'Right in the heart of your prime.',27:'Prime season — performing at your absolute best.',28:'Experienced professional, a dressing room leader.',29:'Battle-hardened veteran, wisdom in every touch.',30:'Final chapter — what legacy will you leave?'};

const GOAL_FLAVOUR=['rifled into the top corner from twenty yards','calmly slotted past the helpless keeper','connected with a powerful header from a corner','pulled off a stunning volley that left the crowd breathless','tapped in from close range after a goalmouth scramble','curled a beauty into the far post','chipped the advancing keeper with sublime audacity','finished with a clinical backheel nobody expected'];
const ASSIST_FLAVOUR=['threaded the perfect through ball between two defenders','whipped in a delicious cross to find the run','dummied two players and rolled it into the channel','delivered a perfectly weighted lofted ball over the top'];
const MOTM_FLAVOUR=['dominated every moment from first whistle to last','was simply unplayable tonight — a cut above','dictated the tempo throughout like a conductor','put in a masterclass performance the crowd will not forget','had the stadium on their feet all night long','was everywhere on that pitch — truly remarkable'];

const TRAINING_EVENTS=[
  {icon:'🏋️',title:'Gym Session',detail:'Heavy compound lifts and conditioning circuits.'},
  {icon:'🎯',title:'Finishing Drills',detail:'Clinical work in front of goal — two hundred shots.'},
  {icon:'🏃',title:'Sprint Training',detail:'Explosive pace work — FAT timings looking sharp.'},
  {icon:'🧠',title:'Tactical Session',detail:'Video analysis and detailed positional shadow play.'},
  {icon:'🤸',title:'Recovery & Stretch',detail:'Pool session, foam rolling, and light stretching.'},
  {icon:'🎽',title:'Full Squad Session',detail:'Eleven-v-eleven in training — building chemistry.'},
  {icon:'🧘',title:'Mindfulness Day',detail:'Sports psychologist visit — mental resilience work.'},
  {icon:'🫁',title:'Cardio Block',detail:'5km intervals plus ball-work — lungs burning good.'},
  {icon:'⚽',title:'Small Sided Games',detail:'Five-a-side training — tight spaces sharpening instinct.'},
  {icon:'🎪',title:'Set Piece Practice',detail:'Free-kick and corner routines drilled to perfection.'},
];

const OFFSEASON_EVENTS=[
  {icon:'☀️',title:'Pre-Season Training',detail:'Building the fitness base for the new campaign.'},
  {icon:'🏋️',title:'Strength Block',detail:'Intensive gym phase — adding muscle and power.'},
  {icon:'🌍',title:'Pre-Season Tour',detail:'Training camp abroad — bonding with new teammates.'},
  {icon:'📋',title:'Fitness Testing',detail:'Medical and fitness tests passed with flying colours.'},
  {icon:'⚽',title:'Pre-Season Friendly',detail:'Shaking off the rust — 75 minutes in the legs.'},
  {icon:'🏊',title:'Altitude Camp',detail:'Week in the mountains — lung capacity through the roof.'},
  {icon:'🎯',title:'Technical Bootcamp',detail:'Individual sessions with a specialist coach.'},
];

// ── Investments ──────────────────────────────────────────────
const INVESTMENTS=[
  {id:'inv_pitch',icon:'⚽',name:'Local 5-a-Side Pitch',desc:'A community football pitch that generates steady rental income from leagues and bookings.',cost:45000,weeklyReturn:1200,category:'property'},
  {id:'inv_cafe',icon:'☕',name:'Football Club Café',desc:'A café inside the training ground complex. Popular with fans and staff.',cost:22000,weeklyReturn:600,category:'food'},
  {id:'inv_academy',icon:'🏫',name:'Youth Academy Stake',desc:'A minority stake in a youth football academy. Talent development pays dividends.',cost:80000,weeklyReturn:2000,category:'education'},
  {id:'inv_stocks',icon:'📈',name:'Premier League Club Shares',desc:'A small portfolio of listed football club shares. Volatile but lucrative.',cost:30000,weeklyReturn:900,category:'finance'},
  {id:'inv_kit',icon:'👕',name:'Kit Manufacturing Deal',desc:'Licensing your name to a sports kit line. Royalties every week.',cost:60000,weeklyReturn:1600,category:'brand'},
  {id:'inv_pub',icon:'🍺',name:'Sports Bar',desc:'A bar near the stadium. Full on match days, steady the rest of the week.',cost:140000,weeklyReturn:3400,category:'property'},
  {id:'inv_app',icon:'📱',name:'Football App Investment',desc:'Angel investment in a stats and scouting app startup. High risk, high reward.',cost:95000,weeklyReturn:2400,category:'tech'},
  {id:'inv_stadium',icon:'🏟️',name:'Stadium Naming Rights Deal',desc:'Your name on a community stadium entrance. Prestige and passive income.',cost:250000,weeklyReturn:5500,category:'brand'},
  {id:'inv_hotel',icon:'🏨',name:'Boutique Hotel',desc:'A small hotel near the city centre. Solid occupancy, reliable returns.',cost:380000,weeklyReturn:8500,category:'property'},
  {id:'inv_media',icon:'🎙️',name:'Punditry Contract',desc:'Weekly football punditry on a streaming channel. Your opinion earns money.',cost:12000,weeklyReturn:350,category:'media'},
  {id:'inv_estate',icon:'🏡',name:'Rental Property Portfolio',desc:'Three buy-to-let properties. Tenants pay rent every week without fail.',cost:500000,weeklyReturn:10000,category:'property'},
  {id:'inv_boot',icon:'👟',name:'Boot & Apparel Brand',desc:'Your own boot label — niche, premium, and profitable.',cost:180000,weeklyReturn:4200,category:'brand'},
];

// ── Random Events ─────────────────────────────────────────────
// chance = probability per day (0-1), minDay = earliest it can trigger
const RANDOM_EVENTS=[
  {
    id:'evt_youth_grant',
    icon:'🏛️',
    title:'Government Youth Grant',
    subtitle:'A rare financial windfall',
    body:'A letter arrives at the training ground. You\'ve been selected as a beneficiary of the National Youth Football Development Grant — a government initiative to invest in promising young talent. The amount isn\'t massive, but it\'s yours to keep.',
    chance:0.004,
    minDay:5,
    maxAge:23,
    type:'financial',
    rarity:'rare',
    choices:[
      {label:'💰 Accept the grant',outcome:'You sign the paperwork. £15,000 lands in your account.',fn:'giveGrant'},
      {label:'🙏 Donate it to local youth football',outcome:'You turn it down personally and redirect the funds. +Reputation',fn:'donateGrant'},
    ]
  },
  {
    id:'evt_training_camp',
    icon:'🏰',
    title:'Elite Training Camp Invitation',
    subtitle:'One week with the best',
    body:'Your agent calls with unexpected news. A top-flight club is running a one-week elite training camp and has a spare place after an injury withdrawal. They\'ve heard about your progress and want to bring you in as a guest. It\'d mean missing a week of your regular training, but the facilities and coaching at that level are incomparable.',
    chance:0.003,
    minDay:20,
    type:'development',
    rarity:'rare',
    choices:[
      {label:'✈️ Accept — go to the camp',outcome:'One week of elite coaching. 2 random stats improve significantly.',fn:'acceptTrainingCamp'},
      {label:'🏠 Decline — stay focused here',outcome:'You trust your current setup.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_teammate_injury',
    icon:'🤕',
    title:'Teammate Crisis',
    subtitle:'An unexpected opportunity',
    body:'Your team\'s starting {{position}} has picked up a serious knock in training and will miss the next three weeks. The manager pulls you aside after the session. "You\'re up," he says, tapping your shoulder. "Don\'t waste it." The whole squad is watching.',
    chance:0.008,
    minDay:15,
    type:'selection',
    rarity:'uncommon',
    choices:[
      {label:'💪 Step up — I\'m ready',outcome:'Guaranteed starter for 3 weeks. Perform well and cement your place.',fn:'teammateCrisis'},
    ]
  },
  {
    id:'evt_betting_fixture',
    icon:'🎰',
    title:'Big Match This Weekend',
    subtitle:'A calculated risk',
    body:'Your team faces their fiercest rivals in a crunch fixture that the whole league is watching. A punter outside the ground catches your eye — he runs an unofficial book on local games. Not exactly legal, but nobody\'s ever been caught. The odds are tempting.',
    chance:0.006,
    minDay:30,
    type:'gambling',
    rarity:'uncommon',
    choices:[
      {label:'🎲 Place a bet',outcome:'Risk your money on the match outcome.',fn:'showBetUI'},
      {label:'🚶 Walk away',outcome:'You know better than to gamble on your own game.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_boot_deal',
    icon:'👟',
    title:'Boot Sponsorship Offer',
    subtitle:'Your first commercial deal',
    body:'A sports equipment brand has been watching your performances. They\'ve sent your agent a sponsorship proposal — wear their boots for two seasons and they\'ll pay you a one-off signing fee. It\'s not life-changing money, but it\'s a sign you\'re on the radar.',
    chance:0.004,
    minDay:60,
    type:'financial',
    rarity:'uncommon',
    choices:[
      {label:'✍️ Sign the deal — £8,000',outcome:'£8,000 deposited. First commercial milestone reached.',fn:'bootDeal'},
      {label:'🤔 Hold out for a bigger offer',outcome:'You decline and wait. Maybe something better comes.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_documentary',
    icon:'🎬',
    title:'Documentary Crew Approaches',
    subtitle:'Fifteen minutes of fame',
    body:'A sports documentary production company wants to follow you for a week — they\'re making a series about rising football talent across Europe. It\'d be filmed during training and one match. Exposure is huge, but it might disrupt your focus.',
    chance:0.003,
    minDay:90,
    type:'media',
    rarity:'rare',
    choices:[
      {label:'🎥 Agree to the documentary',outcome:'+£5,000 appearance fee. Morale boost but slight training distraction.',fn:'doDocumentary'},
      {label:'🙅 Keep the focus on football',outcome:'Respectfully declined. Some things are more important.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_agent_upgrade',
    icon:'🤵',
    title:'A-List Agent Makes Contact',
    subtitle:'Your career could change overnight',
    body:'Ricardo Fuentes, one of the most powerful football agents in Europe, personally phones you after watching your last three games on tape. He believes you\'re drastically undervalued and underpaid. His fee is steep — 5% of future earnings — but his network of club contacts is unmatched.',
    chance:0.003,
    minDay:120,
    minOVR:62,
    type:'career',
    rarity:'rare',
    choices:[
      {label:'🤝 Sign with Fuentes',outcome:'Transfer market visibility massively increased. Expect more offers.',fn:'upgradeAgent'},
      {label:'🫱 Stay with current setup',outcome:'You trust your existing team.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_dressing_room_fight',
    icon:'🥊',
    title:'Dressing Room Incident',
    subtitle:'Tensions boil over',
    body:'After a poor performance, things turn heated in the dressing room. A senior player storms over and gets in your face — blaming you for the result. You can see the manager watching from the doorway. Everyone goes silent. Your response in this moment will define how the squad sees you.',
    chance:0.005,
    minDay:20,
    type:'morale',
    rarity:'uncommon',
    choices:[
      {label:'😤 Stand your ground',outcome:'You don\'t back down. The squad respects you. Manager makes note.',fn:'dressRoomFight'},
      {label:'🤐 Let it go, stay professional',outcome:'You keep your head down. Sometimes maturity wins.',fn:'dressRoomCool'},
      {label:'👊 Swing back — settle it',outcome:'Two-week fine. £3,000 deducted. Clubs notice.',fn:'dressRoomSwing'},
    ]
  },
  {
    id:'evt_injury_scare',
    icon:'😰',
    title:'Near Miss on the Training Ground',
    subtitle:'A moment of dread',
    body:'During a heavy training collision, you feel something twitch in your hamstring. The physio rushes on. After ten tense minutes of prodding and scanning, they deliver the verdict — it\'s a minor strain. You got lucky. But the next two weeks need to be managed carefully.',
    chance:0.006,
    minDay:10,
    type:'fitness',
    rarity:'uncommon',
    choices:[
      {label:'🛏️ Rest for two weeks (recommended)',outcome:'5-day recovery. Attribute maintenance preserved.',fn:'restInjury'},
      {label:'💉 Push through with treatment',outcome:'Continue playing. Higher re-injury risk this month.',fn:'playThrough'},
    ]
  },
  {
    id:'evt_charity_match',
    icon:'❤️',
    title:'Charity All-Stars Match',
    subtitle:'Football for a greater cause',
    body:'You\'ve been invited to play in a charity exhibition match featuring several well-known players. There\'s no direct competitive benefit, but the exposure is good — TV cameras will be there — and it genuinely raises money for a children\'s hospital. Your presence would mean a lot.',
    chance:0.004,
    minDay:30,
    type:'community',
    rarity:'uncommon',
    choices:[
      {label:'⚽ Play in the match',outcome:'A wonderful experience. +£2,000 donation in your name. Morale boost.',fn:'charityMatch'},
      {label:'💸 Donate instead but don\'t play',outcome:'£1,000 donation. Less visible but still generous.',fn:'charityDonate'},
      {label:'🚫 Skip it — season focus',outcome:'You prioritise the league campaign.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_pundit_criticism',
    icon:'📺',
    title:'Pundit Goes In on You',
    subtitle:'Public pressure',
    body:'A former professional turned TV pundit dedicates an entire segment to criticising your recent performances. The clip goes viral. Your phone doesn\'t stop. In a press conference, a journalist asks the manager about it directly. How you handle the pressure this week says everything.',
    chance:0.005,
    minDay:60,
    type:'pressure',
    rarity:'uncommon',
    choices:[
      {label:'🎤 Respond publicly with class',outcome:'You tweet a measured reply. Public respects it. Manager approves.',fn:'preditResponse'},
      {label:'🤫 Say nothing — let football speak',outcome:'The best response. You go on a run of strong performances.',fn:'silentResponse'},
      {label:'😡 Fire back aggressively',outcome:'Fine from club: £2,000. Headlines for a week.',fn:'angryResponse'},
    ]
  },
  {
    id:'evt_mystery_investor',
    icon:'💼',
    title:'Mysterious Business Proposition',
    subtitle:'High risk. Potentially high reward.',
    body:'A sharply-dressed stranger approaches you at a club event. He says he has a once-in-a-lifetime business opportunity — an offshore investment scheme that he claims returns 40% in 90 days. He shows you documents. They look official. Something feels slightly off, but the figures are extraordinary.',
    chance:0.002,
    minDay:100,
    type:'financial',
    rarity:'very_rare',
    choices:[
      {label:'💰 Invest £20,000',outcome:'Could double your money... or disappear entirely. 40% chance of success.',fn:'scamInvest'},
      {label:'🕵️ Report it to the club',outcome:'The club praises your integrity. Reputation boost.',fn:'reportScam'},
      {label:'👋 Politely decline',outcome:'Something felt off. You trust your gut.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_loan_offer',
    icon:'🔄',
    title:'Emergency Loan Offer',
    subtitle:'A change of scenery',
    body:'A club two divisions below have had a goalscoring crisis and have approached your club about an emergency loan. The first team have agreed to let you go if you want to. You\'d be playing every week, guaranteed — but at a lower level. Form and confidence could skyrocket.',
    chance:0.006,
    minDay:30,
    type:'career',
    rarity:'uncommon',
    choices:[
      {label:'✈️ Accept the loan move',outcome:'Regular football for 2 months. Stats growth accelerated.',fn:'acceptLoan'},
      {label:'🏠 Stay and fight for your place',outcome:'You believe in your ability at this level.',fn:'declineEvent'},
    ]
  },
  {
    id:'evt_family_news',
    icon:'👨‍👩‍👦',
    title:'News from Home',
    subtitle:'A reminder of what matters',
    body:'Your family calls with unexpected news — your childhood football coach, the person who first spotted you and pushed you to go pro, has been diagnosed with a serious illness. He\'s asked you to come visit before a long hospital stay. It would mean missing one training day.',
    chance:0.003,
    minDay:60,
    type:'personal',
    rarity:'rare',
    choices:[
      {label:'🏠 Go home to see him',outcome:'You skip training. The manager understands. Morale and focus restored.',fn:'goHome'},
      {label:'📞 Call him instead',outcome:'You speak for an hour. He understands. He always said football comes first.',fn:'callHome'},
    ]
  },
  {
    id:'evt_contract_leak',
    icon:'📰',
    title:'Your Contract Has Leaked',
    subtitle:'The whole football world is watching',
    body:'Somehow, the details of your current contract have leaked to a major football news outlet. Your salary, bonus clauses, everything — published online. Fans are divided: some think you\'re overpaid, others think you deserve far more. The dressing room mood is tense.',
    chance:0.003,
    minDay:120,
    type:'media',
    rarity:'rare',
    choices:[
      {label:'😤 Demand a private meeting with the club',outcome:'The club apologises and offers a small loyalty bonus: +£4,000.',fn:'contractLeakMeeting'},
      {label:'🤷 Laugh it off publicly',outcome:'You handle it with humour. Dressing room tensions ease.',fn:'contractLeakLaugh'},
    ]
  },
];

// ── Manager names ─────────────────────────────────────────────
const MANAGER_NAMES=[
  'Tony Halloran','Marco Ferretti','Stuart Mackenzie','Donal Brennan','Lars Olsen',
  'Roberto Aguirre','Pete Whitfield','Hamza Idrissi','George Thornton','Nils Ekberg',
  'Carlos Montes','Barry Colquhoun','Femi Adeyemi','Viktor Novak','Piotr Zawadzki',
];

const MANAGER_TITLES=[
  'Head Coach','First Team Manager','Director of Football','Head Coach & Sporting Director',
];
