export default function(status, response) {
  return {
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Credentials' : true,
    },
    body: JSON.stringify(response)
  };
}