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
  {name:'Somalia',flag:'🇸🇴',callupOVR:65},{name:'India',flag:'🇮🇳',callupOVR:60},
  {name:'Panama',flag:'🇵🇦',callupOVR:74},{name:'DRC',flag:'🇨🇩',callupOVR:74}
];

const POSITIONS=[{acronym:'CB',name:'Centre Back'},{acronym:'LB',name:'Left Back'},{acronym:'RB',name:'Right Back'},{acronym:'CDM',name:'Def. Midfielder'},{acronym:'CM',name:'Centre Mid'},{acronym:'CAM',name:'Att. Midfielder'},{acronym:'LW',name:'Left Winger'},{acronym:'RW',name:'Right Winger'},{acronym:'CF',name:'Centre Forward'},{acronym:'ST',name:'Striker'}];

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

// Foreign leagues — not part of the domestic pyramid; accessed via transfer/events
const FOREIGN_LEAGUES=[
  {id:'LL1',name:'La Liga',country:'Spain',flag:'🇪🇸',tier:1,size:20,clubs:['Real Madrid','FC Barcelona','Atlético de Madrid','Sevilla FC','Real Betis','Real Sociedad','Athletic Club','Villarreal CF','Valencia CF','Celta Vigo','Rayo Vallecano','Osasuna','Getafe CF','Mallorca','Girona FC','Deportivo Alavés','Cádiz CF','Almería','Las Palmas','Espanyol']},
  {id:'SA1',name:'Serie A',country:'Italy',flag:'🇮🇹',tier:1,size:20,clubs:['Inter Milan','AC Milan','Juventus','Napoli','Lazio','AS Roma','Atalanta','Fiorentina','Bologna','Torino','Monza','Udinese','Sassuolo','Empoli','Lecce','Salernitana','Cagliari','Frosinone','Verona','Genoa']},
];

const CLUBS={
  5:['Stevenage Youth','Harrogate Town Academy','Fleetwood Town Academy','Morecambe Academy','Aldershot Town','Barnet FC','Boreham Wood','Dover Athletic','Woking FC','Bromley Academy','Dagenham & Redbridge','Ebbsfleet United','Eastleigh FC','FC Halifax Town','Hartlepool Academy','Maidenhead United','Oldham Athletic','Solihull Moors','Torquay United','Wrexham Academy','York City Academy','Kidderminster Harriers'],
  4:['Grimsby Town','Crawley Town','Swindon Town','Bradford City','Barrow AFC','Doncaster Rovers','AFC Wimbledon','Colchester United','Salford City','Accrington Stanley','Carlisle United','Crewe Alexandra','Forest Green Rovers','Gillingham FC','Mansfield Town','MK Dons','Newport County','Northampton Town','Port Vale','Rochdale AFC','Stockport County','Tranmere Rovers'],
  3:['Portsmouth','Charlton Athletic','Lincoln City','Shrewsbury Town','Peterborough Utd','Oxford United','Exeter City','Derby County','Bristol Rovers','Barnsley FC','Bolton Wanderers','Burton Albion','Cambridge United','Cheltenham Town','Fleetwood Town','Leyton Orient','Plymouth Argyle','Reading FC','Rotherham United','Wigan Athletic','Wycombe Wanderers','Stevenage FC'],
  2:['Southampton','Leeds United','Burnley','Sheffield United','Middlesbrough','Coventry City','Preston NE','Stoke City','Millwall','Swansea City','Birmingham City','Blackburn Rovers','Blackpool FC','Cardiff City','Huddersfield Town','Hull City','Luton Town','Norwich City','QPR','Sheffield Wednesday','Sunderland AFC','Watford FC','West Brom','Bristol City','Nottm Forest'],
  1:['Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham Hotspur','Newcastle United','Aston Villa','West Ham United','Brighton & Hove Albion','Brentford FC','Crystal Palace','Everton FC','Fulham FC','Leicester City','Nottingham Forest','Wolverhampton W','Bournemouth AFC','Ipswich Town','Sheffield United'],
};

const CUPS=[
  {id:'fa_cup',name:'FA Cup',icon:'🏆',desc:'The oldest cup competition in football.',minTier:4,rounds:['Round 3','Round 4','Round 5','Quarter-Final','Semi-Final','Final']},
  {id:'league_cup',name:'EFL Cup',icon:'🥇',desc:'The League Cup — all 92 Football League clubs compete.',minTier:3,rounds:['Round 2','Round 3','Quarter-Final','Semi-Final','Final']},
  // Champions League: only tier-1 clubs that finished top 4 previous season qualify
  {id:'euro_cup',name:'Champions League',icon:'⭐',desc:'The pinnacle of European club football.',minTier:1,euroQualify:true,rounds:['Group Stage','Round of 16','Quarter-Final','Semi-Final','Final']},
];

const MONTHS=['July','August','September','October','November','December','January','February','March','April','May','June'];

const AGE_DESC={15:'Youth academy prodigy — raw talent, enormous ceiling.',16:'Youth academy sensation, turning heads in training.',17:'Breaking into the first team — hungry and determined.',18:'First professional contract — your journey truly starts.',19:'Up-and-coming talent with bags of potential.',20:'Young professional with a point to prove.',21:'Promising career gaining serious momentum.',22:'Entering prime development years — the world is watching.',23:'Honing your craft, ready for a bigger stage.',24:'Consistent performer beginning to attract real attention.',25:'Peak years approaching — every game matters.',26:'Right in the heart of your prime.',27:'Prime season — performing at your absolute best.',28:'Experienced professional, a dressing room leader.',29:'Battle-hardened veteran, wisdom in every touch.',30:'Final chapter — what legacy will you leave?'};

const GOAL_FLAVOUR=['rifled into the top corner from twenty yards','calmly slotted past the helpless keeper','connected with a powerful header from a corner','pulled off a stunning volley that left the crowd breathless','tapped in from close range after a scramble','curled a beauty into the far post','chipped the advancing keeper with sublime audacity','finished with a clinical backheel nobody expected'];
const ASSIST_FLAVOUR=['threaded the perfect through ball between two defenders','whipped in a delicious cross to find the run','dummied two players and rolled it into the channel','delivered a perfectly weighted lofted ball over the top'];
const MOTM_FLAVOUR=['dominated every moment from first whistle to last','was simply unplayable tonight — a cut above','dictated the tempo throughout like a conductor','put in a masterclass the crowd will not forget','had the stadium on their feet all night','was everywhere on that pitch — truly remarkable'];

