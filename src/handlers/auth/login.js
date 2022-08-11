import User from '../../models/User';
import response from '../../response';
import connect from '../../config/db';
import { generateAccessToken, generateRefreshToken, createNewToken } from '../../services/token';
import sanitizer from '../../utils/sanitizer';
connect();

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const { email, password } = JSON.parse(event.body);
    let user = await User.findOne({ email }).exec();
    if (!user || !(await user.isPasswordMatch(password))) {
      return response(400, { message:'Email/password does not match.' });
    }
    if (user.isActive === false) {
      return response(403, { message: 'Accound Disabled.' });
    }
    const refreshToken = await generateRefreshToken(user);
    const [accessToken] = await Promise.all([
      generateAccessToken(user),
      createNewToken(user, refreshToken, 'refresh-token', process.env.JWT_REFRESH_EXPIRATION_MINS),
    ]);
    sanitizer(user._doc);
    return response(200, { ...user._doc, accessToken, refreshToken });
  } catch (error) {
    return response(500, error);
  }
}