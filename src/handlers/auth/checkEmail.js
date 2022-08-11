import User from '../../models/User';
import response from '../../response';
import connect from '../../config/db';
connect();

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const email = JSON.parse(event.body).email;
    const user = await User.isEmailTaken(email);
    if (user) {
      return response(409, {
        message: 'Email already exists'
      });
    }
    return response(200, {
      message: 'Email is available'
    });
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}