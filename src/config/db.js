'use strict';
import mongoose from 'mongoose';

let conn;

const connect = async () => {
  if (conn == null) {
    conn = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    }).then(() => mongoose);

    await conn;
  }

  return conn;

};

export default connect;