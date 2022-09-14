import connect from '../../config/db';
import Course from '../../models/Course';
import User from '../../models/User';
import response from '../../response';
import { decodeJwt } from '../../utils/auth';
import pick from '../../utils/pick';

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connect();
  try {
    const query = (event.queryStringParameters);
    let token = event.headers.Authorization;
    if (token.includes('Bearer')) {
      token = token.split(' ')[1];
    }
    const options = pick(query, ['sortBy', 'limit', 'page']);
    const payload = decodeJwt(token, process.env.JWT_ACCESS_SECRET);
    if (!payload) {
      return response(403, { message: 'Invalid token' });
    }
    let user = await User.findById(payload.userId).lean().exec();
    console.log(user);
    if (!user) {
      return response(404, { message: 'User not found' });
    }
    const ids = user.enrollments.map(enrollment => enrollment.courseId);
    const courses = await Course.paginate({ _id: { $in: ids } }, options);
    return response(200, courses);
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}