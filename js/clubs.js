// ═══════════════════════════════════════════════════════════
//  ProPath — clubs.js
//  Structured club data: badge colours, formations, manager
//  names, and average squad OVR per tier.
//
//  HOW TO ADD A REAL CLUB:
//  1. Find the club in CLUB_DATA below (keyed by name string)
//  2. Set primaryColor, secondaryColor (hex)
//  3. Set formation (string like '4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2')
//  4. Set ovr (average first-team OVR, 48–99)
//  5. Set manager (manager's name string)
//  6. Set badge (emoji or short text — used as club crest placeholder)
// ═══════════════════════════════════════════════════════════

const CLUB_DATA = {

  // ── TIER 1: Premier League ──────────────────────────────
  'Arsenal': {
    primaryColor:'#EF0107',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:83,manager:'Mikel Arteta',badge:'🔴⚪',
  },
  'Chelsea': {
    primaryColor:'#034694',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:81,manager:'Enzo Maresca',badge:'🔵',
  },
  'Liverpool': {
    primaryColor:'#C8102E',secondaryColor:'#F6EB61',
    formation:'4-3-3',ovr:85,manager:'Arne Slot',badge:'🔴',
  },
  'Manchester City': {
    primaryColor:'#6CABDD',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:87,manager:'Pep Guardiola',badge:'🩵',
  },
  'Manchester United': {
    primaryColor:'#DA020E',secondaryColor:'#FFE500',
    formation:'4-2-3-1',ovr:80,manager:'Rúben Amorim',badge:'🔴⚫',
  },
  'Tottenham Hotspur': {
    primaryColor:'#132257',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:79,manager:'Ange Postecoglou',badge:'⚪',
  },
  'Newcastle United': {
    primaryColor:'#241F20',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:80,manager:'Eddie Howe',badge:'⚫⚪',
  },
  'Aston Villa': {
    primaryColor:'#670E36',secondaryColor:'#95BFE5',
    formation:'4-2-3-1',ovr:81,manager:'Unai Emery',badge:'🟣',
  },
  'West Ham United': {
    primaryColor:'#7A263A',secondaryColor:'#1BB1E7',
    formation:'4-2-3-1',ovr:76,manager:'Julen Lopetegui',badge:'⚒️',
  },
  'Brighton & Hove Albion': {
    primaryColor:'#0057B8',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:77,manager:'Fabian Hürzeler',badge:'🔵⚪',
  },
  'Brentford FC': {
    primaryColor:'#E30613',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:75,manager:'Thomas Frank',badge:'🐝',
  },
  'Crystal Palace': {
    primaryColor:'#1B458F',secondaryColor:'#C4122E',
    formation:'4-3-3',ovr:74,manager:'Oliver Glasner',badge:'🦅',
  },
  'Everton FC': {
    primaryColor:'#274488',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:73,manager:'Sean Dyche',badge:'🔵',
  },
  'Fulham FC': {
    primaryColor:'#FFFFFF',secondaryColor:'#000000',
    formation:'4-2-3-1',ovr:75,manager:'Marco Silva',badge:'⚫⚪',
  },
  'Leicester City': {
    primaryColor:'#003090',secondaryColor:'#FDBE11',
    formation:'4-3-3',ovr:74,manager:'Steve Cooper',badge:'🦊',
  },
  'Nottingham Forest': {
    primaryColor:'#DD0000',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:74,manager:'Nuno Espírito Santo',badge:'🌲',
  },
  'Wolverhampton W': {
    primaryColor:'#FDB913',secondaryColor:'#231F20',
    formation:'3-5-2',ovr:74,manager:'Gary O\'Neil',badge:'🟡',
  },
  'Bournemouth AFC': {
    primaryColor:'#DA291C',secondaryColor:'#000000',
    formation:'4-4-2',ovr:73,manager:'Andoni Iraola',badge:'🍒',
  },
  'Ipswich Town': {
    primaryColor:'#0044A9',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:71,manager:'Kieran McKenna',badge:'🔵',
  },
  'Sheffield United': {
    primaryColor:'#EE2737',secondaryColor:'#000000',
    formation:'3-5-2',ovr:70,manager:'Chris Wilder',badge:'🔴⚫',
  },

  // ── TIER 2: Championship ────────────────────────────────
  'Southampton': {
    primaryColor:'#D71920',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:75,manager:'Russell Martin',badge:'🔴⚪',
  },
  'Leeds United': {
    primaryColor:'#FFCD00',secondaryColor:'#1D428A',
    formation:'4-2-3-1',ovr:74,manager:'Daniel Farke',badge:'💛',
  },
  'Burnley': {
    primaryColor:'#6C1D45',secondaryColor:'#99D6EA',
    formation:'4-4-2',ovr:73,manager:'Scott Parker',badge:'🟣',
  },
  'Middlesbrough': {
    primaryColor:'#D71920',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:70,manager:'Michael Carrick',badge:'🔴',
  },
  'Coventry City': {
    primaryColor:'#58AFD1',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:68,manager:'Mark Robins',badge:'🩵',
  },
  'Preston NE': {
    primaryColor:'#FFFFFF',secondaryColor:'#1A3660',
    formation:'4-4-2',ovr:67,manager:'Ryan Lowe',badge:'⚪',
  },
  'Norwich City': {
    primaryColor:'#00A650',secondaryColor:'#FFF200',
    formation:'4-2-3-1',ovr:70,manager:'David Wagner',badge:'🟡🟢',
  },
  'Watford FC': {
    primaryColor:'#FBEE23',secondaryColor:'#ED2127',
    formation:'4-4-2',ovr:68,manager:'Tom Cleverley',badge:'🐝',
  },
  'Sunderland AFC': {
    primaryColor:'#EB172B',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:69,manager:'Régis Le Bris',badge:'🔴⚪',
  },
  'Hull City': {
    primaryColor:'#F5A12D',secondaryColor:'#000000',
    formation:'3-5-2',ovr:67,manager:'Tim Walter',badge:'🐯',
  },
  'Cardiff City': {
    primaryColor:'#0070B5',secondaryColor:'#D01317',
    formation:'4-4-2',ovr:66,manager:'Erol Bulut',badge:'🐦',
  },
  'QPR': {
    primaryColor:'#005CAB',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:65,manager:'Marti Cifuentes',badge:'🔵⚪',
  },
  'Stoke City': {
    primaryColor:'#E03A3E',secondaryColor:'#1B3F8E',
    formation:'4-4-2',ovr:66,manager:'Steven Schumacher',badge:'🔴🔵',
  },
  'Millwall': {
    primaryColor:'#001D5E',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:67,manager:'Neil Harris',badge:'🦁',
  },
  'Swansea City': {
    primaryColor:'#FFFFFF',secondaryColor:'#000000',
    formation:'4-2-3-1',ovr:66,manager:'Luke Williams',badge:'🦢',
  },
  'Birmingham City': {
    primaryColor:'#0000FF',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:65,manager:'Chris Davies',badge:'🔵',
  },
  'Blackburn Rovers': {
    primaryColor:'#009EE0',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:66,manager:'John Eustace',badge:'🩵⚪',
  },
  'Nottm Forest': {
    primaryColor:'#DD0000',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:74,manager:'Nuno',badge:'🌲',
  },
  'West Brom': {
    primaryColor:'#122F67',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:68,manager:'Carlos Corberán',badge:'🔵⚪',
  },
  'Sheffield Wednesday': {
    primaryColor:'#1D4FA1',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:67,manager:'Danny Röhl',badge:'🦉',
  },
  'Blackpool FC': {
    primaryColor:'#F2601A',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:64,manager:'Neil Critchley',badge:'🟠',
  },
  'Huddersfield Town': {
    primaryColor:'#0E63AD',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:64,manager:'Michael Duff',badge:'🔵',
  },
  'Luton Town': {
    primaryColor:'#F78F1E',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:69,manager:'Rob Edwards',badge:'🟠',
  },
  'Bristol City': {
    primaryColor:'#E00019',secondaryColor:'#FFFFFF',
    formation:'3-5-2',ovr:66,manager:'Liam Manning',badge:'🔴',
  },

  // ── TIER 3: League One ──────────────────────────────────
  'Portsmouth': {
    primaryColor:'#001489',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:67,manager:'John Mousinho',badge:'🔵',
  },
  'Charlton Athletic': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:62,manager:'Nathan Jones',badge:'🔴⚪',
  },
  'Lincoln City': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:60,manager:'Michael Skubala',badge:'🔴',
  },
  'Derby County': {
    primaryColor:'#FFFFFF',secondaryColor:'#231F20',
    formation:'4-2-3-1',ovr:65,manager:'Paul Warne',badge:'⚫⚪',
  },
  'Peterborough Utd': {
    primaryColor:'#004A97',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:62,manager:'Darren Ferguson',badge:'🔵',
  },
  'Oxford United': {
    primaryColor:'#FFD100',secondaryColor:'#000000',
    formation:'4-2-3-1',ovr:64,manager:'Des Buckingham',badge:'💛',
  },
  'Exeter City': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:60,manager:'Gary Caldwell',badge:'🔴⚪',
  },
  'Bristol Rovers': {
    primaryColor:'#0000CC',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:59,manager:'Matt Taylor',badge:'🔵',
  },
  'Barnsley FC': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:61,manager:'Neill Collins',badge:'🔴',
  },
  'Bolton Wanderers': {
    primaryColor:'#263279',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:62,manager:'Ian Evatt',badge:'🔵⚪',
  },
  'Wigan Athletic': {
    primaryColor:'#1D5BA4',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:61,manager:'Shaun Maloney',badge:'🔵',
  },
  'Reading FC': {
    primaryColor:'#004494',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:60,manager:'Noel Hunt',badge:'🔵⚪',
  },
  'Rotherham United': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:60,manager:'Leam Richardson',badge:'🔴',
  },
  'Plymouth Argyle': {
    primaryColor:'#006B3F',secondaryColor:'#FFFFFF',
    formation:'4-2-3-1',ovr:62,manager:'Wayne Rooney',badge:'🟢',
  },
  'Shrewsbury Town': {
    primaryColor:'#182090',secondaryColor:'#FFED00',
    formation:'4-4-2',ovr:58,manager:'Paul Hurst',badge:'🔵💛',
  },
  'Cambridge United': {
    primaryColor:'#F5A623',secondaryColor:'#231F20',
    formation:'4-4-2',ovr:57,manager:'Mark Bonner',badge:'🟡',
  },
  'Fleetwood Town': {
    primaryColor:'#EE3124',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:57,manager:'Charlie Adam',badge:'🔴',
  },
  'Leyton Orient': {
    primaryColor:'#EF3829',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:60,manager:'Richie Wellens',badge:'🔴⚪',
  },
  'Stevenage FC': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:58,manager:'Steve Evans',badge:'🔴',
  },
  'Cheltenham Town': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:56,manager:'Wade Elliott',badge:'🔴',
  },
  'Wycombe Wanderers': {
    primaryColor:'#003BDE',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:57,manager:'Matt Bloomfield',badge:'🔵',
  },
  'Burton Albion': {
    primaryColor:'#F5A623',secondaryColor:'#000000',
    formation:'4-3-3',ovr:57,manager:'Mark Robinson',badge:'🟡⚫',
  },

  // ── TIER 4: League Two ──────────────────────────────────
  'Grimsby Town': {
    primaryColor:'#000000',secondaryColor:'FFFFFF',
    formation:'4-4-2',ovr:60,manager:'David Artell',badge:'⚫⚪',
  },
  'Crawley Town': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:58,manager:'Rob Elliot',badge:'🔴',
  },
  'Swindon Town': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:59,manager:'Michael Flynn',badge:'🔴',
  },
  'Bradford City': {
    primaryColor:'#862633',secondaryColor:'#F5A623',
    formation:'4-4-2',ovr:58,manager:'Graham Alexander',badge:'🟤🟡',
  },
  'Barrow AFC': {
    primaryColor:'#0000CC',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:55,manager:'Mark Cooper',badge:'🔵',
  },
  'Doncaster Rovers': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:56,manager:'Grant McCann',badge:'🔴',
  },
  'AFC Wimbledon': {
    primaryColor:'#0000FF',secondaryColor:'#FFFF00',
    formation:'4-3-3',ovr:55,manager:'Johnnie Jackson',badge:'🔵💛',
  },
  'Colchester United': {
    primaryColor:'#0047AB',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:55,manager:'Danny Cowley',badge:'🔵⚪',
  },
  'Salford City': {
    primaryColor:'#CC0000',secondaryColor:'#000000',
    formation:'4-4-2',ovr:57,manager:'Karl Robinson',badge:'🔴⚫',
  },
  'Carlisle United': {
    primaryColor:'#0000CC',secondaryColor:'#CC0000',
    formation:'4-4-2',ovr:55,manager:'Paul Simpson',badge:'🔵🔴',
  },
  'Crewe Alexandra': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:55,manager:'Lee Bell',badge:'🔴⚪',
  },
  'Mansfield Town': {
    primaryColor:'#F5A623',secondaryColor:'#003366',
    formation:'4-4-2',ovr:60,manager:'Nigel Clough',badge:'🟡🔵',
  },
  'MK Dons': {
    primaryColor:'#FFFF00',secondaryColor:'#000000',
    formation:'4-3-3',ovr:56,manager:'Mike Williamson',badge:'💛⚫',
  },
  'Newport County': {
    primaryColor:'#F5A623',secondaryColor:'#000000',
    formation:'4-4-2',ovr:54,manager:'Graham Coughlan',badge:'🟡⚫',
  },
  'Northampton Town': {
    primaryColor:'#BC0020',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:55,manager:'Jon Brady',badge:'🔴⚪',
  },
  'Port Vale': {
    primaryColor:'#000000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:55,manager:'Andy Crosby',badge:'⚫⚪',
  },
  'Stockport County': {
    primaryColor:'#003082',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:60,manager:'Dave Challinor',badge:'🔵',
  },
  'Tranmere Rovers': {
    primaryColor:'#0000CC',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:54,manager:'Nigel Adkins',badge:'🔵',
  },
  'Rochdale AFC': {
    primaryColor:'#0052A2',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:53,manager:'Jim McNulty',badge:'🔵',
  },
  'Accrington Stanley': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:54,manager:'John Coleman',badge:'🔴',
  },

  // ── TIER 5: Non-League / Youth ──────────────────────────
  'Stevenage Youth': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:52,manager:'Youth Staff',badge:'🔴',
  },
  'Harrogate Town Academy': {
    primaryColor:'#F5A623',secondaryColor:'#000000',
    formation:'4-3-3',ovr:50,manager:'Simon Weaver',badge:'🟡',
  },
  'Wrexham Academy': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-3-3',ovr:52,manager:'Phil Parkinson',badge:'🔴🐉',
  },
  'Bromley Academy': {
    primaryColor:'#D22630',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:49,manager:'Andy Woodman',badge:'🔴',
  },
  'Aldershot Town': {
    primaryColor:'#CC0000',secondaryColor:'#0000CC',
    formation:'4-4-2',ovr:50,manager:'Tommy Widdrington',badge:'🔴🔵',
  },
  'Barnet FC': {
    primaryColor:'#F5A623',secondaryColor:'#000000',
    formation:'4-4-2',ovr:50,manager:'Dean Brennan',badge:'🟡⚫',
  },
  'Woking FC': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:49,manager:'Mark Sherwood',badge:'🔴',
  },
  'Dover Athletic': {
    primaryColor:'#FFFFFF',secondaryColor:'#000000',
    formation:'4-4-2',ovr:48,manager:'Andy Hessenthaler',badge:'⚪⚫',
  },
  'Dagenham & Redbridge': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:49,manager:'Ben Strevens',badge:'🔴⚪',
  },
  'York City Academy': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:49,manager:'John Askey',badge:'🔴',
  },
  'Oldham Athletic': {
    primaryColor:'#0652AA',secondaryColor:'#CC0000',
    formation:'4-4-2',ovr:50,manager:'Dino Maamria',badge:'🔵🔴',
  },
  'Torquay United': {
    primaryColor:'#FFFF00',secondaryColor:'#0000CC',
    formation:'4-4-2',ovr:48,manager:'Gary Johnson',badge:'💛🔵',
  },
  'Kidderminster Harriers': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:48,manager:'Michael Gash',badge:'🔴',
  },
  'FC Halifax Town': {
    primaryColor:'#003087',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:49,manager:'Chris Millington',badge:'🔵',
  },
  'Solihull Moors': {
    primaryColor:'#CC0000',secondaryColor:'#FFFFFF',
    formation:'4-4-2',ovr:49,manager:'Tim Flowers',badge:'🔴',
  },

  // ── La Liga ────────────────────────────────────────────────
  'Real Madrid': {primaryColor:'#FFFFFF',secondaryColor:'#00529F',formation:'4-3-3',ovr:91,manager:'Carlo Ancelotti',badge:'⚪👑'},
  'FC Barcelona': {primaryColor:'#A50044',secondaryColor:'#004D98',formation:'4-3-3',ovr:87,manager:'Hansi Flick',badge:'🔵🔴'},
  'Atlético de Madrid': {primaryColor:'#CB3524',secondaryColor:'#FFFFFF',formation:'4-4-2',ovr:84,manager:'Diego Simeone',badge:'🔴⚪'},
  'Sevilla FC': {primaryColor:'#D4001A',secondaryColor:'#FFFFFF',formation:'4-2-3-1',ovr:78,manager:'Francisco Lopetegui',badge:'🔴⚪'},
  'Real Betis': {primaryColor:'#00954C',secondaryColor:'#FFFFFF',formation:'4-2-3-1',ovr:77,manager:'Manuel Pellegrini',badge:'🟢⚪'},
  'Real Sociedad': {primaryColor:'#0063A6',secondaryColor:'#FFFFFF',formation:'4-3-3',ovr:77,manager:'Imanol Alguacil',badge:'🔵⚪'},
  'Athletic Club': {primaryColor:'#EE2523',secondaryColor:'#FFFFFF',formation:'4-2-3-1',ovr:76,manager:'Ernesto Valverde',badge:'🔴⚪'},
  'Villarreal CF': {primaryColor:'#FFDA1A',secondaryColor:'#0F3F82',formation:'4-4-2',ovr:76,manager:'Marcelino García',badge:'💛'},
  'Valencia CF': {primaryColor:'#FF7200',secondaryColor:'#000000',formation:'4-4-2',ovr:74,manager:'Rubén Baraja',badge:'🦇'},
  'Celta Vigo': {primaryColor:'#75AADB',secondaryColor:'#FFFFFF',formation:'4-3-3',ovr:72,manager:'Claudio Giráldez',badge:'🔵⚪'},
  'Rayo Vallecano': {primaryColor:'#FFFFFF',secondaryColor:'#CC0000',formation:'4-4-2',ovr:70,manager:'Francisco Serrano',badge:'⚪🔴'},
  'Osasuna': {primaryColor:'#C8102E',secondaryColor:'#003580',formation:'4-4-2',ovr:70,manager:'Jagoba Arrasate',badge:'🔴🔵'},
  'Getafe CF': {primaryColor:'#2E6DB4',secondaryColor:'#FFFFFF',formation:'4-4-2',ovr:69,manager:'José Bordalás',badge:'🔵'},
  'Mallorca': {primaryColor:'#C8102E',secondaryColor:'#000000',formation:'4-4-2',ovr:69,manager:'Javier Aguirre',badge:'🔴⚫'},
  'Girona FC': {primaryColor:'#9D2235',secondaryColor:'#FFFFFF',formation:'4-3-3',ovr:75,manager:'Míchel Sánchez',badge:'🔴⚪'},
  'Deportivo Alavés': {primaryColor:'#1347A8',secondaryColor:'#FFFFFF',formation:'4-4-2',ovr:67,manager:'Luis García Plaza',badge:'🔵⚪'},
  'Cádiz CF': {primaryColor:'#FFED00',secondaryColor:'#004A97',formation:'4-4-2',ovr:66,manager:'Sergio González',badge:'💛🔵'},
  'Almería': {primaryColor:'#CC0000',secondaryColor:'#FFFFFF',formation:'4-4-2',ovr:65,manager:'Rubén Albés',badge:'🔴⚪'},
  'Las Palmas': {primaryColor:'#FFED00',secondaryColor:'#003DA5',formation:'4-3-3',ovr:67,manager:'Diego Martínez',badge:'💛🔵'},
  'Espanyol': {primaryColor:'#003DA5',secondaryColor:'#FFFFFF',formation:'4-4-2',ovr:68,manager:'Manolo González',badge:'🔵⚪'},

  // ── Serie A ────────────────────────────────────────────────
  'Inter Milan': {primaryColor:'#010E80',secondaryColor:'#000000',formation:'3-5-2',ovr:88,manager:'Simone Inzaghi',badge:'🔵⚫'},
  'AC Milan': {primaryColor:'#FB090B',secondaryColor:'#000000',formation:'4-2-3-1',ovr:84,manager:'Paulo Fonseca',badge:'🔴⚫'},
  'Juventus': {primaryColor:'#000000',secondaryColor:'#FFFFFF',formation:'4-3-3',ovr:84,manager:'Thiago Motta',badge:'⚫⚪'},
  'Napoli': {primaryColor:'#12A0C3',secondaryColor:'#FFFFFF',formation:'4-3-3',ovr:82,manager:'Antonio Conte',badge:'🔵⚪'},
  'Lazio': {primaryColor:'#87D8F7',secondaryColor:'#FFFFFF',formation:'4-3-3',ovr:78,manager:'Marco Baroni',badge:'🔵⚪'},
  'AS Roma': {primaryColor:'#8B0000',secondaryColor:'#FFDE03',formation:'4-2-3-1',ovr:79,manager:'Ivan Juric',badge:'🔴💛'},
  'Atalanta': {primaryColor:'#1E3274',secondaryColor:'#000000',formation:'3-4-3',ovr:82,manager:'Gian Piero Gasperini',badge:'🔵⚫'},
  'Fiorentina': {primaryColor:'#4B2182',secondaryColor:'#FFFFFF',formation:'4-2-3-1',ovr:77,manager:'Raffaele Palladino',badge:'🟣⚪'},
  'Bologna': {primaryColor:'#990000',secondaryColor:'#0000FF',formation:'4-2-3-1',ovr:75,manager:'Vincenzo Italiano',badge:'🔴🔵'},
  'Torino': {primaryColor:'#8B0000',secondaryColor:'#FFFFFF',formation:'3-4-1-2',ovr:72,manager:'Paolo Vanoli',badge:'🔴⚪'},
  'Monza': {primaryColor:'#ED1C24',secondaryColor:'#FFFFFF',formation:'3-4-2-1',ovr:71,manager:'Raffaele Palladino',badge:'🔴⚪'},
  'Udinese': {primaryColor:'#000000',secondaryColor:'#FFFFFF',formation:'3-5-2',ovr:69,manager:'Kosta Runjaic',badge:'⚫⚪'},
  'Sassuolo': {primaryColor:'#00915A',secondaryColor:'#000000',formation:'4-2-3-1',ovr:70,manager:'Davide Ballardini',badge:'🟢⚫'},
  'Empoli': {primaryColor:'#00ADE5',secondaryColor:'#FFFFFF',formation:'3-4-2-1',ovr:67,manager:"Roberto D'Aversa",badge:'🔵⚪'},
  'Lecce': {primaryColor:'#FFD700',secondaryColor:'#8B0000',formation:'4-3-3',ovr:66,manager:'Luca Gotti',badge:'💛🔴'},
  'Salernitana': {primaryColor:'#8B0000',secondaryColor:'#FFD700',formation:'4-4-2',ovr:64,manager:'Stefano Colantuono',badge:'🔴💛'},
  'Cagliari': {primaryColor:'#B22222',secondaryColor:'#003082',formation:'4-3-1-2',ovr:67,manager:'Claudio Ranieri',badge:'🔴🔵'},
  'Frosinone': {primaryColor:'#FFC72C',secondaryColor:'#003082',formation:'4-3-3',ovr:64,manager:'Eusebio Di Francesco',badge:'💛🔵'},
  'Verona': {primaryColor:'#003DA5',secondaryColor:'#FFD700',formation:'3-4-2-1',ovr:67,manager:'Marco Baroni',badge:'🔵💛'},
  'Genoa': {primaryColor:'#8B0000',secondaryColor:'#003DA5',formation:'3-5-2',ovr:68,manager:'Alberto Gilardino',badge:'🔴🔵'},
};

