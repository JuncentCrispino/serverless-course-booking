import User from '../../models/User';
import response from '../../response';
import connect from '../../config/db';
import { createNewToken, generateAccessToken, generateRefreshToken } from '../../services/token';
import mongoose from 'mongoose';
import sanitizer from '../../utils/sanitizer';
connect();

export default async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { firstName, lastName, email, password, mobileNo } = JSON.parse(event.body);

    if (await User.isEmailTaken(email)) {
      return response(409, {
        message: 'Email already exists'
      });
    }
    if (await User.isMobileNoTaken(mobileNo)) {
      return response(409, {
        message: 'Mobile No. already exists'
      });
    }
    const newUser = await new User({
      firstName,
      lastName,
      email,
      password,
      mobileNo
    }).save({ session });
    const refreshToken = await generateRefreshToken(newUser);
    const [accessToken] = await Promise.all([
      generateAccessToken(newUser),
      createNewToken(newUser, refreshToken, 'refresh-token', process.env.JWT_REFRESH_EXPIRATION_MINS, session)
    ]);
    sanitizer(newUser._doc);
    await session.commitTransaction();
    return response(200, { ...newUser._doc, accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    return response(500, error);
  } finally {
    await session.endSession();
  }
}