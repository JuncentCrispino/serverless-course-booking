import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import Token from '../models/Token';

const generateToken = async (userId, email, isAdmin, expires, secret) => {
  try {
    const payload = {
      userId,
      email,
      isAdmin,
      iat: dayjs(Date.now()).unix(),
      exp: expires.unix(),
    };
    return jwt.sign(payload, secret);
  } catch (err) {
    console.log(err);
  }
};

export async function generateAccessToken(user) {
  try {
    const accessTokenExpires = dayjs(Date.now()).add(parseInt(process.env.JWT_ACCESS_EXPIRATION_MINS), 'minutes');
    const access = await generateToken(user._id, user.email, user.isAdmin, accessTokenExpires, process.env.JWT_ACCESS_SECRET);
    return access;
  } catch (err) {
    console.log(err);
  }
}

export async function generateRefreshToken(user) {
  try {
    const refreshTokenExpires = dayjs(Date.now()).add(parseInt(process.env.JWT_REFRESH_EXPIRATION_MINS), 'minutes');
    const refresh = await generateToken(user._id, user.email, user.isAdmin, refreshTokenExpires, process.env.JWT_REFRESH_SECRET);
    return refresh;
  } catch (err) {
    console.log(err);
  }
}

export async function createNewToken(user, hashToken, tokenType, expiration, session) {
  session = session || null;
  const token = new Token({
    userId: user._id,
    email: user.email,
    token: hashToken,
    type: tokenType,
    expireAt: dayjs(Date.now()).add(parseInt(expiration), 'minutes').toDate()
  });
  return await token.save({ session });
}

export async function findToken(token, type, secret) {
  const payload = jwt.verify(token, secret);
  if (!payload) {
    return null;
  }
  const tokenDoc = await Token.findOne({ token, type, userId: payload.userId }).exec();
  console.log(tokenDoc);
  return tokenDoc;
}