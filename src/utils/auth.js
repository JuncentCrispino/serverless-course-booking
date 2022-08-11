import jwt from 'jsonwebtoken';

export function decodeJwt(token, secret) {
  if (typeof token !== 'undefined') {
    return jwt.verify(token, secret, (err) => {
      if (err) {
        return null;
      }
      return jwt.decode(token, { complete: true }).payload;
    });
  }
  return null;
}