import Course from '../../models/Course';
import response from '../../response';
import connect from '../../config/db';
import sanitizer from '../../utils/sanitizer';

export default async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connect();
  try {
    const courseId = event.pathParameters.courseId;
    const courses = await Course.findById(courseId).lean().exec();
    if (!courses) {
      return response(404, { message: 'Course not found' });
    }
    sanitizer(courses);
    return response(200, courses);
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}