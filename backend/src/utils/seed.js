require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');

const TEAMS_DATA = [
  { name: 'Mumbai Indians', shortName: 'MI', city: 'Mumbai', primaryColor: '#005DA0', secondaryColor: '#D4AF37', emoji: '🔵' },
  { name: 'Chennai Super Kings', shortName: 'CSK', city: 'Chennai', primaryColor: '#F9A825', secondaryColor: '#0033A0', emoji: '🟡' },
  { name: 'Royal Challengers Bengaluru', shortName: 'RCB', city: 'Bengaluru', primaryColor: '#C8102E', secondaryColor: '#000000', emoji: '🔴' },
  { name: 'Kolkata Knight Riders', shortName: 'KKR', city: 'Kolkata', primaryColor: '#3A225D', secondaryColor: '#B3A123', emoji: '🟣' },
  { name: 'Sunrisers Hyderabad', shortName: 'SRH', city: 'Hyderabad', primaryColor: '#FF822A', secondaryColor: '#000000', emoji: '🟠' },
  { name: 'Delhi Capitals', shortName: 'DC', city: 'Delhi', primaryColor: '#004C93', secondaryColor: '#EF1C25', emoji: '🔷' },
  { name: 'Rajasthan Royals', shortName: 'RR', city: 'Jaipur', primaryColor: '#E91E8C', secondaryColor: '#254AA5', emoji: '🩷' },
  { name: 'Punjab Kings', shortName: 'PBKS', city: 'Mohali', primaryColor: '#ED1C24', secondaryColor: '#A7A9AC', emoji: '❤️' },
  { name: 'Lucknow Super Giants', shortName: 'LSG', city: 'Lucknow', primaryColor: '#A72056', secondaryColor: '#00ADEF', emoji: '🟢' },
  { name: 'Gujarat Titans', shortName: 'GT', city: 'Ahmedabad', primaryColor: '#1C1C5E', secondaryColor: '#B8860B', emoji: '🏆' }
];

