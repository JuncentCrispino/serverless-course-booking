import Course from '../../models/Course';
import response from '../../response';
import sanitizer from '../../utils/sanitizer';
import connect from '../../config/db';

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connect();
  try {
    const { name, description, instructor, schedule, availableSlots, price } = JSON.parse(event.body);
    if (await Course.isNameTaken(name)) {
      return response(409, { message: 'Course name already taken' });
    }
    const newCourse = await new Course({
      name,
      description,
      instructor,
      schedule,
      availableSlots,
      price
    }).save();
    sanitizer(newCourse._doc);
    return response(200, newCourse._doc);
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}