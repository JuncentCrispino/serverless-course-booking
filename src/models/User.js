import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import toJSON from './plugins/toJSON.plugin';
import paginate from './plugins/paginate.plugin';

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    private: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  mobileNo: {
    type: String,
    required: [true, 'Mobile No. is required']
  },
  enrollments: [
    {
      courseId: {
        type: String,
        required: [true, 'Course ID is required']
      },
      enrolledOn: {
        type: Date,
        default: new Date()
      },
      status: {
        type: String,
        default: 'Enrolled'
      }
    }
  ]
}, {
  timestamps: true
});

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (email, userId) {
  const user = await this.findOne({ email, _id: { $ne: mongoose.Types.ObjectId(userId) } }).exec();
  return !!user;
};

userSchema.statics.isMobileNoTaken = async function (mobileNo, userId) {
  const user = await this.findOne({ mobileNo, _id: { $ne: mongoose.Types.ObjectId(userId) } }).exec();
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next;
});

export default mongoose.model('User', userSchema);