import { Schema, model, SchemaTypes } from 'mongoose';

const tokenSchema = Schema({
  token: {
    type: String,
    index: true,
    required: true
  },
  userId: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['password-reset', 'verify-mail', 'refresh-token'],
    required: true
  },
  expireAt: {
    type: Date,
    default: null,
    required: true,
  },
  blacklisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

tokenSchema.index(
  {
    expireAt: 1
  },
  {
    expireAfterSeconds: 0
  }
);


export default model('Token', tokenSchema);