const DEF_FLAVOUR=['put in a commanding defensive display','won every aerial duel in the air','made a crucial last-ditch tackle that preserved the clean sheet','read every ball perfectly — opponents got nothing','snuffed out the danger with an inch-perfect interception','marshalled the defence brilliantly from the back','blocked two goalbound efforts with his body','won his individual battle convincingly all match'];
const DEF_STAT_FLAVOUR=['Tackles: %d · Clearances: %d','%d interceptions, %d clearances','%d blocks · %d aerial duels won','Won %d/%d individual duels — commanding.','%d successful headers · solid all round'];
const MID_FLAVOUR=['dictated play from deep with calm authority','linked the lines brilliantly, always an option','drove forward and was a constant threat','won the midfield battle convincingly','covered every blade of grass — tireless engine','distributed intelligently, keeping the tempo high','pressed relentlessly and won the ball back repeatedly','showed composure in tight spaces throughout'];
const MID_STAT_FLAVOUR=['%d/%d pass accuracy · %d key passes','Completed %d of %d passes in tight spaces','%d successful dribbles · %d chances created','%d duels won in midfield — dominant'];

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
   body:"Your team's starting player has picked up a serious knock in training. The manager pulls you aside. You're up, he says, tapping your shoulder. The whole squad is watching.",
   // Only fire when not already a guaranteed starter AND manager doesn't already favour you heavily
   condition:()=>(G.forcedStarter||0)<7&&E.managerOpinion(G.player.overall,G.manager.teamAvgOVR).opinion!=='favourable',
   chance:0.008,minDay:15,type:'selection',rarity:'uncommon',
   choices:[{label:"💪 Step up — I'm ready",outcome:'Guaranteed starter for 3 weeks.',fn:'teammateCrisis'}]},

  {id:'evt_betting_fixture',icon:'🎰',title:'Big Match This Weekend',subtitle:'A calculated risk',
   body:"Your team faces their fiercest rivals in a crunch fixture. A punter outside the ground catches your eye — he runs an unofficial book on local games.",
   chance:0.006,minDay:30,type:'gambling',rarity:'uncommon',
   choices:[{label:'🎲 Place a bet',outcome:'Risk your money on the match outcome.',fn:'showBetUI'},{label:'🚶 Walk away',outcome:"You know better than to gamble on your own game.",fn:'declineEvent'}]},

  {id:'evt_boot_deal',icon:'👟',title:'Boot Sponsorship Offer',subtitle:'Your first commercial deal',
   body:"A sports equipment brand has been watching your performances. They've sent your agent a sponsorship proposal — wear their boots for two seasons and they'll pay a signing fee.",
   condition:()=>!G.triggeredEvents.has('evt_boot_deal'),
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
   // Only fire when not already injured
   condition:()=>(G.injuryDaysLeft||0)===0&&(G.careerInjuryMonthsLeft||0)===0,
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
   body:"A club two divisions below are in a goalscoring crisis and need a player of your quality immediately. Your parent club has agreed in principle. Two months of guaranteed first-team football — at a lower level, but every game counts.",
   // Only available for top 2 tiers — loan goes 2 tiers down to tier 3 or 4 (still professional)
   condition:()=>G.club.tier<=2&&!G.loanActive,
   chance:0.006,minDay:30,type:'career',rarity:'uncommon',
   choices:[{label:'✈️ Accept the loan — regular football awaits',outcome:'Move to a club 2 tiers down for 60 days. Guaranteed starts. Growth accelerated.',fn:'acceptLoan'},{label:'🏠 Stay and fight for your place',outcome:'You believe in your ability to break through here.',fn:'declineEvent'}]},

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
   condition:()=>G.seasonStats.goals>=1,
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
   condition:()=>!G.loanActive,
   chance:0.002,minDay:100,minOVR:78,type:'career',rarity:'very_rare',unique:true,
   choices:[{label:'✍️ Accept — sign for the big club',outcome:'Life-changing transfer. Salary ×3.',fn:'acceptRecordTransfer'},{label:'🏠 Stay loyal — turn it down',outcome:'The club are stunned and grateful. Loyalty bonus negotiated.',fn:'stayLoyal'}]},

  {id:'evt_career_ending_injury',icon:'🚑',title:'SERIOUS INJURY',subtitle:'The worst possible news',
   body:"In a 50-50 challenge, you hear a sickening crack. Extensive scans deliver the diagnosis: a complete ACL rupture. You're looking at 8 months minimum on the sidelines. Your career may never be the same.",
   condition:()=>(G.injuryDaysLeft||0)===0&&(G.careerInjuryMonthsLeft||0)===0&&!G.loanActive,
   chance:0.0007,minDay:20,type:'fitness',rarity:'very_rare',unique:true,
   choices:[{label:'🏥 Begin rehabilitation immediately',outcome:'8-month recovery begins.',fn:'careerEndingInjury'},{label:'💔 Retire due to injury',outcome:'The hardest decision any footballer can face.',fn:'retireInjury'}]},

  {id:'evt_tragic_death',icon:'💀',title:'THE FINAL WHISTLE',subtitle:'Some things are beyond football',
   body:"During a routine morning training run, you collapse. Medical staff respond immediately, but it is already too late. A previously undetected heart condition has ended your story at the cruellest possible moment.\n\nHe loved this game more than anything. — Manager's tribute.",
   chance:0.00005,minDay:30,type:'personal',rarity:'legendary',unique:true,
   choices:[{label:'🕯️ Enter the Hall of Fame',outcome:'Your story will live forever.',fn:'tragicDeath'}]},

  // ── EXTENDED EVENTS ──────────────────────────────────────────────────────────────
  {id:'evt_captain_offer',icon:'🏅',title:'Captaincy Offer',subtitle:'The armband is yours',
   body:"The manager calls you into his office. I want you to lead this team. You've got the respect of the dressing room and I think you're ready. The armband is on the table.",
   chance:0.003,minDay:60,minOVR:65,type:'career',rarity:'rare',unique:true,
   choices:[{label:'🏅 Accept — wear the armband',outcome:'Club captain. Morale boost. +£3,000 bonus.',fn:'acceptCaptaincy'},{label:'🙏 Decline gracefully',outcome:'You appreciate the offer but prefer to lead by example.',fn:'declineEvent'}]},

  {id:'evt_social_media_storm',icon:'📱',title:'Your Post Went Viral For the Wrong Reasons',subtitle:'One tweet, infinite consequences',
   body:"A late-night social media post — meant to be funny — has been screenshotted, decontextualised, and spread across every sports outlet in the country. Your phone is exploding.",
   chance:0.004,minDay:30,type:'media',rarity:'uncommon',
   choices:[{label:'🗑️ Delete and issue an apology',outcome:'Managed quickly. Mostly forgotten in 48 hours.',fn:'publicApology'},{label:'💪 Double down — you meant it',outcome:'Controversial but authentic. Divides opinion.',fn:'ignoreControversy'},{label:'📣 Hire the PR firm (£8,000)',outcome:'Crisis managed professionally. Sponsors relieved.',fn:'hirePR'}]},

  {id:'evt_testimonial',icon:'🎖️',title:'Club Legend Testimonial',subtitle:'A tribute to someone special',
   body:"The club is organising a testimonial match for a legendary retired player. They've asked if you'd like to participate and say a few words at the ceremony.",
   chance:0.003,minDay:90,type:'community',rarity:'uncommon',
   choices:[{label:'🎖️ Participate with pride',outcome:'+£1,500 and massive goodwill from the fans.',fn:'charityMatch'},{label:'🚫 Too busy with preparation',outcome:'You politely decline.',fn:'declineEvent'}]},

  {id:'evt_youth_mentorship',icon:'👦',title:'Youth Player Looks Up To You',subtitle:'Passing the torch',
   body:"A 16-year-old academy kid has been following you around the training ground all week. The coaches say he's genuinely talented, but lacks confidence. They're asking if you'd take him under your wing.",
   chance:0.003,minDay:120,type:'personal',rarity:'uncommon',unique:true,
   choices:[{label:'🤝 Mentor him',outcome:'The kid blossoms. Huge goodwill. +£2,000 club bonus.',fn:'mentorYouth'},{label:'🤷 You\'re busy focusing on your own game',outcome:'Fair enough.',fn:'declineEvent'}]},

  {id:'evt_autobio_offer',icon:'📖',title:'Book Deal',subtitle:'Your story, in print',
   body:"A major publisher has approached your agent about an autobiography. Even at this stage of your career, the story is compelling enough to sell. It means committing to several interview sessions.",
   chance:0.002,minDay:200,minOVR:70,type:'financial',rarity:'rare',unique:true,
   choices:[{label:'✍️ Sign the book deal — £18,000',outcome:'Your story hits shelves. Huge exposure.',fn:'bookDeal'},{label:'🤔 Not yet — there\'s more story to write',outcome:'The publisher says the offer stands for now.',fn:'declineEvent'}]},

  {id:'evt_referee_incident',icon:'🟨',title:'Heated Exchange with the Referee',subtitle:'You snapped — but are you wrong?',
   body:"A decision goes against you in the dying minutes of a tight match. You completely lose it at the referee. The cameras caught every word. The fourth official is furious.",
   chance:0.006,minDay:30,type:'conduct',rarity:'uncommon',
   choices:[{label:'😤 Stand your ground — he was wrong',outcome:'Two-match ban. £1,500 fine from FA.',fn:'refereeFine'},{label:'🤐 Walk away immediately',outcome:'Avoided a ban. Smart.',fn:'declineEvent'}]},

  {id:'evt_fan_encounter',icon:'👥',title:'Touching Fan Encounter',subtitle:'A reminder of why you play',
   body:"After training, a young kid with a disability has waited two hours outside the training ground just to meet you. He's clutching a handmade sign with your name on it.",
   chance:0.004,minDay:20,type:'personal',rarity:'uncommon',
   choices:[{label:'❤️ Spend time with him — the full experience',outcome:'The moment goes viral. Sponsors love it. +£1,000.',fn:'fanEncounter'},{label:'📸 Quick photo and sign his shirt',outcome:'He was thrilled. A good day.',fn:'charityDonate'}]},

  {id:'evt_international_snub',icon:'😤',title:'Left Out of the International Squad',subtitle:'The manager didn\'t pick you',
   body:"The national team squad is announced. Your name is not on it. Journalists are already asking your club if you have a falling-out with the international manager.",
   chance:0.005,minDay:60,type:'pressure',rarity:'uncommon',
   choices:[{label:'📺 Speak to the press — professional response',outcome:'You handle it with class. Manager takes note.',fn:'silentResponse'},{label:'😡 Post a cryptic message online',outcome:'The internet runs with it. £1,000 fine incoming.',fn:'angryResponse'}]},

  {id:'evt_stadium_night',icon:'🌙',title:'Stadium Night Tour',subtitle:'Just you and the pitch',
   body:"It\'s 11pm. The stadium is empty. A security guard gives you a knowing nod and lets you onto the pitch. You walk out alone under the floodlights. Nobody is watching.",
   chance:0.002,minDay:30,type:'personal',rarity:'rare',
   choices:[{label:'⚽ Take some shots at an empty net',outcome:'You score from 40 yards. No one will ever know.',fn:'declineEvent'},{label:'🧘 Just sit in the centre circle',outcome:'A grounding moment. Mental clarity incoming.',fn:'declineEvent'}]},

  {id:'evt_penalty_hero',icon:'🥅',title:'Penalty Shootout Decision',subtitle:'The manager looks at you',
   body:"It\'s tied after 90 minutes in the cup. The manager is picking penalty takers. He scans the dressing room with serious eyes. He points at you.",
   chance:0.005,minDay:60,type:'performance',rarity:'uncommon',
   choices:[{label:'⚽ Step up — I\'ll take one',outcome:'You score. Adrenaline rush. +£500 from club bonus.',fn:'penaltyHero'},{label:'🙈 I\'d rather not — pick someone else',outcome:'Smart self-awareness. Nobody judges you.',fn:'declineEvent'}]},

  {id:'evt_winter_freeze',icon:'❄️',title:'Pitch Frozen — Match Postponed',subtitle:'Mother Nature intervenes',
   body:"The pitch is rock hard. The referee calls it off after 20 minutes of inspection. You get an unexpected free day. What do you do with it?",
   chance:0.005,minDay:90,type:'personal',rarity:'uncommon',
   choices:[{label:'🏋️ Extra gym session',outcome:'Used the day well. Minor fitness boost.',fn:'extraGym'},{label:'🛋️ Rest day — you needed this',outcome:'Full recovery. Ready for the next match.',fn:'declineEvent'}]},

  {id:'evt_transfer_rumour',icon:'📰',title:'Transfer Rumour Explodes',subtitle:'Your name is everywhere',
   body:"A major outlet has linked you to a top club — without any contact from that club\'s actual representatives. Agents are calling. The story has a life of its own now.",
   chance:0.004,minDay:50,minOVR:65,type:'media',rarity:'uncommon',
   choices:[{label:'🤝 Let your agent fuel the speculation',outcome:'Pressure on current club. They increase your wages by £1,000/wk.',fn:'rumourFuel'},{label:'😄 Deny it — stay focused',outcome:'Professional. Manager appreciates it.',fn:'declineEvent'}]},

  {id:'evt_old_coach_visit',icon:'👴',title:'Your Old Youth Coach Visits',subtitle:'The person who started it all',
   body:"Your first ever coach — who gave you your first pair of proper boots aged 9 — has travelled four hours to watch you train. He\'s 72 now and he looks proud just being here.",
   chance:0.002,minDay:150,type:'personal',rarity:'rare',unique:true,
   choices:[{label:'❤️ Take him for lunch and spend the day',outcome:'A day neither of you will forget. Grounding.',fn:'goHome'},{label:'📸 Photos and a signed shirt',outcome:'He was over the moon.',fn:'charityDonate'}]},

  {id:'evt_bad_dressing_room',icon:'😬',title:'Toxic Dressing Room Atmosphere',subtitle:'Something is rotting from within',
   body:"Two senior players have been feuding all week. Training is tense. The manager hasn\'t addressed it. Younger players are choosing sides. You\'re caught in the middle.",
   chance:0.004,minDay:40,type:'morale',rarity:'uncommon',
   choices:[{label:'🕊️ Try to mediate — bring people together',outcome:'Respected by everyone. Captain material.',fn:'dressRoomCool'},{label:'🤐 Stay out of it entirely',outcome:'You focus on your football. Smart.',fn:'declineEvent'},{label:'😤 Pick the stronger side',outcome:'Risky. Dressing room splits further.',fn:'dressRoomFight'}]},

  {id:'evt_kit_malfunction',icon:'👕',title:'Kit Sponsor Drama',subtitle:'Caught on camera in the wrong shirt',
   body:"In the chaos of the kit room before a big match, you accidentally play in a slight variation of the kit that violates your sponsor\'s exclusivity agreement. Legal letters arrive Monday.",
   chance:0.002,minDay:50,type:'financial',rarity:'uncommon',
   choices:[{label:'📑 Let the legal team handle it (£5,000 fee)',outcome:'Resolved quietly. Small cost, no fuss.',fn:'hireTaxAccountant'},{label:'🙏 Issue a personal apology to the sponsor',outcome:'They appreciate the gesture. Resolved amicably.',fn:'publicApology'}]},

  {id:'evt_hat_trick_bonus',icon:'⚽',title:'Club Hat-Trick Bonus',subtitle:'The chairman is delighted',
   body:"After your stunning hat-trick last weekend, the chairman has personally authorised a performance bonus above and beyond your contract.",
   condition:()=>G.seasonStats.goals>=3,
   chance:0.005,minDay:60,type:'financial',rarity:'uncommon',unique:false,
   choices:[{label:'💰 Accept the bonus',outcome:'+£12,000 exceptional performance bonus.',fn:'hatTrickBonus'}]},

  {id:'evt_nutrition_overhaul',icon:'🥗',title:'Personal Nutritionist',subtitle:'Peak performance through science',
   body:"A professional nutritionist — who has worked with Olympic athletes — has been brought in by the club to consult with key players. She wants to work with you specifically.",
   chance:0.003,minDay:60,type:'development',rarity:'uncommon',unique:true,
   choices:[{label:'🥗 Commit fully to the programme',outcome:'Physical improved by +3 over the next weeks.',fn:'nutritionBoost'},{label:'😅 You\'ll manage your own diet, thanks',outcome:'She accepts this gracefully.',fn:'declineEvent'}]},

  {id:'evt_pre_match_tunnel',icon:'🎶',title:'Tunnel Incident',subtitle:'Tempers flare before kickoff',
   body:"In the tunnel before a big derby, an opposition player gets in your face. He\'s clearly trying to wind you up before you even reach the pitch. The cameras are rolling.",
   chance:0.004,minDay:40,type:'morale',rarity:'uncommon',
   choices:[{label:'😏 Smile and say nothing',outcome:'Ice cold. Your composure unsettles him.',fn:'dressRoomCool'},{label:'💬 Trade words — you give as good as you get',outcome:'Both players booked in the 2nd minute.',fn:'dressRoomSwing'},{label:'🏃 Walk past — eyes forward',outcome:'Composed. The fans notice.',fn:'declineEvent'}]},

  {id:'evt_podcast_appearance',icon:'🎙️',title:'Big Football Podcast Invite',subtitle:'Your chance to shape the narrative',
   body:"The most popular football podcast in the country has invited you on as a guest. Two million listeners. The host is known for asking sharp questions.",
   chance:0.003,minDay:80,type:'media',rarity:'uncommon',
   choices:[{label:'🎙️ Go on — share your story',outcome:'+£3,000 appearance fee. Profile raised significantly.',fn:'podcastBonus'},{label:'🤐 Not yet — your football speaks for itself',outcome:'You decline politely.',fn:'declineEvent'}]},

  {id:'evt_stadium_upgrade',icon:'🏟️',title:'New Stadium Announcement',subtitle:'A massive day for the club',
   body:"The club has announced plans for a brand new 50,000-seat stadium. Players have been invited to speak at the announcement — the owner specifically asked for you.",
   chance:0.002,minDay:100,type:'career',rarity:'rare',unique:true,
   choices:[{label:'🎤 Speak at the event',outcome:'Huge publicity. +£5,000 from club for the appearance.',fn:'embraceViral'},{label:'📸 Just show up and smile for cameras',outcome:'You were there. That\'s what counts.',fn:'declineEvent'}]},

  {id:'evt_away_day_disaster',icon:'✈️',title:'Travel Chaos — Away Match',subtitle:'Nothing goes right',
   body:"The coach breaks down. The hotel has given your rooms away. You arrive at the stadium with 40 minutes to spare. The kit skips are missing two sets of gloves.",
   chance:0.004,minDay:30,type:'personal',rarity:'uncommon',
   choices:[{label:'😂 Find it funny — keep spirits high',outcome:'Your attitude lifts the whole squad.',fn:'dressRoomCool'},{label:'😤 This is unacceptable — complain loudly',outcome:'You\'re right but it kills the mood.',fn:'dressRoomFight'}]},

  {id:'evt_data_analytics',icon:'📊',title:'Analytics Report Lands on Your Desk',subtitle:'The numbers don\'t lie',
   body:"The club\'s performance analytics team has sent you a detailed breakdown of your stats vs. position averages. Some of the findings are surprising — both good and bad.",
   chance:0.003,minDay:90,type:'development',rarity:'uncommon',unique:true,
   choices:[{label:'📊 Study it deeply and adjust your game',outcome:'Improved decision-making. Passing +2.',fn:'analyticsBoost'},{label:'🤷 Stats don\'t tell the full story',outcome:'Fair point. You trust your instincts.',fn:'declineEvent'}]},

  // ══ EVEN MORE EVENTS ══════════════════════════════════════
  {id:'evt_derby_grudge',icon:'⚔️',title:'Grudge Match — Local Derby',subtitle:'This one means everything',
   body:"It's derby week. The atmosphere at training is electric. Your manager pulls you aside: I need your best — this is the one the fans talk about for decades. Can you deliver?",
   chance:0.005,minDay:40,type:'performance',rarity:'uncommon',
   choices:[
     {label:'🔥 I was born for this — I\'ll lead by example',outcome:'Fired up. +1 to a random stat for the season.',fn:'derbyFireUp'},
     {label:'😤 Just another three points',outcome:'Professional mindset. No energy wasted.',fn:'declineEvent'}]},

  // ── INJURY-RELATED CONDITIONS ────────────────────────────────
  {id:'evt_injury_return',icon:'💉',title:'Medics Give You the Green Light Early',subtitle:'Back sooner than expected',
   body:"Your physio is impressed with your recovery. You're cleared 10 days early from your injury. The manager is delighted. Do you push back into the starting XI immediately?",
   // Only fires when player has AT LEAST 12 days of injury left (so 10-day reduction is meaningful)
   condition:()=>(G.injuryDaysLeft||0)>=12,
   chance:0.006,minDay:50,type:'fitness',rarity:'uncommon',
   choices:[
     {label:'🏃 Yes — straight back into training',outcome:'Cleared all tests. Back two weeks early.',fn:'earlyReturn'},
     {label:'🛌 Take the full recovery time',outcome:'Cautious and professional. Full fitness.',fn:'declineEvent'}]},

  {id:'evt_fan_letter',icon:'💌',title:'A Letter From a Young Fan',subtitle:'The reason you play',
   body:"A handwritten letter arrives at the training ground from a 10-year-old girl with cerebral palsy. She says you're the reason she watches football, and she wants to be a manager one day because of how you carry yourself.",
   chance:0.003,minDay:80,type:'personal',rarity:'rare',unique:true,
   choices:[
     {label:'💌 Write back and invite her to a training session',outcome:'She comes. The whole squad is moved.',fn:'fanLetterReply'},
     {label:'📞 Phone her — she can\'t believe it',outcome:'A call she\'ll never forget.',fn:'fanLetterCall'}]},

  {id:'evt_transfer_window_panic',icon:'⏰',title:'Deadline Day — Club Desperate to Sell',subtitle:'Two hours left. Decision now.',
   body:"It's 10pm on transfer deadline day. Your club has received a surprise offer that suits everyone — but you have 2 hours to decide. Your agent is pacing. Your phone is ringing off the hook.",
   chance:0.003,minDay:60,minOVR:62,type:'career',rarity:'rare',
   choices:[
     {label:'✍️ Sign — take the opportunity',outcome:'Emergency transfer. £1,500/wk wage rise.',fn:'deadlineDaySign'},
     {label:'🛌 No — I\'m staying put',outcome:'The window closes. You sleep soundly.',fn:'declineEvent'}]},

  {id:'evt_sports_award',icon:'🏅',title:'Nominated for Player of the Month',subtitle:'The football world is watching',
   body:"The league has announced you\'re on the three-man shortlist for Player of the Month after a standout recent run of form. Results will be announced next week.",
   chance:0.004,minDay:60,type:'media',rarity:'uncommon',
   choices:[
     {label:'🎤 Give an interview — say the right things',outcome:'You win it. £5,000 prize money. +1 to OVR morale.',fn:'wonAward'},
     {label:'😌 Stay quiet — let the football talk',outcome:'You come second — robbed, some say.',fn:'declineEvent'}]},

  {id:'evt_financial_advisor',icon:'💹',title:'Elite Financial Advisor Reaches Out',subtitle:'Your money working smarter',
   body:"A high-end wealth management firm that counts several Premier League players among its clients has approached you. They want to manage your portfolio — fees apply, but the long-term returns are substantial.",
   chance:0.003,minDay:120,type:'financial',rarity:'rare',unique:true,
   choices:[
     {label:'💹 Sign up — £15,000 fee, long-term gain',outcome:'Smart money move. Passive income +£500/wk permanently.',fn:'financialAdvisor'},
     {label:'🤷 You\'re happy managing it yourself',outcome:'You decline. Nothing changes.',fn:'declineEvent'}]},

  {id:'evt_manager_showdown',icon:'😤',title:'Face-to-Face With the Manager',subtitle:'This conversation had to happen',
   body:"You've been dropped two weeks in a row despite strong form in training. You snap. You knock on the manager's door, look him in the eye, and demand an explanation.",
   // Only fire when manager thinks poorly of you
   condition:()=>['sceptical','poor','neutral'].includes(E.managerOpinion(G.player.overall,G.manager.teamAvgOVR).opinion),
   chance:0.004,minDay:50,type:'morale',rarity:'uncommon',
   choices:[
     {label:'😤 I deserve answers — I\'ve earned my place',outcome:'He respects it. Back in the starting XI.',fn:'confrontManager'},
     {label:'🤐 Swallow it — trust the process',outcome:'Head down. Your chance will come.',fn:'declineEvent'},
     {label:'📋 Request a transfer immediately',outcome:'He lists you. Transfer market opens.',fn:'requestListingFromRow'}]},

  {id:'evt_media_day',icon:'📸',title:'Club Media Day',subtitle:'On brand, on message',
   body:"It's the annual media day — interviews, photoshoots, adverts. You have the chance to really play up to the cameras, or get through it professionally and get back to training.",
   chance:0.004,minDay:20,type:'media',rarity:'common',
   choices:[
     {label:'😄 Enjoy it — show your personality',outcome:'+£2,000 in social media deal uplift.',fn:'mediaDayFun'},
     {label:'💼 Professional mode — minimal fuss',outcome:'Efficient. Back to the training pitch.',fn:'declineEvent'}]},

  {id:'evt_cold_weather_prep',icon:'🧊',title:'Cryotherapy Chamber Installed',subtitle:'Recovery meets science fiction',
   body:"The club has invested in a state-of-the-art cryotherapy chamber. Coaches say the players who use it consistently are recovering 40% faster. Your slot is booked every Tuesday.",
   chance:0.003,minDay:70,type:'development',rarity:'uncommon',unique:true,
   choices:[
     {label:'🧊 Commit to the full programme',outcome:'Recovery time halved. Injury resistance up.',fn:'cryoTherapy'},
     {label:'❄️ You prefer traditional methods',outcome:'Old school. Nothing changes.',fn:'declineEvent'}]},

  {id:'evt_international_friendly',icon:'🌍',title:'International Friendly — Manager Calls',subtitle:'Your nation needs you tonight',
   body:"Your national team manager rings personally. An injury has left a gap in the squad for an upcoming friendly against a top nation. He\'s asking if you\'re willing to join late.",
   chance:0.004,minDay:40,type:'career',rarity:'uncommon',
   choices:[
     {label:'✈️ Pack the bag — I\'m going',outcome:'+1 international cap. +£1,000 appearance fee.',fn:'friendlyCap'},
     {label:'🏥 I need to protect my fitness for the club',outcome:'Understood. Club comes first.',fn:'declineEvent'}]},

  {id:'evt_agent_fee',icon:'🤵',title:'Agent Contract Renewal',subtitle:'He wants a bigger cut',
   body:"Your agent has been with you since the start, but he\'s now asking for a 15% commission on all future earnings instead of 10%. He argues his network got you your best deals.",
   chance:0.003,minDay:100,type:'financial',rarity:'uncommon',unique:true,
   choices:[
     {label:'🤝 Sign — he\'s earned it',outcome:'He stays loyal. Better transfer opportunities.',fn:'agentDeal'},
     {label:'🚪 Find a new agent',outcome:'Fresh start. Same commission rate.',fn:'newAgent'}]},

  {id:'evt_post_match_interview',icon:'🎤',title:'Post-Match Interview Goes Wrong',subtitle:'Words spoken in the heat of the moment',
   body:"You\'ve just had your worst game of the season. The reporter shoves a mic in your face in the tunnel. Your answer comes out all wrong — the wrong name, the wrong tone, a sentence that\'ll be clipped and replayed.",
   chance:0.004,minDay:30,type:'media',rarity:'uncommon',
   choices:[
     {label:'📱 Tweet a clarification immediately',outcome:'Defused within hours.',fn:'publicApology'},
     {label:'📣 Issue a formal statement through the club',outcome:'Professional. Story buried.',fn:'hirePR'},
     {label:'🤐 Say nothing — it\'ll blow over',outcome:'Two days of noise. You were right.',fn:'ignoreControversy'}]},

  {id:'evt_legends_dinner',icon:'🍽️',title:'Invitation to Legends Dinner',subtitle:'Football royalty in one room',
   body:"You\'ve been invited to a private dinner with some of the greatest players in the history of the game. A chance to learn, network, and have your name mentioned in the same breath as icons.",
   chance:0.002,minDay:150,minOVR:70,type:'career',rarity:'rare',unique:true,
   choices:[
     {label:'🍽️ Attend — it\'s a once-in-a-career evening',outcome:'+£3,000 networking benefit. Huge morale boost.',fn:'legendsDinner'},
     {label:'🏡 You\'d rather rest before the next match',outcome:'Smart prioritisation. Fully focused.',fn:'declineEvent'}]},

  {id:'evt_charity_run',icon:'🏃',title:'Club Charity Marathon',subtitle:'Your legs, your cause',
   body:"The club is running a charity marathon for a local children\'s hospital. Players are signing up. The physio says you\'re fit enough to participate safely.",
   chance:0.003,minDay:50,type:'community',rarity:'uncommon',
   choices:[
     {label:'🏃 Sign up and run it',outcome:'+£1,500 raised in your name. Physical +1.',fn:'charityRun'},
     {label:'💰 Donate instead of running',outcome:'£500 donated. Well received.',fn:'charityDonate'}]},

  {id:'evt_foreign_league_interest',icon:'🌐',title:'Foreign League Approaches Your Agent',subtitle:'Sun, money, and a new adventure',
   body:"A major club from a foreign league — Saudi Arabia, MLS, or Saudi Pro League — has made a serious approach. Enormous wages, exotic lifestyle. But you\'d be leaving English football behind.",
   chance:0.002,minDay:200,minOVR:72,type:'career',rarity:'rare',
   choices:[
     {label:'✈️ Go — the money is life-changing',outcome:'Salary ×2.5. New league, new chapter.',fn:'foreignLeagueMove'},
     {label:'🏴󠁧󠁢󠁥󠁮󠁧󠁿 Stay — you belong here',outcome:'Loyalty. English football keeps you.',fn:'declineEvent'}]},
  // ══ TRANSFER WINDOW EVENTS ══════════════════════════════════════════════════
  {id:'evt_window_scramble',icon:'⏰',title:'Clubs Bidding War — Window Closes Tonight',subtitle:'Deadline day drama',
   body:"Your agent has not stopped pacing. Two clubs are fighting over your signature and the window closes in hours. The chairman phones you directly.",
   condition:()=>typeof isInTransferWindow==='function'&&isInTransferWindow(G.season.dayOfSeason)!==null&&!G.loanActive,
   chance:0.005,minDay:30,minOVR:64,type:'career',rarity:'uncommon',
   choices:[
     {label:'🤝 Let your agent maximise the bid war',outcome:'Salary negotiated up £1,200/wk.',fn:'windowScramble'},
     {label:'📵 Switch the phone off',outcome:'You stay. Focus on the season.',fn:'declineEvent'}]},

  {id:'evt_window_panic_buy',icon:'💰',title:'Your Club Panics and Extends Your Contract',subtitle:'They want you to stay',
   body:"Out of nowhere, the chairman summons you. He pushes a pre-emptive contract extension across the table — keeping you from leaving this window.",
   condition:()=>typeof isInTransferWindow==='function'&&isInTransferWindow(G.season.dayOfSeason)!==null,
   chance:0.004,minDay:40,type:'career',rarity:'uncommon',unique:false,
   choices:[
     {label:'✍️ Sign — loyalty rewarded',outcome:'+£800/wk + £6,000 loyalty bonus.',fn:'panicBuySign'},
     {label:'🤔 Ask for time to think',outcome:'They give you 48 hours.',fn:'declineEvent'}]},

  // ══ MORALE EVENTS ═══════════════════════════════════════════════════════════
  {id:'evt_morale_leader',icon:'💚',title:'Squad Names You Unofficial Leader',subtitle:'The armband finds you anyway',
   body:"After a string of brilliant performances, the senior players have started looking to you. Even without the official title, the dressing room follows your lead.",
   condition:()=>(G.morale||50)>=80&&(G.forcedStarter||0)<5,
   chance:0.005,minDay:60,type:'morale',rarity:'uncommon',unique:true,
   choices:[
     {label:'💚 Embrace the responsibility',outcome:'Guaranteed starter for 4 weeks.',fn:'moraleLeader'},
     {label:'🙏 Lead quietly — by example',outcome:'The squad respects you regardless.',fn:'declineEvent'}]},

  {id:'evt_morale_training_buzz',icon:'⚡',title:'Manager Notices Your Energy in Training',subtitle:'The whole training ground is buzzing',
   body:"The vibe you bring to sessions has lifted the whole squad. The manager pulls you aside after a session — he noticed. The coaches have been talking.",
   condition:()=>(G.morale||50)>=75,
   chance:0.005,minDay:30,type:'morale',rarity:'uncommon',
   choices:[
     {label:'⚡ Channel it — turn energy into results',outcome:'Performance boost next 3 matches.',fn:'moraleBoostPerf'},
     {label:'😄 Just enjoying my football right now',outcome:'Good times.',fn:'declineEvent'}]},

  {id:'evt_morale_dropped',icon:'💔',title:'Publicly Dropped Without Warning',subtitle:'The manager makes a statement',
   body:"The team sheet goes up. Your name is not on it — not even on the bench. In front of the entire squad. No warning, no conversation.",
   condition:()=>(G.morale||50)<=35&&!G.loanActive,
   chance:0.006,minDay:30,type:'morale',rarity:'uncommon',
   choices:[
     {label:'😤 Confront the manager directly',outcome:'He respects it. Starting next week.',fn:'confrontManager'},
     {label:'🏋️ Double down in training — prove him wrong',outcome:'Hard work noticed. Morale recovers.',fn:'silentResponse'},
     {label:'📋 Hand in a transfer request',outcome:'Club lists you.',fn:'requestListingFromRow'}]},

  {id:'evt_sport_psychologist',icon:'🧠',title:'Club Psychologist Reaches Out',subtitle:'Mind matters as much as body',
   body:"The performance psychologist stops you in the corridor. She says she has noticed your demeanour in training and thinks a few sessions could unlock something.",
   condition:()=>(G.morale||50)<=45,
   chance:0.005,minDay:40,type:'morale',rarity:'uncommon',unique:true,
   choices:[
     {label:'🧠 Commit to the sessions',outcome:'Morale recovers significantly.',fn:'sportsPsych'},
     {label:'🤷 Just a rough patch — you are fine',outcome:'You wave it off.',fn:'declineEvent'}]},

  // ══ BRAND EVENTS ════════════════════════════════════════════════════════════
  {id:'evt_brand_ambassador',icon:'💼',title:'Global Brand Wants You as Ambassador',subtitle:'Commercial superstar',
   body:"A global sportswear brand has noticed your off-pitch profile and public appeal. They want you as their lead ambassador for two years — big money and global reach.",
   condition:()=>(G.brand||0)>=15,
   chance:0.004,minDay:80,minOVR:68,type:'media',rarity:'rare',unique:true,
   choices:[
     {label:'🤝 Sign the ambassador deal',outcome:'+£14,000 up front + £1,000/wk passive.',fn:'brandAmbassador'},
     {label:'🚫 Football is the only focus',outcome:'Declined gracefully.',fn:'declineEvent'}]},

  {id:'evt_brand_fan_poll',icon:'🗳️',title:'Named Most Popular Player at the Club',subtitle:'The fans have voted',
   body:"The official supporter vote is in. You have been named the fans favourite player at the club by a significant margin. The club wants a special edition shirt with your number.",
   condition:()=>(G.brand||0)>=10,
   chance:0.004,minDay:60,type:'media',rarity:'uncommon',unique:true,
   choices:[
     {label:'❤️ Embrace it — special shirt release',outcome:'+£8,000 royalty from shirt sales.',fn:'fanPollWin'},
     {label:'😊 Deflect the praise — just happy to play',outcome:'Humble. Fans love it even more.',fn:'declineEvent'}]},

  // ══ SEASON CONTEXT EVENTS ═══════════════════════════════════════════════════
  {id:'evt_title_race',icon:'🏆',title:'You Are in a Title Race',subtitle:'The table does not lie',
   body:"With ten league games left, your team sits second — one point off the top. The press are calling it the most gripping title race in years. The dressing room is tense.",
   condition:()=>(G.league.matchdays||[]).length>0&&(G.league.matchdays||[]).length<=10,
   chance:0.006,minDay:260,type:'performance',rarity:'uncommon',unique:true,
   choices:[
     {label:'🔥 Lock in — this is what we trained for',outcome:'+2 to a key stat. Peak form.',fn:'titleRaceLockIn'},
     {label:'🧘 Treat it like any other game',outcome:'Steady. Professional.',fn:'declineEvent'}]},

  {id:'evt_relegation_battle',icon:'📉',title:'The Drop Zone Is Getting Closer',subtitle:'Every point matters now',
   body:"The league table is bleak. You are dangerously close to the relegation places and pressure on the squad is mounting. Some players are already preparing exit routes.",
   condition:()=>{try{const s=[...G.league.teams].sort((a,b)=>b.pts-a.pts||b.gd-a.gd);const p=s.findIndex(t=>t.isPlayer)+1;return p>=(s.length-3)&&G.league.matchdays.length<15;}catch(e){return false;}},
   chance:0.006,minDay:200,type:'morale',rarity:'uncommon',unique:true,
   choices:[
     {label:'💪 Lead from the front — no surrender',outcome:'+OVR morale. Extra gym booked.',fn:'relegationFight'},
     {label:'🤫 Keep private fears private',outcome:'Professional. Dressing room stable.',fn:'declineEvent'}]},

  {id:'evt_sold_out_crowd',icon:'🏟️',title:'Biggest Crowd of Your Career',subtitle:'Every seat taken, every voice singing',
   body:"The announcer confirms it — a complete sell-out. Over 60,000 fans. As you walk out of the tunnel the noise hits like a physical force. Everything feels different today.",
   chance:0.004,minDay:40,type:'performance',rarity:'uncommon',
   choices:[
     {label:'🔥 Feed off the energy',outcome:'Elevated performance this match.',fn:'crowdBoost'},
     {label:'🧘 Block it out — same as any game',outcome:'Composed. No nerves.',fn:'declineEvent'}]},

  {id:'evt_squad_bet',icon:'🎲',title:'Training Ground Shooting Competition',subtitle:'Loser buys lunch for everyone',
   body:"A heated session ends in a shooting contest between you and the club striker. The squad gathers. The loser buys 28 lunches.",
   chance:0.004,minDay:30,type:'personal',rarity:'uncommon',
   choices:[
     {label:'🎯 Step up and take the bet',outcome:'50/50 win or lose — bonds the squad.',fn:'squadBet'},
     {label:'😄 Sit back and watch',outcome:'Wise. The squad laughs.',fn:'declineEvent'}]},

  {id:'evt_sub_impact_start',icon:'🔄',title:'Your Impact From the Bench Has Been Enormous',subtitle:'The manager takes note',
   body:"Three times in a row you came on and changed the game. The manager is now publicly praising your impact — but you want to start.",
   condition:()=>G.seasonStats.apps>=5&&(G.forcedStarter||0)<3,
   chance:0.005,minDay:80,type:'career',rarity:'uncommon',unique:true,
   choices:[
     {label:'💬 Request a meeting about starting',outcome:'He listens. In the XI for 3 weeks.',fn:'confrontManager'},
     {label:'💪 Keep doing what you are doing',outcome:'Patient. Trust the process.',fn:'declineEvent'}]},

  {id:'evt_international_rivalry',icon:'🌍',title:'International Teammates on the Other Side',subtitle:'Club versus country',
   body:"Three of your international teammates play for tomorrow's opponents. The WhatsApp group went silent on Sunday. In the tunnel you lock eyes — friendship starts at full time.",
   chance:0.004,minDay:50,type:'performance',rarity:'uncommon',
   choices:[
     {label:'🤝 Quick handshake — then war',outcome:'Mutual respect. Both play brilliantly.',fn:'declineEvent'},
     {label:'🔥 No mercy — this is business',outcome:'Ice cold mentality. Performance boost.',fn:'derbyFireUp'}]},

  // ══ NEW BATCH — SEASON-AWARE, TIMING-GUARDED EVENTS ════════════════════════

  // ── Pre-season events (days 0-34) ──────────────────────────────────────────
  {id:'evt_preseason_manager_chat',icon:'🗣️',title:'Pre-Season Chat with the Manager',subtitle:'He has plans for you',
   body:"On the first full day of pre-season, the manager pulls you aside. He tells you he has seen your work-rate, he likes your attitude, and he wants you involved in his plans from day one.",
   condition:()=>G.season.dayOfSeason<=30&&G.season.number>=1,
   chance:0.04,minDay:0,type:'career',rarity:'uncommon',unique:false,
   choices:[
     {label:'🤝 Tell him you are ready to deliver',outcome:'Guaranteed starts early season.',fn:'managerMeeting'},
     {label:'😌 Let your football do the talking',outcome:'Low-key. Nothing changes.',fn:'declineEvent'}]},

  {id:'evt_preseason_boot_campaign',icon:'👟',title:'Boot Brand Wants a Pre-Season Campaign',subtitle:'Your image before a ball is kicked',
   body:"A premium boot brand wants to shoot a pre-season advert featuring you. It is a two-day shoot and they will brand your new season boots.",
   condition:()=>G.season.dayOfSeason<=34,
   chance:0.025,minDay:0,type:'media',rarity:'uncommon',
   choices:[
     {label:'📸 Do the campaign — £4,000 fee',outcome:'Great images. New boots. +1 to a stat.',fn:'eliteFootwear'},
     {label:'🏋️ You would rather focus on fitness in pre-season',outcome:'Smart prioritisation.',fn:'declineEvent'}]},

  // ── Transfer window summer (days 0-39) ──────────────────────────────────────
  {id:'evt_summer_window_buzz',icon:'🔥',title:'Transfer Rumour Explodes',subtitle:'Your name is on every back page',
   body:"Your strong end to last season has triggered a frenzy of speculation. Three clubs have reportedly tabled bids. Your phone rings every hour. The window closes in two weeks.",
   condition:()=>{const w=typeof isInTransferWindow==='function'?isInTransferWindow(G.season.dayOfSeason):null;return w==='summer'&&!G.loanActive;},
   chance:0.018,minDay:0,minOVR:66,type:'career',rarity:'uncommon',
   choices:[
     {label:'🗞️ Let your agent field the calls',outcome:'Salary negotiated up £1,200/wk.',fn:'windowScramble'},
     {label:'📵 Switch the phone off — fully committed here',outcome:'The speculation dies. You focus.',fn:'declineEvent'}]},

  {id:'evt_summer_reject_bid',icon:'🚫',title:'Club Rejects Bid — But Tells You',subtitle:'Complete transparency from the board',
   body:"Your chairman calls you personally. Three clubs tried to buy you this summer. All bids were rejected. We rated you and wanted you here. He then slides a pre-emptive renewal across the desk.",
   condition:()=>{const w=typeof isInTransferWindow==='function'?isInTransferWindow(G.season.dayOfSeason):null;return w==='summer';},
   chance:0.012,minDay:5,minOVR:65,type:'career',rarity:'uncommon',unique:false,
   choices:[
     {label:'✍️ Sign the renewal — show loyalty',outcome:'Contract extended. +£800/wk + £6,000 loyalty bonus.',fn:'panicBuySign'},
     {label:'⏳ Tell them you need time to think',outcome:'They give you the window. Pressure builds.',fn:'declineEvent'}]},

  // ── Early season (days 35-90) ────────────────────────────────────────────────
  {id:'evt_early_season_debut_form',icon:'🌟',title:'Explosive Start to the Season',subtitle:'Everyone is talking about you',
   body:"After four league games, the stats do not lie. You are top of the ratings chart. The football media are already calling you the signing of the summer.",
   condition:()=>G.season.dayOfSeason>=40&&G.season.dayOfSeason<=90&&G.seasonStats.apps>=2&&G.seasonStats.goals>=2,
   chance:0.02,minDay:40,type:'career',rarity:'uncommon',unique:false,
   choices:[
     {label:'🏋️ Keep your head down and deliver',outcome:'Focus maintained. Breakthrough bonus paid.',fn:'rookieBonus'},
     {label:'😄 Enjoy the attention — it is well earned',outcome:'The profile rises. Agent gets more calls.',fn:'embraceViral'}]},

  {id:'evt_kit_launch',icon:'👕',title:'New Kit Launch — You are the Face',subtitle:'The club wants you front and centre',
   body:"The club has chosen you to front this season new kit launch. A professional shoot, global rollout, and a massive boost to your personal brand. Could lead to further deals.",
   condition:()=>G.season.dayOfSeason>=35&&G.season.dayOfSeason<=80,
   chance:0.015,minDay:35,type:'media',rarity:'uncommon',unique:false,
   choices:[
     {label:'📸 Absolutely — I want to be the face',outcome:'+£5,000 + brand boost. Sponsors get in touch.',fn:'embraceViral'},
     {label:'🙏 Let another player take the spotlight',outcome:'Humble. Teammates appreciate it.',fn:'declineEvent'}]},

  // ── Mid-season (days 90-250) ─────────────────────────────────────────────────
  {id:'evt_var_controversy',icon:'📺',title:'VAR Overturns Your Goal',subtitle:'Technology robs you of a moment',
   body:"You celebrate, the crowd erupts, your teammates mob you. Then the referee puts his finger to his ear. Seven agonising minutes later the screen at the far end flashes OFFSIDE. Disallowed.",
   condition:()=>G.seasonStats.goals>=1&&G.season.dayOfSeason>=60,
   chance:0.015,minDay:60,type:'morale',rarity:'uncommon',
   choices:[
     {label:'😤 Storm off — it was clearly onside',outcome:'Fined £500 for dissent.',fn:'ignoreVAR'},
     {label:'🤝 Shake hands and get on with it',outcome:'Composure earns massive respect from fans.',fn:'helpVAR'}]},

  {id:'evt_casino_night',icon:'🎰',title:'Post-Match Casino Evening',subtitle:'Some teammates have plans...',
   body:"The squad goes out after a big win. Three of the lads suggest going to a casino. It is a Tuesday — game on Saturday. The manager does not need to know.",
   condition:()=>G.season.dayOfSeason>=60&&G.season.dayOfSeason<=300&&G.seasonStats.wins>=2,
   chance:0.012,minDay:60,type:'personal',rarity:'uncommon',
   choices:[
     {label:'🎰 Go — you only live once',outcome:'Risk your money. 40% win, 60% lose.',fn:'enterCasino'},
     {label:'🏡 Go home and rest',outcome:'Sharp for Saturday.',fn:'declineEvent'}]},

  {id:'evt_international_tournament_call',icon:'🌍',title:'International Tournament Selected',subtitle:'Your nation needs its best XI',
   body:"You've been included in the national team squad for the upcoming international tournament. Club form has earned you this. The manager has no objections to your release.",
   condition:()=>G.player.overall>=(NATIONS.find(n=>n.name===G.player.nation)?.callupOVR||75)&&G.season.dayOfSeason>=100&&G.season.dayOfSeason<=280,
   chance:0.006,minDay:100,minOVR:72,type:'career',rarity:'rare',unique:false,
   choices:[
     {label:'🌍 Go — represent your nation',outcome:'3 caps. Key stat +2 from the intense competition.',fn:'internationalTourney'},
     {label:'🏥 Stay — need to protect your fitness',outcome:'Club appreciates it. Nation understands.',fn:'declineEvent'}]},

  {id:'evt_post_loss_media',icon:'🎤',title:'Tunnel Interview After Heavy Defeat',subtitle:'The worst time to face a microphone',
   body:"Your team has just been beaten 4-0 at home. The tunnel microphone is thrust into your face before you've even caught your breath. The reporter asks if the manager should be sacked.",
   condition:()=>G.seasonStats.losses>=2&&G.season.dayOfSeason>=50,
   chance:0.01,minDay:50,type:'media',rarity:'uncommon',
   choices:[
     {label:'💬 Back the manager completely',outcome:'Dressing room trust rises. Manager grateful.',fn:'moraleLeader'},
     {label:'🤐 No comment on that one',outcome:'Smart. No drama created.',fn:'declineEvent'},
     {label:'😤 Honest — it was not good enough',outcome:'Pundits praise honesty. Manager fumes privately.',fn:'preditResponse'}]},

  {id:'evt_contract_milestone_bonus',icon:'✍️',title:'Performance Milestone Bonus Triggered',subtitle:'The contract clause pays out',
   body:"A clause buried deep in your contract has just been met — you've hit the appearances trigger. The accounts team sends a notification. A bonus has landed in your bank.",
   condition:()=>G.seasonStats.apps>=20,
   chance:0.025,minDay:180,type:'financial',rarity:'uncommon',unique:false,
   choices:[
     {label:'💰 Acknowledge it and keep going',outcome:'£5,000 bonus received. Contract year extended.',fn:'contractCelebration'}]},

  {id:'evt_training_ground_visitor',icon:'👥',title:'Surprise Training Ground Visitor',subtitle:'A legend comes to watch',
   body:"A club legend — a player you idolised growing up — turns up unannounced at training. He spends two hours watching. At the end he walks straight up to you and shakes your hand. You remind me of myself at your age.",
   chance:0.004,minDay:80,type:'personal',rarity:'rare',unique:true,
   choices:[
     {label:'🤝 Ask for his advice',outcome:'An hour of priceless insight. OVR +1 from the session.',fn:'analyticsBoost'},
     {label:'📸 Get a photo — this is a moment',outcome:'The image goes viral. Brand boost.',fn:'embraceViral'}]},

  {id:'evt_winter_window_target',icon:'❄️',title:'January — You Are a Transfer Target',subtitle:'The window is open. Clubs are watching.',
   body:"The January transfer window has opened and your agent calls with exciting news: two clubs have identified you as their primary target. Interest is serious and formal approaches are being made to the board.",
   condition:()=>{const w=typeof isInTransferWindow==='function'?isInTransferWindow(G.season.dayOfSeason):null;return w==='winter'&&!G.loanActive;},
   chance:0.020,minDay:180,minOVR:64,type:'career',rarity:'uncommon',
   choices:[
     {label:'📋 Request a transfer — time to move on',outcome:'You go on the list. Transfer market opens.',fn:'requestListingFromRow'},
     {label:'📵 Switch the phone off',outcome:'You stay. Head down. January resolved.',fn:'declineEvent'}]},

  {id:'evt_winter_fitness_programme',icon:'❄️',title:'January — Club Fitness Overhaul',subtitle:'New year, new standards',
   body:"After a tough autumn fixture pile-up, the club brings in a world-renowned fitness expert in January. He introduces a revolutionary six-week training block and you are one of five players selected for the advanced group.",
   condition:()=>G.season.dayOfSeason>=180&&G.season.dayOfSeason<=220,
   chance:0.016,minDay:180,type:'development',rarity:'uncommon',unique:false,
   choices:[
     {label:'💪 All in — commit fully',outcome:'Physical and pace each improve. Peak condition.',fn:'cryoTherapy'},
     {label:'🤷 No thanks — already in good shape',outcome:'Wise if you are already fit. Respect the decision.',fn:'declineEvent'}]},

  // ── Late season (days 250-340) ───────────────────────────────────────────────
  {id:'evt_run_in_form',icon:'🔥',title:'End-of-Season Run — Your Best Football',subtitle:'You are peaking at the right time',
   body:"Six games to go and you are in the form of your life. Journalists are writing columns about you. Your manager says in the press: Right now, he has the best player in the league.",
   condition:()=>G.season.dayOfSeason>=270&&G.seasonStats.apps>=20&&G.seasonStats.goals+G.seasonStats.assists>=8,
   chance:0.025,minDay:270,type:'performance',rarity:'uncommon',unique:false,
   choices:[
     {label:'🔥 Keep going — nothing changes',outcome:'Pure focus. Title charge continues.',fn:'titleRaceLockIn'},
     {label:'😌 Stay humble — a lot can happen in six games',outcome:'Professional. The squad appreciates it.',fn:'declineEvent'}]},

  {id:'evt_season_end_award_night',icon:'🏅',title:'End of Season Awards Night',subtitle:'Your name is called out',
   body:"The club end-of-season awards dinner. Black tie. Speeches. And then the MC opens an envelope. Your name echoes around the room. Players' Player of the Year.",
   condition:()=>G.season.dayOfSeason>=300&&G.seasonStats.apps>=25&&G.seasonStats.goals+G.seasonStats.assists>=6,
   chance:0.02,minDay:300,type:'career',rarity:'uncommon',unique:false,
   choices:[
     {label:'🏅 Accept with a speech',outcome:'Standing ovation. +£5,000 prize. Agent phone is ringing.',fn:'wonAward'},
     {label:'🙏 Dedicate it to the team',outcome:'Class act. Respect through the roof.',fn:'declineEvent'}]},

  {id:'evt_end_of_contract_buzz',icon:'🔓',title:'Contract in Final Year — Clubs Circle',subtitle:'Everyone knows you are available',
   body:"This is the final year of your deal and the club has not yet offered a renewal. Other clubs are fully aware. Your agent says three serious conversations are already happening.",
   condition:()=>(G.club.contractYears||3)<=1&&!G.club.isFreeAgent&&G.season.dayOfSeason>=250,
   chance:0.025,minDay:250,type:'career',rarity:'uncommon',unique:false,
   choices:[
     {label:'💬 Push the club for a renewal now',outcome:'You open talks directly.',fn:'contractLeakMeeting'},
     {label:'🎯 Play it out — see what comes at the end',outcome:'The market will decide your next chapter.',fn:'declineEvent'}]},

];
