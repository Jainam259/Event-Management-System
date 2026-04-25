// Run this in your backend folder: node debug-regs.js
// It will show you exactly what's in your registrations collection

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connected to:', mongoose.connection.db.databaseName);

  const regs = await mongoose.connection.db.collection('registrations').find({}).toArray();
  console.log(`\n📊 Total registrations: ${regs.length}`);

  if (regs.length === 0) {
    console.log('\n❌ NO REGISTRATIONS FOUND IN DB!');
    console.log('   This means users registered before the route was working.');
    console.log('   Fix: Register for an event again from the frontend.');
  } else {
    regs.forEach((r, i) => {
      console.log(`\n[${i+1}] name:     ${r.name}`);
      console.log(`     email:    ${r.email}`);
      console.log(`     userId:   ${r.userId || '⚠️  MISSING'}`);
      console.log(`     eventId:  ${r.eventId}`);
      console.log(`     tickets:  ${r.ticketCount}`);
    });
  }

  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log(`\n👥 Users in DB: ${users.length}`);
  users.forEach(u => console.log(`  - ${u.name} | ${u.email} | _id: ${u._id}`));

  mongoose.disconnect();
});