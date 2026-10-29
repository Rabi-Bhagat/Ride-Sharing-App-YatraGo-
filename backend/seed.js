const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend or root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const Guider = require('./models/Guider');
const Ride = require('./models/Ride');
const SosAlert = require('./models/SosAlert');
const Message = require('./models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yatrago_rideshare';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas for database seeding...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`Connected to database cluster: ${mongoose.connection.host}`);

    // Clear existing sample collections
    await User.deleteMany({});
    await Guider.deleteMany({});
    await Ride.deleteMany({});
    await SosAlert.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared existing collections for fresh seeding.');

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@yatrago.com',
        phone: '+1 (555) 234-8901',
        role: 'rider',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        verificationBadgeType: 'Government ID',
        rating: 4.96,
        tripsCompleted: 68,
        bio: 'Urban explorer & tech product designer. Regularly booking eco-shuttles and local travel guiders.',
        emergencyContacts: [
          { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
          { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
        ]
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@biotechlabs.org',
        phone: '+1 (555) 345-6789',
        role: 'rider',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        verificationBadgeType: 'Government ID',
        rating: 4.93,
        tripsCompleted: 94,
        bio: 'Biotechnology keynote researcher heading to Downtown Cyber Hub and airport flights.',
        emergencyContacts: [
          { name: 'David Jenkins', phone: '+1 (555) 888-9922', relation: 'Spouse' }
        ]
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@yatragodriver.com',
        phone: '+1 (555) 888-2311',
        role: 'driver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        verificationBadgeType: 'Gold Driver',
        rating: 4.98,
        tripsCompleted: 1420,
        bio: 'Top-rated professional EV driver with Tesla Model Y. 5 years safe driving record.',
        emergencyContacts: [
          { name: 'Fleet Support Dispatch', phone: '+1 (555) 900-3000', relation: 'Fleet Control' }
        ]
      },
      {
        name: 'David Kim',
        email: 'david.kim@quantumcapital.io',
        phone: '+1 (555) 765-4321',
        role: 'rider',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        verificationBadgeType: 'Government ID',
        rating: 4.91,
        tripsCompleted: 52,
        bio: 'Angel investor & co-rider sharing commutes to minimize road emissions.',
        emergencyContacts: [
          { name: 'Grace Kim', phone: '+1 (555) 444-1234', relation: 'Partner' }
        ]
      }
    ]);
    console.log(`Seeded ${users.length} verified users into User collection.`);

    // 2. Seed Guiders
    const guiders = await Guider.create([
      {
        name: 'Sofia Martinez',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        languages: ['English', 'Spanish', 'French'],
        specialties: ['Architectural Landmarks', 'Local Gastronomy', 'Nightlife Routes'],
        hourlyRate: 35,
        rating: 4.98,
        reviewCount: 164,
        isVerifiedGuider: true,
        city: 'Downtown Cyber Hub & Plaza',
        bio: 'Licensed city guide with 7+ years experience showing visitors hidden cultural gems, rooftop lounges, and tech landmarks.',
        toursOffered: [
          { title: 'Tech Hub & Skyline Sunset Tour', duration: '2 Hours', price: 45, preview3DId: 'downtown' },
          { title: 'Historic Cultural District Walk', duration: '3 Hours', price: 60, preview3DId: 'historic' }
        ],
        isAvailable: true
      },
      {
        name: 'Kenji Takahashi',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        languages: ['English', 'Japanese'],
        specialties: ['Oceanfront Coast', 'Sunset Photography', 'Maritime History'],
        hourlyRate: 40,
        rating: 4.94,
        reviewCount: 112,
        isVerifiedGuider: true,
        city: 'Oceanfront Bay Resort & Pier',
        bio: 'Avid coastal photographer and maritime navigator. I escort co-riders along scenic ocean drives and harbor docks.',
        toursOffered: [
          { title: 'Pacific Rim Panoramic Drive', duration: '2.5 Hours', price: 55, preview3DId: 'ocean' },
          { title: 'Golden Gate Bridge Coastal Overlook', duration: '2 Hours', price: 50, preview3DId: 'golden_gate' }
        ],
        isAvailable: true
      },
      {
        name: 'Amara Okafor',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
        languages: ['English', 'Igbo', 'German'],
        specialties: ['Mountain Trails', 'Art Galleries', 'Food Markets'],
        hourlyRate: 30,
        rating: 4.96,
        reviewCount: 128,
        isVerifiedGuider: true,
        city: 'Alpine Heights & Ridge Gateway',
        bio: 'Outdoor trail enthusiast and local food critic. Ready to join your ride share and guide your scenic ridge expedition.',
        toursOffered: [
          { title: 'Alpine Gateway & Peak Preview', duration: '4 Hours', price: 80, preview3DId: 'alpine' }
        ],
        isAvailable: true
      },
      {
        name: 'Marcus Thorne',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
        languages: ['English', 'Italian'],
        specialties: ['Silicon Innovation History', 'Tech Campuses', 'Autonomous Transport'],
        hourlyRate: 42,
        rating: 4.99,
        reviewCount: 198,
        isVerifiedGuider: true,
        city: 'Silicon Valley Mega Tech Campus',
        bio: 'Veteran tech journalist and Silicon Valley insider guiding visitors through legendary R&D parks and campus archives.',
        toursOffered: [
          { title: 'Silicon Legends & AI Pavilion Tour', duration: '3 Hours', price: 75, preview3DId: 'silicon_valley' }
        ],
        isAvailable: true
      }
    ]);
    console.log(`Seeded ${guiders.length} certified travel guiders into Guider collection.`);

    // 3. Seed Rides
    const rides = await Ride.create([
      {
        pickup: { name: 'Innovation Tech Park, SF', lat: 37.7749, lng: -122.4194 },
        destination: { name: 'Downtown Cyber Hub & Plaza', lat: 37.7885, lng: -122.4014, preview3DId: 'downtown' },
        riders: [
          {
            userId: users[0]._id.toString(),
            name: 'Alex Rivera',
            avatar: users[0].avatar,
            isVerified: true,
            isPrimary: true,
            costShare: 16.50,
            paymentStatus: 'Paid'
          },
          {
            userId: users[1]._id.toString(),
            name: 'Sarah Jenkins',
            avatar: users[1].avatar,
            isVerified: true,
            isPrimary: false,
            costShare: 16.50,
            paymentStatus: 'Paid'
          }
        ],
        driver: {
          name: 'Marcus Vance',
          vehicle: 'Tesla Model Y (Metallic Silver)',
          licensePlate: '7Velo89',
          rating: 4.97,
          phone: '+1 (555) 888-2311',
          lat: 37.7790,
          lng: -122.4130
        },
        guider: {
          guiderId: guiders[0]._id.toString(),
          name: 'Sofia Martinez',
          fee: 35
        },
        vehicleType: 'Eco Sedan',
        status: 'In Progress',
        isStrangerCombined: true,
        strangerSavingsPercentage: 44,
        totalCost: 33.00,
        distanceKm: 8.4,
        etaMinutes: 14,
        costSplits: [
          { riderName: 'Alex Rivera', amount: 16.50, percentage: 50, status: 'Paid' },
          { riderName: 'Sarah Jenkins', amount: 16.50, percentage: 50, status: 'Paid' }
        ]
      },
      {
        pickup: { name: 'Mission Dolores District', lat: 37.7615, lng: -122.4210 },
        destination: { name: 'SFO International Airport (Terminals 1-3 & SkyTrain)', lat: 37.6213, lng: -122.3790, preview3DId: 'sfo_airport' },
        riders: [
          {
            userId: users[1]._id.toString(),
            name: 'Sarah Jenkins',
            avatar: users[1].avatar,
            isVerified: true,
            isPrimary: true,
            costShare: 24.00,
            paymentStatus: 'Paid'
          },
          {
            userId: users[3]._id.toString(),
            name: 'David Kim',
            avatar: users[3].avatar,
            isVerified: true,
            isPrimary: false,
            costShare: 24.00,
            paymentStatus: 'Paid'
          }
        ],
        driver: {
          name: 'Marcus Vance',
          vehicle: 'Tesla Model Y (Metallic Silver)',
          licensePlate: '7Velo89',
          rating: 4.97,
          phone: '+1 (555) 888-2311',
          lat: 37.7000,
          lng: -122.4000
        },
        vehicleType: 'Electric Shuttle',
        status: 'Completed',
        isStrangerCombined: true,
        strangerSavingsPercentage: 40,
        totalCost: 48.00,
        distanceKm: 18.2,
        etaMinutes: 22,
        costSplits: [
          { riderName: 'Sarah Jenkins', amount: 24.00, percentage: 50, status: 'Paid' },
          { riderName: 'David Kim', amount: 24.00, percentage: 50, status: 'Paid' }
        ]
      }
    ]);
    console.log(`Seeded ${rides.length} trips into Ride collection.`);

    // 4. Seed Messages for Active Ride Chat
    const messages = await Message.create([
      {
        rideId: rides[0]._id.toString(),
        senderId: users[0]._id.toString(),
        senderName: 'Alex Rivera',
        senderRole: 'rider',
        senderAvatar: users[0].avatar,
        isVerified: true,
        text: 'Hello everyone! I am waiting right outside the Innovation Tech Park main entrance lobby.',
        timestamp: new Date(Date.now() - 1000 * 60 * 12)
      },
      {
        rideId: rides[0]._id.toString(),
        senderId: users[2]._id.toString(),
        senderName: 'Marcus Vance',
        senderRole: 'driver',
        senderAvatar: users[2].avatar,
        isVerified: true,
        text: 'Hi Alex and Sarah! This is Marcus in the Silver Tesla Model Y. ETA is 3 minutes. Hazards will be flashing at the curb.',
        timestamp: new Date(Date.now() - 1000 * 60 * 8)
      },
      {
        rideId: rides[0]._id.toString(),
        senderId: users[1]._id.toString(),
        senderName: 'Sarah Jenkins',
        senderRole: 'rider',
        senderAvatar: users[1].avatar,
        isVerified: true,
        text: 'Awesome! So glad we combined this ride. Saved $14.50 on the commute to Downtown Cyber Hub!',
        timestamp: new Date(Date.now() - 1000 * 60 * 4)
      },
      {
        rideId: rides[0]._id.toString(),
        senderId: guiders[0]._id.toString(),
        senderName: 'Sofia Martinez',
        senderRole: 'guider',
        senderAvatar: guiders[0].avatar,
        isVerified: true,
        text: 'Welcome aboard! I have our itinerary ready for the Downtown Cyber Hub and the rooftop skywalk observation deck.',
        timestamp: new Date(Date.now() - 1000 * 60 * 1)
      }
    ]);
    console.log(`Seeded ${messages.length} live group chat messages into Message collection.`);

    // 5. Seed SOS Alert Sample
    await SosAlert.create({
      userId: users[0]._id.toString(),
      userName: 'Alex Rivera',
      userPhone: '+1 (555) 234-8901',
      location: {
        lat: 37.7749,
        lng: -122.4194,
        addressName: 'Innovation Tech Park Gateway'
      },
      status: 'RESOLVED'
    });
    console.log('Seeded safety alert log into SosAlert collection.');

    console.log('✨ All collections successfully populated in MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
};

seedData();
