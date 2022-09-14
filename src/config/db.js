'use strict';
import mongoose from 'mongoose';

// let conn;

// const connect = async () => {
//   if (conn == null) {
//     conn = mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000
//     }).then(() => mongoose);

//     await conn;
//   }

//   return conn;

// };

// export default connect;

mongoose.Promise = global.Promise;
let isConnected;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  const db = await mongoose.connect(process.env.MONGO_URI);
  isConnected = db.connections[0].readyState;
};

export default connectToDatabase;