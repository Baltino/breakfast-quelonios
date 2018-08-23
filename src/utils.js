
function getHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS, HEAD, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Disposition, Origin, X-Requested-With, Content-Length,Content-Type, Accept, Accept-Encoding, Accept-Language, Host, Referer, User-Agent, Authorization",
    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
  };
};

module.exports.getHeaders = getHeaders;

module.exports.SERVER_ERROR = function SERVER_ERROR(e) {
  console.log('SERVER ERROR', e);
  return {
    statusCode: 500,
    headers: getHeaders(),
    body: JSON.stringify({
      message: 'Server error',
      error: e
    })
  };
};