const PLAYERS_DATA = [
  // Premium Batters
  { name: 'Virat Kohli', country: 'India', isOverseas: false, role: 'BAT', emoji: '🏏', basePrice: 15, battingStyle: 'Right-hand', order: 1, demandLevel: 'extreme', popularityScore: 99, tags: ['captain', 'anchor', 'premium'], iplStats: { matches: 246, runs: 7263, average: 37.97, strikeRate: 130.4, fifties: 50, hundreds: 7, wickets: 4, economy: 8.5 } },
  { name: 'Rohit Sharma', country: 'India', isOverseas: false, role: 'BAT', emoji: '🏏', basePrice: 14, battingStyle: 'Right-hand', order: 2, demandLevel: 'extreme', popularityScore: 97, tags: ['captain', 'opener', 'premium'], iplStats: { matches: 250, runs: 6211, average: 30.35, strikeRate: 130.6, fifties: 43, hundreds: 1, wickets: 15, economy: 7.8 } },
  { name: 'Suryakumar Yadav', country: 'India', isOverseas: false, role: 'BAT', emoji: '⚡', basePrice: 14, battingStyle: 'Right-hand', order: 3, demandLevel: 'extreme', popularityScore: 95, tags: ['360-player', 'middle-order', 'power'], iplStats: { matches: 132, runs: 3254, average: 32.5, strikeRate: 169.8, fifties: 32, hundreds: 0, wickets: 0, economy: 0 } },
  { name: 'KL Rahul', country: 'India', isOverseas: false, role: 'WK-BAT', emoji: '🧤', basePrice: 14, battingStyle: 'Right-hand', order: 4, demandLevel: 'high', popularityScore: 90, tags: ['opener', 'keeper', 'consistent'], iplStats: { matches: 163, runs: 5069, average: 47.0, strikeRate: 136.2, fifties: 42, hundreds: 4, wickets: 0, economy: 0 } },
  { name: 'Shubman Gill', country: 'India', isOverseas: false, role: 'BAT', emoji: '🏏', basePrice: 13, battingStyle: 'Right-hand', order: 5, demandLevel: 'extreme', popularityScore: 91, tags: ['opener', 'young-gun', 'anchor'], iplStats: { matches: 105, runs: 3261, average: 40.51, strikeRate: 135.8, fifties: 24, hundreds: 3, wickets: 0, economy: 0 } },

  // Overseas Stars
  { name: 'Pat Cummins', country: 'Australia', isOverseas: true, role: 'BOWL', emoji: '🎯', basePrice: 12, bowlingStyle: 'Right-arm fast', order: 6, demandLevel: 'extreme', popularityScore: 93, tags: ['overseas', 'pace', 'death-overs', 'captain'], iplStats: { matches: 98, runs: 450, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 142, economy: 8.9, bowlingAvg: 27.4 } },
  { name: 'Rashid Khan', country: 'Afghanistan', isOverseas: true, role: 'BOWL', emoji: '🌪️', basePrice: 13, bowlingStyle: 'Right-arm leg-spin', order: 7, demandLevel: 'extreme', popularityScore: 96, tags: ['overseas', 'spinner', 'match-winner'], iplStats: { matches: 122, runs: 522, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 122, economy: 6.18, bowlingAvg: 20.4 } },
  { name: 'Andre Russell', country: 'West Indies', isOverseas: true, role: 'ALL', emoji: '💪', basePrice: 9, battingStyle: 'Right-hand', bowlingStyle: 'Right-arm fast-medium', order: 8, demandLevel: 'high', popularityScore: 94, tags: ['overseas', 'power-hitter', 'finisher'], iplStats: { matches: 117, runs: 1967, average: 26.3, strikeRate: 177.9, fifties: 8, hundreds: 0, wickets: 98, economy: 9.8 } },
  { name: 'Jos Buttler', country: 'England', isOverseas: true, role: 'WK-BAT', emoji: '🧤', basePrice: 12, battingStyle: 'Right-hand', order: 9, demandLevel: 'extreme', popularityScore: 92, tags: ['overseas', 'opener', 'keeper', 'power'], iplStats: { matches: 104, runs: 3582, average: 42.64, strikeRate: 149.6, fifties: 26, hundreds: 7, wickets: 0, economy: 0 } },
  { name: 'David Warner', country: 'Australia', isOverseas: true, role: 'BAT', emoji: '🦘', basePrice: 10, battingStyle: 'Left-hand', order: 10, demandLevel: 'high', popularityScore: 88, tags: ['overseas', 'opener', 'consistent'], iplStats: { matches: 184, runs: 6397, average: 41.6, strikeRate: 140.2, fifties: 60, hundreds: 4, wickets: 0, economy: 0 } },
  { name: 'Faf du Plessis', country: 'South Africa', isOverseas: true, role: 'BAT', emoji: '🦁', basePrice: 9, battingStyle: 'Right-hand', order: 11, demandLevel: 'high', popularityScore: 85, tags: ['overseas', 'opener', 'captain'], iplStats: { matches: 163, runs: 4645, average: 34.1, strikeRate: 135.0, fifties: 37, hundreds: 1, wickets: 0, economy: 0 } },
  { name: 'Trent Boult', country: 'New Zealand', isOverseas: true, role: 'BOWL', emoji: '🥝', basePrice: 8, bowlingStyle: 'Left-arm fast-medium', order: 12, demandLevel: 'high', popularityScore: 84, tags: ['overseas', 'powerplay', 'swing'], iplStats: { matches: 100, runs: 0, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 122, economy: 7.88, bowlingAvg: 21.4 } },

  // Indian Bowlers
  { name: 'Jasprit Bumrah', country: 'India', isOverseas: false, role: 'BOWL', emoji: '🎯', basePrice: 15, bowlingStyle: 'Right-arm fast', order: 13, demandLevel: 'extreme', popularityScore: 97, tags: ['yorker-king', 'death-overs', 'premium'], iplStats: { matches: 145, runs: 0, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 162, economy: 7.39, bowlingAvg: 22.1, bestBowling: '5/10' } },
  { name: 'Mohammed Siraj', country: 'India', isOverseas: false, role: 'BOWL', emoji: '🎯', basePrice: 8, bowlingStyle: 'Right-arm fast-medium', order: 14, demandLevel: 'high', popularityScore: 80, tags: ['powerplay', 'pace', 'swing'], iplStats: { matches: 90, runs: 0, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 91, economy: 8.8, bowlingAvg: 31.2 } },
  { name: 'Yuzvendra Chahal', country: 'India', isOverseas: false, role: 'BOWL', emoji: '🕷️', basePrice: 6, bowlingStyle: 'Right-arm leg-spin', order: 15, demandLevel: 'high', popularityScore: 82, tags: ['leg-spinner', 'powerplay', 'wicket-taker'], iplStats: { matches: 157, runs: 0, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 187, economy: 7.8, bowlingAvg: 22.4, bestBowling: '5/40' } },
  { name: 'Ravindra Jadeja', country: 'India', isOverseas: false, role: 'ALL', emoji: '⚔️', basePrice: 14, battingStyle: 'Left-hand', bowlingStyle: 'Left-arm orthodox', order: 16, demandLevel: 'extreme', popularityScore: 94, tags: ['all-rounder', 'fielder', 'match-winner'], iplStats: { matches: 237, runs: 2732, average: 25.3, strikeRate: 130.4, fifties: 6, hundreds: 0, wickets: 154, economy: 7.6, bowlingAvg: 29.7 } },
  { name: 'Hardik Pandya', country: 'India', isOverseas: false, role: 'ALL', emoji: '💥', basePrice: 13, battingStyle: 'Right-hand', bowlingStyle: 'Right-arm fast-medium', order: 17, demandLevel: 'extreme', popularityScore: 93, tags: ['all-rounder', 'finisher', 'match-winner', 'captain'], iplStats: { matches: 128, runs: 1476, average: 27.3, strikeRate: 149.4, fifties: 3, hundreds: 0, wickets: 78, economy: 8.76, bowlingAvg: 29.1 } },

  // All-Rounders & Others
  { name: 'MS Dhoni', country: 'India', isOverseas: false, role: 'WK-BAT', emoji: '🧤', basePrice: 10, battingStyle: 'Right-hand', order: 18, demandLevel: 'high', popularityScore: 98, tags: ['finisher', 'keeper', 'legend'], iplStats: { matches: 250, runs: 5082, average: 39.7, strikeRate: 135.2, fifties: 24, hundreds: 0, wickets: 0, economy: 0 } },
  { name: 'Rishabh Pant', country: 'India', isOverseas: false, role: 'WK-BAT', emoji: '🧤', basePrice: 12, battingStyle: 'Left-hand', order: 19, demandLevel: 'extreme', popularityScore: 91, tags: ['keeper', 'aggressive', 'match-winner', 'captain'], iplStats: { matches: 111, runs: 3284, average: 35.3, strikeRate: 148.5, fifties: 18, hundreds: 1, wickets: 0, economy: 0 } },
  { name: 'Glenn Maxwell', country: 'Australia', isOverseas: true, role: 'ALL', emoji: '🦘', basePrice: 11, battingStyle: 'Right-hand', bowlingStyle: 'Right-arm off-spin', order: 20, demandLevel: 'high', popularityScore: 87, tags: ['overseas', 'power-hitter', 'spinner'], iplStats: { matches: 115, runs: 2771, average: 29.4, strikeRate: 154.3, fifties: 15, hundreds: 0, wickets: 30, economy: 8.1 } },

  // Budget Picks
  { name: 'Tilak Varma', country: 'India', isOverseas: false, role: 'BAT', emoji: '🌟', basePrice: 5, battingStyle: 'Left-hand', order: 21, demandLevel: 'high', popularityScore: 76, tags: ['young-gun', 'middle-order', 'value-pick'], iplStats: { matches: 45, runs: 1267, average: 36.2, strikeRate: 144.5, fifties: 10, hundreds: 1, wickets: 0, economy: 0 } },
  { name: 'Arshdeep Singh', country: 'India', isOverseas: false, role: 'BOWL', emoji: '🎯', basePrice: 6, bowlingStyle: 'Left-arm fast-medium', order: 22, demandLevel: 'high', popularityScore: 78, tags: ['death-overs', 'powerplay', 'swing'], iplStats: { matches: 71, runs: 0, average: 0, strikeRate: 0, fifties: 0, hundreds: 0, wickets: 88, economy: 8.95, bowlingAvg: 25.7 } },
  { name: 'Axar Patel', country: 'India', isOverseas: false, role: 'ALL', emoji: '⚔️', basePrice: 7, battingStyle: 'Left-hand', bowlingStyle: 'Left-arm orthodox', order: 23, demandLevel: 'medium', popularityScore: 72, tags: ['all-rounder', 'spinner', 'value'], iplStats: { matches: 130, runs: 1142, average: 24.8, strikeRate: 143.5, fifties: 3, hundreds: 0, wickets: 106, economy: 7.2, bowlingAvg: 26.3 } },
  { name: 'Ruturaj Gaikwad', country: 'India', isOverseas: false, role: 'BAT', emoji: '🏏', basePrice: 9, battingStyle: 'Right-hand', order: 24, demandLevel: 'high', popularityScore: 80, tags: ['opener', 'consistent', 'captain'], iplStats: { matches: 88, runs: 2705, average: 38.6, strikeRate: 136.7, fifties: 22, hundreds: 2, wickets: 0, economy: 0 } },
  { name: 'Ishan Kishan', country: 'India', isOverseas: false, role: 'WK-BAT', emoji: '🧤', basePrice: 8, battingStyle: 'Left-hand', order: 25, demandLevel: 'high', popularityScore: 77, tags: ['keeper', 'opener', 'aggressive'], iplStats: { matches: 105, runs: 2644, average: 28.7, strikeRate: 136.9, fifties: 16, hundreds: 1, wickets: 0, economy: 0 } },

  // International Budget
  { name: 'Nicholas Pooran', country: 'West Indies', isOverseas: true, role: 'WK-BAT', emoji: '🧤', basePrice: 7, battingStyle: 'Left-hand', order: 26, demandLevel: 'medium', popularityScore: 73, tags: ['overseas', 'keeper', 'aggressive', 'finisher'], iplStats: { matches: 66, runs: 1408, average: 28.9, strikeRate: 158.7, fifties: 8, hundreds: 0, wickets: 0, economy: 0 } },
  { name: 'Sam Curran', country: 'England', isOverseas: true, role: 'ALL', emoji: '🌹', basePrice: 8, battingStyle: 'Left-hand', bowlingStyle: 'Left-arm fast-medium', order: 27, demandLevel: 'medium', popularityScore: 71, tags: ['overseas', 'death-overs', 'utility'], iplStats: { matches: 69, runs: 694, average: 18.8, strikeRate: 141.2, fifties: 2, hundreds: 0, wickets: 69, economy: 9.2, bowlingAvg: 31.5 } },
  { name: 'Liam Livingstone', country: 'England', isOverseas: true, role: 'ALL', emoji: '🌹', basePrice: 7, battingStyle: 'Right-hand', bowlingStyle: 'Right-arm leg-spin', order: 28, demandLevel: 'medium', popularityScore: 69, tags: ['overseas', 'power-hitter', 'spinner'], iplStats: { matches: 42, runs: 906, average: 25.2, strikeRate: 163.7, fifties: 5, hundreds: 1, wickets: 21, economy: 9.5 } },

  // Uncapped/Budget picks
  { name: 'Rinku Singh', country: 'India', isOverseas: false, role: 'BAT', emoji: '🌟', basePrice: 4, battingStyle: 'Left-hand', order: 29, demandLevel: 'high', popularityScore: 74, tags: ['finisher', 'young-gun', 'value-pick'], iplStats: { matches: 48, runs: 1103, average: 42.4, strikeRate: 149.7, fifties: 7, hundreds: 0, wickets: 0, economy: 0 } },
  { name: 'Yashasvi Jaiswal', country: 'India', isOverseas: false, role: 'BAT', emoji: '⭐', basePrice: 10, battingStyle: 'Left-hand', order: 30, demandLevel: 'extreme', popularityScore: 88, tags: ['opener', 'young-gun', 'elite'], iplStats: { matches: 52, runs: 1905, average: 40.5, strikeRate: 155.7, fifties: 12, hundreds: 3, wickets: 0, economy: 0 } }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Player.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create teams
    const teams = await Team.insertMany(TEAMS_DATA.map(t => ({ ...t, purseRemaining: 100, purseTotal: 100 })));
    console.log(`✅ Created ${teams.length} teams`);

    // Create admin user — pass plain text, pre-save hook hashes it
    const admin = await User.create({
      name: 'Auction Admin',
      email: process.env.ADMIN_EMAIL || 'admin@iplnexus.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@IPL2025!',
      role: 'admin'
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create team owners (demo) — pass plain text, pre-save hook hashes it
    const ownerUsers = await Promise.all(teams.slice(0, 10).map(async (team, i) => {
      const user = await User.create({
        name: `${team.shortName} Owner`,
        email: `owner.${team.shortName.toLowerCase()}@iplnexus.com`,
        password: 'Owner@IPL2025!',
        role: 'team_owner',
        team: team._id
      });
      await Team.findByIdAndUpdate(team._id, { owner: user._id });
      return user;
    }));
    console.log(`✅ Created ${ownerUsers.length} team owners`);

    // Create players
    const players = await Player.insertMany(
      PLAYERS_DATA.map(p => ({
        ...p,
        aiPredictedValue: parseFloat((p.basePrice * (1.1 + Math.random() * 0.5)).toFixed(1))
      }))
    );
    console.log(`✅ Created ${players.length} players`);

    console.log('\n🎉 Seed complete!\n');
    console.log('📋 Login credentials:');
    console.log(`   Admin: ${process.env.ADMIN_EMAIL || 'admin@iplnexus.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@IPL2025!'}`);
    console.log('   Team Owners: owner.mi@iplnexus.com / Owner@IPL2025!');
    console.log('   (mi, csk, rcb, kkr, srh)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
