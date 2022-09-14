import connect from '../../config/db';
import User from '../../models/User';
import response from '../../response';
import { findToken } from '../../services/token';
import { generateAccessToken } from '../../services/token';
import dayjs from 'dayjs';

export default async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connect();
  try {
    let token = event.headers.Authorization;
    if (!token) {
      return response(401, { message: 'Unauthorized' });
    }
    if (token.includes('Bearer ')) {
      token = token.substring(7, token.length);
    }
    const tokenDoc = await findToken(token, 'refresh-token', process.env.JWT_REFRESH_SECRET);
    if (!tokenDoc) {
      return response(403, { message: 'Tokn not found' });
    }
    if (tokenDoc.blacklisted) {
      return response(403, { message: 'Token blacklisted' });
    }
    if (dayjs(tokenDoc.expireAt).isBefore(dayjs())) {
      return response(403, { message: 'Token expired' });
    }
    const user = await User.findById(tokenDoc.userId).exec();
    if (!user) {
      return response(403, { message: 'User not found' });
    }
    const accessToken = await generateAccessToken(user);
    return response(200, { accessToken });
  } catch (error) {
    console.log(error);
    return response(500, error);
  }
}