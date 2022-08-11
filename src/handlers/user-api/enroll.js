import User from '../../models/User';
import Course from '../../models/Course';
import response from '../../response';
import connect from '../../config/db';
import { decodeJwt } from '../../utils/auth';
import mongoose from 'mongoose';
connect();

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log(event.headers.Authorization);
    const { courseId } = event.pathParameters;
    let token = event.headers.Authorization;
    if (token.includes('Bearer')) {
      token = token.split(' ')[1];
    }
    const { userId } = decodeJwt(token, process.env.JWT_ACCESS_SECRET);
    if (!userId) {
      return response(401, { message: 'Invalid token' });
    }
    const [user, course] = await Promise.all([User.findById(userId).session(session), Course.findById(courseId).session(session)]);
    if (!user) {
      return response(404, { message: 'User not found' });
    }
    if (!course) {
      return response(404, { message: 'Course not found' });
    }
    if (await Course.isEnrolled(courseId, userId)) {
      return response(409, { message: 'User already enrolled in course' });
    }
    if (course.availableSlots < 1) {
      return response(409, { message: 'No available slots' });
    }
    await Promise.all([
      User.findByIdAndUpdate(userId, { $push: { enrollments: { courseId } } }).session(session), 
      Course.findByIdAndUpdate(courseId, { $inc: { availableSlots: -1 }, $push: { enrollees: { userId } } }).session(session),
    ]);
    await session.commitTransaction();
    return response(200, { message: 'User enrolled in course' });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    return response(500, error);
  } finally {
    session.endSession();
  }
}