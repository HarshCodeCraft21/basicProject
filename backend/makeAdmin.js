const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://harshjain21203_db_user:t7487VogQX4sgzg0@ac-ucxpauq-shard-00-00.i9fw04g.mongodb.net:27017,ac-ucxpauq-shard-00-01.i9fw04g.mongodb.net:27017,ac-ucxpauq-shard-00-02.i9fw04g.mongodb.net:27017/?ssl=true&replicaSet=atlas-9i47fe-shard-0&authSource=admin&appName=E-Commerce';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  const email = 'admin@example.com';
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log('Successfully updated existing user to admin!');
  } else {
    await User.create({
      name: 'Admin User',
      email: email,
      password: 'password123',
      role: 'admin'
    });
    console.log('Successfully created new Admin User!');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

main().catch(console.error);
