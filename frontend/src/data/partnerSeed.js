// Fallback partner directory so the Business & Promo Hub stays fully usable
// when the API is unreachable (offline dev, cold backend, or no MongoDB).

// Hotel-specific detail: photo gallery, room types, amenities and charges.
const HOTEL_EXTRAS = {
  prt_kh_1: {
    images: ['/hotel-images/himalayan-grand.svg'],
    rooms: [
      { id: 'deluxe', name: 'Deluxe Heritage Room', pricePerNight: 6500, capacity: 2, bed: 'King bed', size: '32 m²', breakfast: true },
      { id: 'suite', name: 'Durbar View Suite', pricePerNight: 9800, capacity: 3, bed: 'King + sofa bed', size: '48 m²', breakfast: true },
      { id: 'family', name: 'Family Heritage Suite', pricePerNight: 12500, capacity: 4, bed: '2 Queen beds', size: '58 m²', breakfast: true }
    ],
    amenities: ['Free WiFi', 'Rooftop restaurant', 'Spa & sauna', 'Airport pickup', '24h front desk', 'Fitness centre'],
    checkIn: '14:00',
    checkOut: '12:00',
    taxesPercent: 13,
    serviceFee: 120,
    address: 'Durbar Marg, Kathmandu 44600, Nepal'
  },
  prt_pk_1: {
    images: ['/hotel-images/lakeside-retreat.svg'],
    rooms: [
      { id: 'lakeview', name: 'Lakeview Balcony Room', pricePerNight: 4800, capacity: 2, bed: 'Queen bed', size: '26 m²', breakfast: true },
      { id: 'annapurna', name: 'Annapurna Facing Suite', pricePerNight: 7200, capacity: 2, bed: 'King bed', size: '38 m²', breakfast: true },
      { id: 'family', name: 'Lakeside Family Cottage', pricePerNight: 9400, capacity: 4, bed: '2 Double beds', size: '52 m²', breakfast: false }
    ],
    amenities: ['Free WiFi', 'Free kayaking', 'Lakefront terrace', 'Bike hire', 'Breakfast buffet', 'Laundry'],
    checkIn: '13:00',
    checkOut: '11:00',
    taxesPercent: 13,
    serviceFee: 90,
    address: 'Lakeside Road, Pokhara 33700, Nepal'
  },
  prt_bk_1: {
    images: ['/hotel-images/bhaktapur-heritage.svg'],
    rooms: [
      { id: 'newari', name: 'Traditional Newari Room', pricePerNight: 3900, capacity: 2, bed: 'Double bed', size: '22 m²', breakfast: true },
      { id: 'courtyard', name: 'Courtyard Heritage Suite', pricePerNight: 5800, capacity: 3, bed: 'King bed', size: '34 m²', breakfast: true }
    ],
    amenities: ['Free WiFi', 'Carved courtyard', 'Newari breakfast', 'Pottery workshop', 'Rooftop cafe'],
    checkIn: '13:00',
    checkOut: '11:00',
    taxesPercent: 13,
    serviceFee: 80,
    address: 'Nyatapola Square, Bhaktapur 44800, Nepal'
  },
  prt_ev_1: {
    images: ['/hotel-images/everest-base-lodge.svg'],
    rooms: [
      { id: 'dorm', name: 'Heated Trekker Dorm', pricePerNight: 1800, capacity: 1, bed: 'Single bunk', size: 'Shared dorm', breakfast: false },
      { id: 'twin', name: 'Twin Altitude Room', pricePerNight: 3400, capacity: 2, bed: '2 Single beds', size: '18 m²', breakfast: true },
      { id: 'summit', name: 'Summit View Room', pricePerNight: 4900, capacity: 2, bed: 'Double bed', size: '24 m²', breakfast: true }
    ],
    amenities: ['Heated dorm', 'Sherpa guides', 'Oxygen support', 'Packed lunch', 'Gear storage'],
    checkIn: '12:00',
    checkOut: '10:00',
    taxesPercent: 13,
    serviceFee: 60,
    address: 'Khumbu Trailhead, Namche Bazaar 56000, Nepal'
  },
  prt_lb_1: {
    images: ['/hotel-images/lumbini-peace-garden.svg'],
    rooms: [
      { id: 'peace', name: 'Peace Garden Room', pricePerNight: 3200, capacity: 2, bed: 'Double bed', size: '24 m²', breakfast: true },
      { id: 'monastic', name: 'Monastic Garden Suite', pricePerNight: 5100, capacity: 3, bed: 'King bed', size: '36 m²', breakfast: true }
    ],
    amenities: ['Free WiFi', 'Meditation hall', 'Vegetarian kitchen', 'Cycle hire', 'Guided garden walks'],
    checkIn: '14:00',
    checkOut: '12:00',
    taxesPercent: 13,
    serviceFee: 70,
    address: 'Sacred Garden Zone, Lumbini 32900, Nepal'
  }
};

