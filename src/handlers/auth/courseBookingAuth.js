import jwt from 'jsonwebtoken';

export default async function (r, c, cb) {
  let token = r.authorizationToken;
  if (!token) {
    return cb(null, 'JWT not authorized');
  }
  if (token.includes('Bearer ')) {
    token = token.substring(7, token.length);
  }
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return cb('Unauthorized');
      }
      return cb(null, 'JWT not authorized');
    }
    return cb(null, generatePolicy(decoded.userId, 'Allow', r.methodArn));
  });
}
const generatePolicy = (principalId, effect, resource) => {
  const res = {};
  res.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    };
    res.policyDocument = policyDocument;
  }
  return res;
};