// backend/fix-registrations.js
// Run: node fix-registrations.js
// This patches ALL existing registrations to add userId and fix eventId

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  console.log('✅ Connected to:', db.databaseName);

  // 1. Show raw registration fields so we can see actual field names
  const regs = await db.collection('registrations').find({}).toArray();
  console.log(`\n📊 Total registrations: ${regs.length}`);
  if (regs.length > 0) {
    console.log('\n🔍 Raw fields of first registration:');
    console.log(JSON.stringify(regs[0], null, 2));
  }

  // 2. Load users to build email → _id map
  const users = await db.collection('users').find({}).toArray();
  const emailToUserId = {};
  users.forEach(u => {
    emailToUserId[u.email.toLowerCase().trim()] = u._id;
  });
  console.log('\n👥 Email → userId map:');
  Object.entries(emailToUserId).forEach(([e, id]) => console.log(`  ${e} → ${id}`));

  // 3. Load events to build a name/title map (in case eventId is stored differently)
  const events = await db.collection('events').find({}).toArray();
  console.log(`\n📅 Events in DB: ${events.length}`);
  events.forEach(e => console.log(`  - ${e._id} | ${e.title}`));

  // 4. Patch each registration
  let fixed = 0;
  for (const reg of regs) {
    const updates = {};

    // Fix userId if missing
    if (!reg.userId) {
      const email = (reg.email || '').toLowerCase().trim();
      const uid = emailToUserId[email];
      if (uid) {
        updates.userId = uid;
        console.log(`\n✅ Will set userId for ${email} → ${uid}`);
      } else {
        console.log(`\n⚠️  No user found for email: ${email}`);
      }
    }

    // Fix eventId — check all possible field names
    const eventIdValue = reg.eventId || reg.event || reg.eventID || reg.EventId;
    if (!eventIdValue && events.length > 0) {
      console.log(`\n⚠️  Registration ${reg._id} has no eventId. Raw keys: ${Object.keys(reg).join(', ')}`);
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await db.collection('registrations').updateOne(
        { _id: reg._id },
        { $set: updates }
      );
      fixed++;
    }
  }

  console.log(`\n🎉 Fixed ${fixed} registrations`);

  // 5. Verify
  const updated = await db.collection('registrations').find({}).toArray();
  console.log('\n📋 After fix:');
  updated.forEach((r, i) => {
    console.log(`[${i+1}] ${r.email} | userId: ${r.userId || '❌ STILL MISSING'} | eventId: ${r.eventId || r.event || '❌ NO EVENT'} | tickets: ${r.ticketCount}`);
  });

  mongoose.disconnect();
  console.log('\n✅ Done! Restart your backend server now.');
});