const PARTNERS = [
  {
    _id: 'prt_kh_1',
    name: 'Himalayan Grand Hotel',
    category: 'hotel',
    city: 'Kathmandu',
    area: 'Durbar Marg',
    description: 'Five-star heritage hotel with rooftop dining, spa and airport transfers — minutes from Durbar Square.',
    promoCode: 'NEPALSTAY20',
    discountPercent: 20,
    commissionPercent: 12,
    tier: 'enterprise',
    rating: 4.8,
    reviewCount: 412,
    isVerified: true,
    managedBy: 'admin',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_pk_1',
    name: 'Lakeside Retreat Pokhara',
    category: 'hotel',
    city: 'Pokhara',
    area: 'Lakeside Road',
    description: 'Boutique lakeside stay with Annapurna-facing balconies and free kayaking for guests.',
    promoCode: 'PHEWA15',
    discountPercent: 15,
    commissionPercent: 10,
    tier: 'growth',
    rating: 4.6,
    reviewCount: 268,
    isVerified: true,
    managedBy: 'promoter',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_bk_1',
    name: 'Bhaktapur Heritage Inn',
    category: 'hotel',
    city: 'Bhaktapur',
    area: 'Nyatapola Square',
    description: 'Restored Newari townhouse with carved courtyards, steps away from the five-storey temple.',
    promoCode: 'NEWARSTAY18',
    discountPercent: 18,
    commissionPercent: 11,
    tier: 'growth',
    rating: 4.7,
    reviewCount: 186,
    isVerified: true,
    managedBy: 'admin',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_ev_1',
    name: 'Everest Base Camp Lodge',
    category: 'hotel',
    city: 'Namche Bazaar',
    area: 'Khumbu Trailhead',
    description: 'Trekker lodge with heated dorms, altitude acclimatisation advice and Sherpa-guided departures.',
    promoCode: 'TREKSTAY25',
    discountPercent: 25,
    commissionPercent: 14,
    tier: 'enterprise',
    rating: 4.5,
    reviewCount: 341,
    isVerified: true,
    managedBy: 'promoter',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_lb_1',
    name: 'Lumbini Peace Garden Resort',
    category: 'hotel',
    city: 'Lumbini',
    area: 'Sacred Garden Zone',
    description: 'Quiet meditation-friendly resort beside the monastic zone with vegetarian kitchen and cycle hire.',
    promoCode: 'PEACE12',
    discountPercent: 12,
    commissionPercent: 9,
    tier: 'starter',
    rating: 4.4,
    reviewCount: 97,
    isVerified: true,
    managedBy: 'admin',
    listedBy: 'traveller',
    status: 'active'
  },
  {
    _id: 'prt_kt_1',
    name: 'Thamel Handicraft Bazaar',
    category: 'shop',
    city: 'Kathmandu',
    area: 'Thamel Marg',
    description: 'Pashmina shawls, singing bowls and hand-knotted carpets direct from local artisans.',
    promoCode: 'THAMEL10',
    discountPercent: 10,
    commissionPercent: 8,
    tier: 'growth',
    rating: 4.5,
    reviewCount: 189,
    isVerified: true,
    managedBy: 'developer',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_kt_2',
    name: 'Everest Gear Outfitters',
    category: 'shop',
    city: 'Kathmandu',
    area: 'Lazimpat',
    description: 'Rental down jackets, trekking poles and altitude gear vetted by certified guides.',
    promoCode: 'GEAR15',
    discountPercent: 15,
    commissionPercent: 9,
    tier: 'growth',
    rating: 4.4,
    reviewCount: 214,
    isVerified: true,
    managedBy: 'developer',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_pk_2',
    name: 'Annapurna Trek Supplies',
    category: 'shop',
    city: 'Pokhara',
    area: 'Lakeside Marg',
    description: 'Sleeping bags, gaiters and permits desk for Annapurna circuits — gear fitting included.',
    promoCode: 'ANNAPURNA12',
    discountPercent: 12,
    commissionPercent: 8,
    tier: 'starter',
    rating: 4.3,
    reviewCount: 132,
    isVerified: true,
    managedBy: 'promoter',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_kt_3',
    name: 'Patan Metalworks Studio',
    category: 'shop',
    city: 'Lalitpur',
    area: 'Patan Durbar',
    description: 'Hand-cast brass statues and ritual items made by third-generation Newari craftsmen.',
    promoCode: 'PATAN20',
    discountPercent: 20,
    commissionPercent: 11,
    tier: 'enterprise',
    rating: 4.9,
    reviewCount: 74,
    isVerified: true,
    managedBy: 'developer',
    listedBy: 'traveller',
    status: 'active'
  },
  {
    _id: 'prt_bk_2',
    name: 'Newari Kitchen Bhaktapur',
    category: 'restaurant',
    city: 'Bhaktapur',
    area: 'Nyatapola Square',
    description: 'Traditional Newari thali, bara and juju dhau served in a restored courtyard.',
    promoCode: 'NEWARI25',
    discountPercent: 25,
    commissionPercent: 15,
    tier: 'enterprise',
    rating: 4.7,
    reviewCount: 301,
    isVerified: true,
    managedBy: 'promoter',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_kt_4',
    name: 'Momo Mahal Kathmandu',
    category: 'restaurant',
    city: 'Kathmandu',
    area: 'Jhamsikhel',
    description: 'Steamed, jhol and fried momo platters plus sel roti in a buzzing courtyard.',
    promoCode: 'MOMO18',
    discountPercent: 18,
    commissionPercent: 11,
    tier: 'growth',
    rating: 4.3,
    reviewCount: 154,
    isVerified: true,
    managedBy: 'admin',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_pk_3',
    name: 'Lakeside Thakali Diner',
    category: 'restaurant',
    city: 'Pokhara',
    area: 'Baidam Road',
    description: 'Authentic Thakali dal-bhat sets with mustard greens and lake-facing terrace seating.',
    promoCode: 'THAKALI15',
    discountPercent: 15,
    commissionPercent: 10,
    tier: 'growth',
    rating: 4.6,
    reviewCount: 223,
    isVerified: true,
    managedBy: 'promoter',
    listedBy: 'shopkeeper',
    status: 'active'
  },
  {
    _id: 'prt_kt_5',
    name: 'Durbar Rooftop Cafe',
    category: 'restaurant',
    city: 'Kathmandu',
    area: 'Basantapur',
    description: 'Rooftop espresso and Newari snacks overlooking the temple spires of Durbar Square.',
    promoCode: 'DURBARCafe10',
    discountPercent: 10,
    commissionPercent: 9,
    tier: 'starter',
    rating: 4.2,
    reviewCount: 88,
    isVerified: true,
    managedBy: 'admin',
    listedBy: 'traveller',
    status: 'active'
  }
];

// Flatten the hotel extras onto each record so one partner object carries
// its gallery, room types, amenities and charges for the booking screen.
export const PARTNER_SEED = PARTNERS.map((partner) => {
  const extras = HOTEL_EXTRAS[partner._id];
  if (!extras) return partner;
  const cheapest = extras.rooms.reduce(
    (min, room) => (room.pricePerNight < min.pricePerNight ? room : min),
    extras.rooms[0]
  );
  return {
    ...partner,
    ...extras,
    pricePerNight: cheapest.pricePerNight,
    roomCount: extras.rooms.length
  };
});

export const getPartnerById = (id) => PARTNER_SEED.find((partner) => partner._id === id) || null;