// ── Helper: get club info with fallback ─────────────────────
// ── Club badge image loader ───────────────────────────────────────────────────
// Looks for a PNG in /badges/<league_folder>/<safe_name>.png
// Falls back gracefully to the emoji badge if the image doesn't exist.
// Usage: getClubBadgeUrl('Arsenal')  →  'badges/prem/arsenal.png'
// The img element should use onerror to hide itself on missing file.
const BADGE_LEAGUE_MAP = {
  // Premier League
  'Arsenal':'prem','Chelsea':'prem','Liverpool':'prem','Manchester City':'prem',
  'Manchester United':'prem','Tottenham Hotspur':'prem','Newcastle United':'prem',
  'Aston Villa':'prem','West Ham United':'prem','Brighton & Hove Albion':'prem',
  'Brentford FC':'prem','Crystal Palace':'prem','Everton FC':'prem','Fulham FC':'prem',
  'Leicester City':'prem','Nottingham Forest':'prem','Wolverhampton W':'prem',
  'Bournemouth AFC':'prem','Ipswich Town':'prem','Sheffield United':'prem',
  // Championship
  'Southampton':'champ','Leeds United':'champ','Burnley':'champ','Middlesbrough':'champ',
  'Coventry City':'champ','Preston NE':'champ','Stoke City':'champ','Millwall':'champ',
  'Swansea City':'champ','Birmingham City':'champ','Blackburn Rovers':'champ',
  'Blackpool FC':'champ','Cardiff City':'champ','Huddersfield Town':'champ',
  'Hull City':'champ','Luton Town':'champ','Norwich City':'champ','QPR':'champ',
  'Sheffield Wednesday':'champ','Sunderland AFC':'champ','Watford FC':'champ',
  'West Brom':'champ','Bristol City':'champ','Nottm Forest':'champ',
  // League One
  'Portsmouth':'l1','Charlton Athletic':'l1','Lincoln City':'l1','Shrewsbury Town':'l1',
  'Peterborough Utd':'l1','Oxford United':'l1','Exeter City':'l1','Derby County':'l1',
  'Bristol Rovers':'l1','Barnsley FC':'l1','Bolton Wanderers':'l1','Burton Albion':'l1',
  'Cambridge United':'l1','Cheltenham Town':'l1','Fleetwood Town':'l1',
  'Leyton Orient':'l1','Plymouth Argyle':'l1','Reading FC':'l1','Rotherham United':'l1',
  'Wigan Athletic':'l1','Wycombe Wanderers':'l1','Stevenage FC':'l1',
  // League Two
  'Grimsby Town':'l2','Crawley Town':'l2','Swindon Town':'l2','Bradford City':'l2',
  'Barrow AFC':'l2','Doncaster Rovers':'l2','AFC Wimbledon':'l2','Colchester United':'l2',
  'Salford City':'l2','Accrington Stanley':'l2','Carlisle United':'l2',
  'Crewe Alexandra':'l2','Forest Green Rovers':'l2','Gillingham FC':'l2',
  'Mansfield Town':'l2','MK Dons':'l2','Newport County':'l2','Northampton Town':'l2',
  'Port Vale':'l2','Rochdale AFC':'l2','Stockport County':'l2','Tranmere Rovers':'l2',
  // National Youth League (tier 5)
  'Stevenage Youth':'l5','Harrogate Town Academy':'l5','Fleetwood Town Academy':'l5',
  'Morecambe Academy':'l5','Aldershot Town':'l5','Barnet FC':'l5','Boreham Wood':'l5',
  'Dover Athletic':'l5','Woking FC':'l5','Bromley Academy':'l5',
  'Dagenham & Redbridge':'l5','Ebbsfleet United':'l5','Eastleigh FC':'l5',
  'FC Halifax Town':'l5','Hartlepool Academy':'l5','Maidenhead United':'l5',
  'Oldham Athletic':'l5','Solihull Moors':'l5','Torquay United':'l5',
  'Wrexham Academy':'l5','York City Academy':'l5','Kidderminster Harriers':'l5',
  // La Liga
  'Real Madrid':'laliga','FC Barcelona':'laliga','Atlético de Madrid':'laliga',
  'Sevilla FC':'laliga','Real Betis':'laliga','Real Sociedad':'laliga',
  'Athletic Club':'laliga','Villarreal CF':'laliga','Valencia CF':'laliga',
  'Celta Vigo':'laliga','Rayo Vallecano':'laliga','Osasuna':'laliga',
  'Getafe CF':'laliga','Mallorca':'laliga','Girona FC':'laliga',
  'Deportivo Alavés':'laliga','Cádiz CF':'laliga','Almería':'laliga',
  'Las Palmas':'laliga','Espanyol':'laliga',
  // Serie A
  'Inter Milan':'seriea','AC Milan':'seriea','Juventus':'seriea','Napoli':'seriea',
  'Lazio':'seriea','AS Roma':'seriea','Atalanta':'seriea','Fiorentina':'seriea',
  'Bologna':'seriea','Torino':'seriea','Monza':'seriea','Udinese':'seriea',
  'Sassuolo':'seriea','Empoli':'seriea','Lecce':'seriea','Salernitana':'seriea',
  'Cagliari':'seriea','Frosinone':'seriea','Verona':'seriea','Genoa':'seriea',
};

