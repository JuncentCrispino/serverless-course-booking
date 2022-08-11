import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin';
import paginate from './plugins/paginate.plugin';

const courseSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  instructor: {
    type: String, 
    required: [true, 'instuctor is required']
  },
  schedule: {
    type: String,
    required: [true, 'Schedule is required']
  },
  availableSlots: {
    type: Number,
    required: [true, 'Available slots is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollees:[
    {
      userId: {
        type: String,
        required: [true, 'UserId is required']
      },
      enrolledOn: {
        type: Date,
        default: new Date()
      }
    }
  ]
}, {
  timestamps: true
});

courseSchema.plugin(toJSON);
courseSchema.plugin(paginate);

courseSchema.statics.isNameTaken = async function (name, courseId) {
  const course = await this.findOne({ name, _id: { $ne: mongoose.Types.ObjectId(courseId) } }).exec();
  return !!course;
};

courseSchema.statics.isEnrolled = async function (courseId,userId) {
  const course = await this.findOne({ _id: courseId, enrollees: { $elemMatch: { userId } } }).exec();
  return !!course;
};

export default mongoose.model('Course', courseSchema);