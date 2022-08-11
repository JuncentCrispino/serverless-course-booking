import Course from '../../models/Course';
import response from '../../response';
import sanitizer from '../../utils/sanitizer';
import connect from '../../config/db';
connect();

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const { name, description, instructor, schedule, availableSlots, price } = JSON.parse(event.body);
    const { courseId } = event.pathParameters;
    if (await Course.isNameTaken(name, courseId)) {
      return response(409, { message: 'Course name already taken' });
    }
    const update = ({
      name,
      description,
      instructor,
      schedule,
      availableSlots,
      price
    }).save();
    const updatedCourse = await Course.findByIdAndUpdate(courseId, update, { new: true });
    sanitizer(updatedCourse._doc);
    return response(200, updatedCourse._doc);
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}