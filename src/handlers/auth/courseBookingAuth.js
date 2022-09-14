import { verify, TokenExpiredError } from 'jsonwebtoken';

export default async function (event, context, callback) {
  let token = event.authorizationToken;
  if (!token) {
    callback(null, generatePolicy('user', 'Deny', event.methodArn));
  }
  if (token.includes('Bearer ')) {
    token = token.substring(7, token.length);
  }
  verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        callback('Unauthorized');
      }
      callback(null, generatePolicy('user', 'Deny', event.methodArn));
    }
    callback(null, generatePolicy(decoded.userId, 'Allow', event.methodArn));
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