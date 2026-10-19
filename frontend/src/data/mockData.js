export const DESTINATIONS_3D = [
  {
    id: 'downtown',
    name: 'Downtown Cyber Hub & Plaza',
    category: 'Business & Tech',
    address: '700 Financial Way, SF',
    lat: 37.7885,
    lng: -122.4014,
    description: 'Ultra-modern glass skyscrapers with elevated skywalks, ambient neon lighting, and tech startup centers.',
    colorTheme: '#06b6d4',
    skyColor: '#0b132b',
    landmarks: ['Cyber Tower One', 'Quantum Square', 'Velocita Hub']
  },
  {
    id: 'ocean',
    name: 'Oceanfront Bay Resort & Pier',
    category: 'Coastal Scenic',
    address: '1200 Pacific Drive, SF',
    lat: 37.8085,
    lng: -122.4150,
    description: 'Scenic coastal boulevard featuring palm promenades, luxury yacht marina, and sunset viewing deck.',
    colorTheme: '#3b82f6',
    skyColor: '#0f172a',
    landmarks: ['Marina Pier 39', 'Sunset Deck', 'Lighthouse Pointe']
  },
  {
    id: 'historic',
    name: 'Historic Heritage Cultural Plaza',
    category: 'Culture & Arts',
    address: '450 Mission Heritage St, SF',
    lat: 37.7615,
    lng: -122.4210,
    description: 'Charming historic cobblestone walkways lined with artisanal coffee houses, art galleries, and stone monuments.',
    colorTheme: '#f59e0b',
    skyColor: '#1e1b18',
    landmarks: ['Heritage Cathedral', 'Artisans Market', 'Grand Clock Tower']
  },
  {
    id: 'alpine',
    name: 'Alpine Heights & Ridge Gateway',
    category: 'Nature & Adventure',
    address: '950 Mountain View Crest, SF',
    lat: 37.7450,
    lng: -122.4480,
    description: 'Breathtaking mountain trail overlook with panoramic city vistas, pine tree ridge, and fresh mountain breezes.',
    colorTheme: '#10b981',
    skyColor: '#062016',
    landmarks: ['Twin Peaks Overlook', 'Pine Ridge Trailhead', 'Skyline Platform']
  },
  {
    id: 'sfo_airport',
    name: 'SFO International Airport (Terminals 1-3 & SkyTrain)',
    category: 'Airport & Transit Hub',
    address: 'San Francisco International Airport, SF, CA 94128',
    lat: 37.6213,
    lng: -122.3790,
    description: 'Premier international gateway with elevated automated SkyTrain guideways, flight lounges, and passenger terminals.',
    colorTheme: '#38bdf8',
    skyColor: '#0c4a6e',
    landmarks: ['Terminal 2 SkyLounge', 'AirTrain Transit Hub', 'International Departure Concourse']
  },
  {
    id: 'silicon_valley',
    name: 'Silicon Valley Mega Tech Campus & Innovation Park',
    category: 'Tech Campus & R&D',
    address: '1 Hacker Way / Infinite Loop, Menlo Park, CA',
    lat: 37.4848,
    lng: -122.1484,
    description: 'World-renowned technology hub with manicured tech plazas, EV supercharger lanes, and AI research pavilions.',
    colorTheme: '#8b5cf6',
    skyColor: '#1e1b4b',
    landmarks: ['Quantum Computing Lab', 'Solar Promenade', 'AI Innovation Center']
  },
  {
    id: 'golden_gate',
    name: 'Golden Gate Scenic Vista & Bridge Overlook',
    category: 'Sightseeing & Iconic Landmarks',
    address: 'Golden Gate Bridge Coastal Vista, SF',
    lat: 37.8199,
    lng: -122.4783,
    description: 'World-famous coastal viewpoint with panoramic views of the suspension bridge towers and Pacific bay waters.',
    colorTheme: '#f43f5e',
    skyColor: '#4c0519',
    landmarks: ['Vista Point Observation Deck', 'Bridge Pavilion', 'Battery Spencer Overlook']
  },
  {
    id: 'stadium',
    name: 'Metropolitan Stadium & Arena Sports District',
    category: 'Sports & Entertainment Arena',
    address: '1 Warriors Way / Ballpark Marina, SF',
    lat: 37.7680,
    lng: -122.3877,
    description: 'Championship 20,000-seat multi-purpose entertainment arena with waterside plazas and glowing LED facade.',
    colorTheme: '#ec4899',
    skyColor: '#500724',
    landmarks: ['Championship Plaza', 'Marina Esplanade', 'Grand Atrium Entrance']
  }
];

export const VEHICLE_TIERS = [
  {
    id: 'eco',
    name: 'Eco Sedan',
    icon: 'Car',
    tagline: 'Fast, comfortable, electric hybrid',
    multiplier: 1.0,
    etaMinutes: 4,
    capacity: '1-3 passengers',
    co2Saved: '1.2 kg'
  },
  {
    id: 'premium',
    name: 'Premium SUV',
    icon: 'Shield',
    tagline: 'Luxury leather seating, extra room',
    multiplier: 1.6,
    etaMinutes: 6,
    capacity: '1-5 passengers',
    co2Saved: '0.8 kg'
  },
  {
    id: 'shuttle',
    name: 'Electric Shuttle',
    icon: 'Bus',
    tagline: 'Zero-emission group vehicle',
    multiplier: 0.85,
    etaMinutes: 8,
    capacity: '1-7 passengers',
    co2Saved: '3.5 kg'
  },
  {
    id: 'guider',
    name: 'Guider Co-Ride',
    icon: 'Compass',
    tagline: 'Includes local expert travel guider',
    multiplier: 1.4,
    etaMinutes: 5,
    capacity: '1-3 passengers + Guider',
    co2Saved: '1.5 kg'
  }
];
