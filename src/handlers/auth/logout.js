import User from '../../models/User';
import response from '../../response';
import connect from '../../config/db';
import { decodeJwt }from '../../utils/auth';
import Token from '../../models/Token';

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connect();
  try {
    let token = event.headers.Authorization;
    console.log(token);
    if (!token) {
      return response(403, { message: 'Unauthorized' });
    }
    if (token.includes('Bearer ')) {
      token = token.substring(7, token.length);
    }
    const payload = decodeJwt(token, process.env.JWT_ACCESS_SECRET);
    console.log(payload);
    if (!payload) {
      return response(403, { message: 'Invalid token' });
    }
    let user = await User.findById(payload.userId);
    if (!user) {
      return response(404, { message: 'User not found' });
    }
    await Token.find({ userId: user._id, type: 'refresh-token' }).deleteMany().exec();
    return response(200, { message: 'Logged out successfully' });
  } catch (error) {
    console.log(error);
    return response(500, error);
  }

}