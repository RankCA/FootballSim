// ════════════════════════════════════════════════════════════
//  ProPath v4 — data.js
// ════════════════════════════════════════════════════════════

// callupOVR = min OVR needed for national team call-up
const NATIONS=[
  {name:'England',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',callupOVR:82},{name:'Spain',flag:'🇪🇸',callupOVR:83},
  {name:'France',flag:'🇫🇷',callupOVR:83},{name:'Germany',flag:'🇩🇪',callupOVR:82},
  {name:'Italy',flag:'🇮🇹',callupOVR:81},{name:'Brazil',flag:'🇧🇷',callupOVR:84},
  {name:'Argentina',flag:'🇦🇷',callupOVR:83},{name:'Portugal',flag:'🇵🇹',callupOVR:82},
  {name:'Netherlands',flag:'🇳🇱',callupOVR:80},{name:'Belgium',flag:'🇧🇪',callupOVR:79},
  {name:'Uruguay',flag:'🇺🇾',callupOVR:76},{name:'Colombia',flag:'🇨🇴',callupOVR:75},
  {name:'Croatia',flag:'🇭🇷',callupOVR:78},{name:'Denmark',flag:'🇩🇰',callupOVR:77},
  {name:'Switzerland',flag:'🇨🇭',callupOVR:76},{name:'Sweden',flag:'🇸🇪',callupOVR:75},
  {name:'Norway',flag:'🇳🇴',callupOVR:74},{name:'Poland',flag:'🇵🇱',callupOVR:74},
  {name:'Serbia',flag:'🇷🇸',callupOVR:74},{name:'Japan',flag:'🇯🇵',callupOVR:74},
  {name:'South Korea',flag:'🇰🇷',callupOVR:73},{name:'Mexico',flag:'🇲🇽',callupOVR:73},
  {name:'Morocco',flag:'🇲🇦',callupOVR:73},{name:'Scotland',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',callupOVR:73},
  {name:'Turkey',flag:'🇹🇷',callupOVR:71},{name:'USA',flag:'🇺🇸',callupOVR:71},
  {name:'Egypt',flag:'🇪🇬',callupOVR:71},{name:'Ivory Coast',flag:'🇨🇮',callupOVR:71},
  {name:'Wales',flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',callupOVR:72},{name:'Senegal',flag:'🇸🇳',callupOVR:72},
  {name:'Nigeria',flag:'🇳🇬',callupOVR:72},{name:'Austria',flag:'🇦🇹',callupOVR:74},
  {name:'Czech Republic',flag:'🇨🇿',callupOVR:73},{name:'Ukraine',flag:'🇺🇦',callupOVR:74},
  {name:'Hungary',flag:'🇭🇺',callupOVR:70},{name:'Romania',flag:'🇷🇴',callupOVR:70},
  {name:'Greece',flag:'🇬🇷',callupOVR:70},{name:'Finland',flag:'🇫🇮',callupOVR:71},
  {name:'Slovakia',flag:'🇸🇰',callupOVR:70},{name:'Iceland',flag:'🇮🇸',callupOVR:70},
  {name:'Republic of Ireland',flag:'🇮🇪',callupOVR:70},{name:'Cameroon',flag:'🇨🇲',callupOVR:70},
  {name:'Ghana',flag:'🇬🇭',callupOVR:70},{name:'Algeria',flag:'🇩🇿',callupOVR:69},
  {name:'Ecuador',flag:'🇪🇨',callupOVR:69},{name:'Chile',flag:'🇨🇱',callupOVR:70},
  {name:'Peru',flag:'🇵🇪',callupOVR:69},{name:'Paraguay',flag:'🇵🇾',callupOVR:68},
  {name:'Venezuela',flag:'🇻🇪',callupOVR:67},{name:'Australia',flag:'🇦🇺',callupOVR:68},
  {name:'Canada',flag:'🇨🇦',callupOVR:67},{name:'Saudi Arabia',flag:'🇸🇦',callupOVR:67},
  {name:'Iran',flag:'🇮🇷',callupOVR:68},{name:'Tunisia',flag:'🇹🇳',callupOVR:67},
  {name:'Mali',flag:'🇲🇱',callupOVR:66},{name:'Jamaica',flag:'🇯🇲',callupOVR:65},
  {name:'Albania',flag:'🇦🇱',callupOVR:66},{name:'North Macedonia',flag:'🇲🇰',callupOVR:65},
  {name:'Bolivia',flag:'🇧🇴',callupOVR:63},{name:'Zambia',flag:'🇿🇲',callupOVR:62},
  {name:'China',flag:'🇨🇳',callupOVR:64},{name:'Tanzania',flag:'🇹🇿',callupOVR:60},
  {name:'Kosovo',flag:'🇽🇰',callupOVR:64},{name:'Russia',flag:'🇷🇺',callupOVR:73},
];

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
  5:['Stevenage Youth','Harrogate Town Academy','Fleetwood Town Academy','Morecambe Academy','Aldershot Town','Barnet FC','Boreham Wood','Dover Athletic','Woking FC','Bromley Academy','Dagenham & Redbridge','Ebbsfleet United','Eastleigh FC','FC Halifax Town','Hartlepool Academy','Maidenhead United','Oldham Athletic','Solihull Moors','Torquay United','Wrexham Academy','York City Academy','Kidderminster Harriers'],
  4:['Grimsby Town','Crawley Town','Swindon Town','Bradford City','Barrow AFC','Doncaster Rovers','AFC Wimbledon','Colchester United','Salford City','Accrington Stanley','Carlisle United','Crewe Alexandra','Forest Green Rovers','Gillingham FC','Mansfield Town','MK Dons','Newport County','Northampton Town','Port Vale','Rochdale AFC','Stockport County','Tranmere Rovers'],
  3:['Portsmouth','Charlton Athletic','Lincoln City','Shrewsbury Town','Peterborough Utd','Oxford United','Exeter City','Derby County','Bristol Rovers','Barnsley FC','Bolton Wanderers','Burton Albion','Cambridge United','Cheltenham Town','Fleetwood Town','Leyton Orient','Plymouth Argyle','Reading FC','Rotherham United','Wigan Athletic','Wycombe Wanderers','Stevenage FC'],
  2:['Southampton','Leeds United','Burnley','Sheffield United','Middlesbrough','Coventry City','Preston NE','Stoke City','Millwall','Swansea City','Birmingham City','Blackburn Rovers','Blackpool FC','Cardiff City','Huddersfield Town','Hull City','Luton Town','Norwich City','QPR','Sheffield Wednesday','Sunderland AFC','Watford FC','West Brom','Bristol City','Nottm Forest'],
  1:['Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham Hotspur','Newcastle United','Aston Villa','West Ham United','Brighton & Hove Albion','Brentford FC','Crystal Palace','Everton FC','Fulham FC','Leicester City','Nottingham Forest','Wolverhampton W','Bournemouth AFC','Ipswich Town','Sheffield United'],
};

const CUPS=[
  {id:'fa_cup',name:'The Knockout Cup',icon:'🏆',desc:'The oldest cup competition.',minTier:4,rounds:['Round 3','Round 4','Round 5','QF','SF','Final']},
  {id:'league_cup',name:'League Shield',icon:'🥇',desc:'Domestic cup for professional clubs.',minTier:3,rounds:['Round 2','Round 3','QF','SF','Final']},
  {id:'euro_cup',name:'Europa Elite',icon:'⭐',desc:'Continental prestige for top clubs.',minTier:1,rounds:['Group Stage','Last 16','QF','SF','Final']},
];

const MONTHS=['July','August','September','October','November','December','January','February','March','April','May','June'];

const AGE_DESC={15:'Youth academy prodigy — raw talent, enormous ceiling.',16:'Youth academy sensation, turning heads in training.',17:'Breaking into the first team — hungry and determined.',18:'First professional contract — your journey truly starts.',19:'Up-and-coming talent with bags of potential.',20:'Young professional with a point to prove.',21:'Promising career gaining serious momentum.',22:'Entering prime development years — the world is watching.',23:'Honing your craft, ready for a bigger stage.',24:'Consistent performer beginning to attract real attention.',25:'Peak years approaching — every game matters.',26:'Right in the heart of your prime.',27:'Prime season — performing at your absolute best.',28:'Experienced professional, a dressing room leader.',29:'Battle-hardened veteran, wisdom in every touch.',30:'Final chapter — what legacy will you leave?'};

const GOAL_FLAVOUR=['rifled into the top corner from twenty yards','calmly slotted past the helpless keeper','connected with a powerful header from a corner','pulled off a stunning volley that left the crowd breathless','tapped in from close range after a scramble','curled a beauty into the far post','chipped the advancing keeper with sublime audacity','finished with a clinical backheel nobody expected'];
const ASSIST_FLAVOUR=['threaded the perfect through ball between two defenders','whipped in a delicious cross to find the run','dummied two players and rolled it into the channel','delivered a perfectly weighted lofted ball over the top'];
const MOTM_FLAVOUR=['dominated every moment from first whistle to last','was simply unplayable tonight — a cut above','dictated the tempo throughout like a conductor','put in a masterclass the crowd will not forget','had the stadium on their feet all night','was everywhere on that pitch — truly remarkable'];

const TRAINING_EVENTS=[
  {icon:'🏋️',title:'Gym Session',detail:'Heavy compound lifts and conditioning circuits.'},
  {icon:'🎯',title:'Finishing Drills',detail:'Clinical work in front of goal — two hundred shots.'},
  {icon:'🏃',title:'Sprint Training',detail:'Explosive pace work — FAT timings looking sharp.'},
  {icon:'🧠',title:'Tactical Session',detail:'Video analysis and positional shadow play.'},
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

const INVESTMENTS=[
  {id:'inv_media',icon:'🎙️',name:'Punditry Contract',desc:'Weekly football punditry on a streaming channel.',cost:12000,weeklyReturn:350,category:'media'},
  {id:'inv_cafe',icon:'☕',name:'Football Club Café',desc:'A café inside the training ground complex.',cost:22000,weeklyReturn:600,category:'food'},
  {id:'inv_stocks',icon:'📈',name:'Premier League Club Shares',desc:'A small portfolio of listed football club shares.',cost:30000,weeklyReturn:900,category:'finance'},
  {id:'inv_pitch',icon:'⚽',name:'Local 5-a-Side Pitch',desc:'Community pitch generating steady rental income.',cost:45000,weeklyReturn:1200,category:'property'},
  {id:'inv_kit',icon:'👕',name:'Kit Manufacturing Deal',desc:'Licensing your name to a sports kit line.',cost:60000,weeklyReturn:1600,category:'brand'},
  {id:'inv_academy',icon:'🏫',name:'Youth Academy Stake',desc:'A minority stake in a youth football academy.',cost:80000,weeklyReturn:2000,category:'education'},
  {id:'inv_app',icon:'📱',name:'Football App Investment',desc:'Angel investment in a stats and scouting app.',cost:95000,weeklyReturn:2400,category:'tech'},
  {id:'inv_pub',icon:'🍺',name:'Sports Bar',desc:'A bar near the stadium — packed on match days.',cost:140000,weeklyReturn:3400,category:'property'},
  {id:'inv_boot',icon:'👟',name:'Boot & Apparel Brand',desc:'Your own boot label — niche, premium, profitable.',cost:180000,weeklyReturn:4200,category:'brand'},
  {id:'inv_stadium',icon:'🏟️',name:'Stadium Naming Rights',desc:'Your name on a community stadium entrance.',cost:250000,weeklyReturn:5500,category:'brand'},
  {id:'inv_hotel',icon:'🏨',name:'Boutique Hotel',desc:'Small hotel near city centre. Solid reliable returns.',cost:380000,weeklyReturn:8500,category:'property'},
  {id:'inv_estate',icon:'🏡',name:'Rental Property Portfolio',desc:'Three buy-to-let properties. Weekly rent, always.',cost:500000,weeklyReturn:10000,category:'property'},
];

const MANAGER_NAMES=[
  'Tony Halloran','Marco Ferretti','Stuart Mackenzie','Donal Brennan','Lars Olsen',
  'Roberto Aguirre','Pete Whitfield','Hamza Idrissi','George Thornton','Nils Ekberg',
  'Carlos Montes','Barry Colquhoun','Femi Adeyemi','Viktor Novak','Piotr Zawadzki',
  'Diego Ruiz','Kenji Watanabe','Alain Bertrand','Rory Gallagher','Tomasz Krawczyk',
  'Bogdan Ionescu','Sven Holmberg','Christophe Renard','Eamonn Walsh','Mikael Borg',
  'Andrei Popescu','Josef Blaha','Luca Romano','Callum Fraser','Idris Mensah',
];
const MANAGER_TITLES=['Head Coach','First Team Manager','Director of Football & Head Coach'];

// World Cup rounds
const WC_ROUNDS=['Group Stage','Round of 16','Quarter-Final','Semi-Final','Final'];

const RANDOM_EVENTS=[
  {id:'evt_youth_grant',icon:'🏛️',title:'Government Youth Grant',subtitle:'A rare financial windfall',
   body:"A letter arrives at the training ground. You've been selected as a beneficiary of the National Youth Football Development Grant.",
   chance:0.004,minDay:5,maxAge:23,type:'financial',rarity:'rare',unique:true,
   choices:[{label:'💰 Accept the grant',outcome:'£15,000 lands in your account.',fn:'giveGrant'},{label:'🙏 Donate it to grassroots football',outcome:'Goodwill and reputation earned.',fn:'donateGrant'}]},

  {id:'evt_training_camp',icon:'🏰',title:'Elite Training Camp Invitation',subtitle:'One week with the best',
   body:"Your agent calls with unexpected news. A top-flight club running an elite training camp has a spare place — they've heard about your progress and want you in as a guest.",
   chance:0.003,minDay:20,type:'development',rarity:'rare',
   choices:[{label:'✈️ Accept — go to the camp',outcome:'2 random stats improve significantly.',fn:'acceptTrainingCamp'},{label:'🏠 Decline — stay focused here',outcome:'You trust your current setup.',fn:'declineEvent'}]},

  {id:'evt_teammate_injury',icon:'🤕',title:'Teammate Crisis',subtitle:'An unexpected opportunity',
   body:"Your team's starting player has picked up a serious knock in training. The manager pulls you aside. \"You're up,\" he says, tapping your shoulder. \"The whole squad is watching.\"",
   chance:0.008,minDay:15,type:'selection',rarity:'uncommon',
   choices:[{label:"💪 Step up — I'm ready",outcome:'Guaranteed starter for 3 weeks.',fn:'teammateCrisis'}]},

  {id:'evt_betting_fixture',icon:'🎰',title:'Big Match This Weekend',subtitle:'A calculated risk',
   body:"Your team faces their fiercest rivals in a crunch fixture. A punter outside the ground catches your eye — he runs an unofficial book on local games.",
   chance:0.006,minDay:30,type:'gambling',rarity:'uncommon',
   choices:[{label:'🎲 Place a bet',outcome:'Risk your money on the match outcome.',fn:'showBetUI'},{label:'🚶 Walk away',outcome:"You know better than to gamble on your own game.",fn:'declineEvent'}]},

  {id:'evt_boot_deal',icon:'👟',title:'Boot Sponsorship Offer',subtitle:'Your first commercial deal',
   body:"A sports equipment brand has been watching your performances. They've sent your agent a sponsorship proposal — wear their boots for two seasons and they'll pay a signing fee.",
   chance:0.004,minDay:60,type:'financial',rarity:'uncommon',unique:true,
   choices:[{label:'✍️ Sign the deal — £8,000',outcome:'£8,000 deposited. First commercial milestone.',fn:'bootDeal'},{label:'🤔 Hold out for a bigger offer',outcome:'You decline and wait.',fn:'declineEvent'}]},

  {id:'evt_documentary',icon:'🎬',title:'Documentary Crew Approaches',subtitle:'Fifteen minutes of fame',
   body:"A sports documentary company wants to follow you for a week — making a series about rising football talent. The exposure is huge, but it might disrupt your focus.",
   chance:0.003,minDay:90,type:'media',rarity:'rare',
   choices:[{label:'🎥 Agree to the documentary',outcome:'+£5,000 appearance fee.',fn:'doDocumentary'},{label:'🙅 Keep the focus on football',outcome:'Respectfully declined.',fn:'declineEvent'}]},

  {id:'evt_agent_upgrade',icon:'🤵',title:'A-List Agent Makes Contact',subtitle:'Your career could change overnight',
   body:"Ricardo Fuentes, one of the most powerful football agents in Europe, personally phones you. His network of club contacts is unmatched.",
   chance:0.003,minDay:120,minOVR:62,type:'career',rarity:'rare',unique:true,
   choices:[{label:'🤝 Sign with Fuentes',outcome:'Transfer market visibility massively increased.',fn:'upgradeAgent'},{label:'🫱 Stay with current setup',outcome:'You trust your existing team.',fn:'declineEvent'}]},

  {id:'evt_dressing_room_fight',icon:'🥊',title:'Dressing Room Incident',subtitle:'Tensions boil over',
   body:"After a poor performance, a senior player gets in your face — blaming you for the result. The manager is watching from the doorway. Your response in this moment will define how the squad sees you.",
   chance:0.005,minDay:20,type:'morale',rarity:'uncommon',
   choices:[{label:'😤 Stand your ground',outcome:'The squad respects you.',fn:'dressRoomFight'},{label:'🤐 Stay professional',outcome:'Maturity wins.',fn:'dressRoomCool'},{label:'👊 Swing back',outcome:'Fine from club: £3,000.',fn:'dressRoomSwing'}]},

  {id:'evt_injury_scare',icon:'😰',title:'Near Miss on the Training Ground',subtitle:'A moment of dread',
   body:"During a heavy training collision, you feel something twitch in your hamstring. After ten tense minutes, the verdict arrives — minor strain. You got lucky. Two weeks of careful management needed.",
   chance:0.006,minDay:10,type:'fitness',rarity:'uncommon',
   choices:[{label:'🛏️ Rest for two weeks (recommended)',outcome:'5-day recovery. Fully cleared.',fn:'restInjury'},{label:'💉 Push through with treatment',outcome:'Continue playing. Higher re-injury risk.',fn:'playThrough'}]},

  {id:'evt_charity_match',icon:'❤️',title:'Charity All-Stars Match',subtitle:'Football for a greater cause',
   body:"You've been invited to play in a charity exhibition match. TV cameras will be there and it raises money for a children's hospital.",
   chance:0.004,minDay:30,type:'community',rarity:'uncommon',
   choices:[{label:'⚽ Play in the match',outcome:'+£2,000 donated in your name.',fn:'charityMatch'},{label:'💸 Donate instead',outcome:'£1,000 donation.',fn:'charityDonate'},{label:'🚫 Skip it',outcome:'You prioritise the league campaign.',fn:'declineEvent'}]},

  {id:'evt_pundit_criticism',icon:'📺',title:'Pundit Goes In on You',subtitle:'Public pressure',
   body:"A former pro turned TV pundit dedicates an entire segment to criticising your recent performances. The clip goes viral.",
   chance:0.005,minDay:60,type:'pressure',rarity:'uncommon',
   choices:[{label:'🎤 Respond publicly with class',outcome:'Public respects it.',fn:'preditResponse'},{label:'🤫 Say nothing — let football speak',outcome:'You go on a run of strong performances.',fn:'silentResponse'},{label:'😡 Fire back aggressively',outcome:'Fine from club: £2,000.',fn:'angryResponse'}]},

  {id:'evt_mystery_investor',icon:'💼',title:'Mysterious Business Proposition',subtitle:'High risk. Potentially high reward.',
   body:"A sharply-dressed stranger approaches at a club event with a once-in-a-lifetime offshore investment scheme claiming 40% returns in 90 days. Something feels slightly off.",
   chance:0.002,minDay:100,type:'financial',rarity:'very_rare',unique:true,
   choices:[{label:'💰 Invest £20,000',outcome:'40% chance of big returns. 60% chance it vanishes.',fn:'scamInvest'},{label:'🕵️ Report it to the club',outcome:'Club praises your integrity.',fn:'reportScam'},{label:'👋 Politely decline',outcome:'Something felt off.',fn:'declineEvent'}]},

  {id:'evt_loan_offer',icon:'🔄',title:'Emergency Loan Offer',subtitle:'A change of scenery',
   body:"A club two divisions below have had a goalscoring crisis. They've approached about an emergency loan — you'd play every week but at a lower level.",
   chance:0.006,minDay:30,type:'career',rarity:'uncommon',
   choices:[{label:'✈️ Accept the loan move',outcome:'Regular football for 2 months. Stats growth accelerated.',fn:'acceptLoan'},{label:'🏠 Stay and fight for your place',outcome:'You believe in your ability.',fn:'declineEvent'}]},

  {id:'evt_family_news',icon:'👨‍👩‍👦',title:'News from Home',subtitle:'A reminder of what matters',
   body:"Your childhood football coach — the person who first spotted you — has been diagnosed with a serious illness. He's asked you to come visit.",
   chance:0.003,minDay:60,type:'personal',rarity:'rare',
   choices:[{label:'🏠 Go home to see him',outcome:'You skip training. The manager understands.',fn:'goHome'},{label:'📞 Call him instead',outcome:'An hour-long call. He was proud.',fn:'callHome'}]},

  {id:'evt_contract_leak',icon:'📰',title:'Your Contract Has Leaked',subtitle:'The whole football world is watching',
   body:"Your salary and bonus clauses have been published online. Fans are divided. The dressing room mood is tense.",
   chance:0.003,minDay:120,type:'media',rarity:'rare',
   choices:[{label:'😤 Demand a private meeting with the club',outcome:'Club apologises. +£4,000 loyalty bonus.',fn:'contractLeakMeeting'},{label:'🤷 Laugh it off publicly',outcome:'Tensions ease.',fn:'contractLeakLaugh'}]},

  // ── NEW EVENTS ──────────────────────────────────────────────────────────────
  {id:'evt_wonder_goal_viral',icon:'🌠',title:'That Goal Is Going Viral',subtitle:'A moment of pure magic',
   body:"You scored an absolutely stunning goal last match — it's been viewed eighteen million times in twelve hours. Brands are calling your agent. Your face is on the front of every sports newspaper.",
   chance:0.004,minDay:40,type:'media',rarity:'uncommon',
   choices:[{label:'📱 Embrace the attention',outcome:'+£5,000 from engagement deals.',fn:'embraceViral'},{label:'😄 Enjoy it quietly',outcome:'The football did the talking.',fn:'declineEvent'}]},

  {id:'evt_sports_science',icon:'🔬',title:'Sports Science Breakthrough',subtitle:'The future of performance',
   body:"A cutting-edge sports science company wants you as a test subject for a new legal performance programme — tailored nutrition, bespoke recovery protocols. Early results have been remarkable.",
   chance:0.003,minDay:50,type:'development',rarity:'rare',
   choices:[{label:'🧬 Enrol in the programme — £12,000',outcome:'6-week programme. 3 stats improve noticeably.',fn:'sportsScience'},{label:"🤔 Stick to conventional methods",outcome:"If it ain't broken...",fn:'declineEvent'}]},

  {id:'evt_sponsor_controversy',icon:'💣',title:'Sponsor Controversy',subtitle:'Your name is everywhere — for the wrong reasons',
   body:"A video of you at a private event surfaces online and goes viral for embarrassing reasons. Your boot sponsor is threatening to terminate the deal. Every tabloid has the story.",
   chance:0.003,minDay:80,type:'media',rarity:'rare',
   choices:[{label:'📣 Hire a PR firm — £8,000',outcome:'Professional damage control. Story dies within days.',fn:'hirePR'},{label:'😭 Issue a public apology',outcome:'Honest and humble. Fan respect restored.',fn:'publicApology'},{label:'🤐 Refuse to engage',outcome:'A week of bad press. Eventually forgotten.',fn:'ignoreControversy'}]},

  {id:'evt_tax_investigation',icon:'⚖️',title:'Tax Investigation',subtitle:'HMRC has questions',
   body:"Out of nowhere, a registered letter arrives from the tax authority. A discrepancy in your financial affairs. Your accountant says it's likely an honest error, but it needs resolving.",
   chance:0.002,minDay:150,type:'financial',rarity:'rare',
   choices:[{label:'📑 Hire specialist accountant — £10,000',outcome:'Resolved cleanly. No further action.',fn:'hireTaxAccountant'},{label:'🤷 Handle it yourself',outcome:'You sort it but miss something. £5,000 penalty.',fn:'selfHandleTax'}]},

  {id:'evt_record_transfer',icon:'💎',title:'Record Breaking Transfer Offer',subtitle:'A number that changes everything',
   body:"Your phone rings at 11pm. It's your agent. A massive club has submitted an extraordinary offer that triggers your release clause. Uprooting your life — but the money and opportunity are once-in-a-lifetime.",
   chance:0.002,minDay:100,minOVR:78,type:'career',rarity:'very_rare',unique:true,
   choices:[{label:'✍️ Accept — sign for the big club',outcome:'Life-changing transfer. Salary ×3.',fn:'acceptRecordTransfer'},{label:'🏠 Stay loyal — turn it down',outcome:'The club are stunned and grateful. Loyalty bonus negotiated.',fn:'stayLoyal'}]},

  {id:'evt_career_ending_injury',icon:'🚑',title:'SERIOUS INJURY',subtitle:'The worst possible news',
   body:"In a 50-50 challenge, you hear a sickening crack. Extensive scans deliver the diagnosis: a complete ACL rupture. You're looking at 8 months minimum on the sidelines. Your career may never be the same.",
   chance:0.0007,minDay:20,type:'fitness',rarity:'very_rare',unique:true,
   choices:[{label:'🏥 Begin rehabilitation immediately',outcome:'8-month recovery begins.',fn:'careerEndingInjury'},{label:'💔 Retire due to injury',outcome:'The hardest decision any footballer can face.',fn:'retireInjury'}]},

  {id:'evt_tragic_death',icon:'💀',title:'THE FINAL WHISTLE',subtitle:'Some things are beyond football',
   body:"During a routine morning training run, you collapse. Medical staff respond immediately, but it is already too late. A previously undetected heart condition has ended your story at the cruellest possible moment.\n\n\"He loved this game more than anything.\" — Manager's tribute.",
   chance:0.00005,minDay:30,type:'personal',rarity:'legendary',unique:true,
   choices:[{label:'🕯️ Enter the Hall of Fame',outcome:'Your story will live forever.',fn:'tragicDeath'}]},
];
