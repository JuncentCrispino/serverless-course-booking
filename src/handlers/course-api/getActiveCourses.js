import Course from '../../models/Course';
import response from '../../response';
import connect from '../../config/db';
import pick from '../../utils/pick';
connect();

export default async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const query = (event.queryStringParameters);
    const options = pick(query, ['sortBy', 'limit', 'page']);
    const filter = {
      isActive: true
    };
    const courses = await Course.paginate(filter, options);
    return response(200, courses);
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}