function _clubToFilename(name){
  // Converts club name to a safe filename: lowercase, spaces→underscores, strip special chars
  return name.toLowerCase()
    .replace(/[áàâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i')
    .replace(/[óòôö]/g,'o').replace(/[úùûü]/g,'u').replace(/[ñ]/g,'n')
    .replace(/[ç]/g,'c').replace(/é/g,'e')
    .replace(/[^a-z0-9\s&]/g,'').replace(/\s+/g,'_').replace(/&/g,'and')
    .replace(/_+/g,'_').replace(/^_|_$/g,'');
}

function getClubBadgeUrl(clubName){
  const folder=BADGE_LEAGUE_MAP[clubName]||'misc';
  const file=_clubToFilename(clubName);
  return `badges/${folder}/${file}.png`;
}

// Returns an <img> tag that gracefully hides if the badge PNG is missing.
// size: CSS size string e.g. '24px'. The img sits inline.
function clubBadgeImg(clubName, size='24px', extraStyle=''){
  const src=getClubBadgeUrl(clubName);
  const info=getClubInfo(clubName);
  return `<img src="${src}" alt="" width="${size}" height="${size}"
    style="object-fit:contain;vertical-align:middle;${extraStyle}"
    onerror="this.style.display='none';this.nextSibling&&(this.nextSibling.style.display='inline');">
    <span style="display:none;font-size:14px;">${info.badge||'⚽'}</span>`;
}

function getClubInfo(clubName) {
  if (CLUB_DATA[clubName]) return CLUB_DATA[clubName];

  // Generate deterministic fallback from name hash
  const colors = [
    ['#4a9eff','#FFFFFF'],['#ff4757','#FFFFFF'],['#f5c842','#000000'],
    ['#00e5a0','#000000'],['#a78bfa','#FFFFFF'],['#ff6b35','#FFFFFF'],
    ['#2ed573','#000000'],['#1e90ff','#FFFFFF'],
  ];
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) hash = (hash * 31 + clubName.charCodeAt(i)) & 0xffffffff;
  const [pc, sc] = colors[Math.abs(hash) % colors.length];
  return {
    primaryColor: pc, secondaryColor: sc,
    formation: '4-4-2', ovr: 65, manager: 'Unknown', badge: '⚽',
  };
}

// ── Formation definitions ───────────────────────────────────
// Returns array of {x,y} positions (0..1 normalised)
// x=0 = own goal, x=1 = opponent goal, y=0 = top, y=1 = bottom
function getFormationPositions(formationStr) {
  const F = {
    '4-4-2': [
      {x:0.06,y:0.50},                                           // GK
      {x:0.22,y:0.15},{x:0.22,y:0.38},{x:0.22,y:0.62},{x:0.22,y:0.85}, // DEF
      {x:0.48,y:0.15},{x:0.48,y:0.38},{x:0.48,y:0.62},{x:0.48,y:0.85}, // MID
      {x:0.72,y:0.35},{x:0.72,y:0.65},                          // ATT
    ],
    '4-3-3': [
      {x:0.06,y:0.50},
      {x:0.22,y:0.15},{x:0.22,y:0.38},{x:0.22,y:0.62},{x:0.22,y:0.85},
      {x:0.46,y:0.25},{x:0.46,y:0.50},{x:0.46,y:0.75},
      {x:0.70,y:0.15},{x:0.70,y:0.50},{x:0.70,y:0.85},
    ],
    '4-2-3-1': [
      {x:0.06,y:0.50},
      {x:0.22,y:0.15},{x:0.22,y:0.38},{x:0.22,y:0.62},{x:0.22,y:0.85},
      {x:0.40,y:0.35},{x:0.40,y:0.65},
      {x:0.58,y:0.15},{x:0.58,y:0.50},{x:0.58,y:0.85},
      {x:0.74,y:0.50},
    ],
    '3-5-2': [
      {x:0.06,y:0.50},
      {x:0.22,y:0.25},{x:0.22,y:0.50},{x:0.22,y:0.75},
      {x:0.42,y:0.10},{x:0.42,y:0.30},{x:0.42,y:0.50},{x:0.42,y:0.70},{x:0.42,y:0.90},
      {x:0.70,y:0.35},{x:0.70,y:0.65},
    ],
    '5-3-2': [
      {x:0.06,y:0.50},
      {x:0.20,y:0.10},{x:0.20,y:0.30},{x:0.20,y:0.50},{x:0.20,y:0.70},{x:0.20,y:0.90},
      {x:0.46,y:0.25},{x:0.46,y:0.50},{x:0.46,y:0.75},
      {x:0.70,y:0.35},{x:0.70,y:0.65},
    ],
  };
  return F[formationStr] || F['4-4-2'];
}

// Get how far forward the formation shifts when attacking/defending
// Returns an x-offset (0..1 scale) applied to all non-GK players
function getFormationPressure(formationStr) {
  // High press formations
  const highPress = ['4-3-3','3-5-2'];
  return highPress.includes(formationStr) ? 0.12 : 0.08;
}
