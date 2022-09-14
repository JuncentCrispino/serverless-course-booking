import connect from '../../config/db';
import Course from '../../models/Course';
import response from '../../response';

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connect();
  try {
    const { isActive } = JSON.parse(event.body);
    const { courseId } = event.pathParameters;
    const courses = await Course.findByIdAndUpdate(courseId, { isActive }, { new: true }).exec();
    return response(200, courses);
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}