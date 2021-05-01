const { parse } = require('querystring');
const fs = require('fs');

/**
 * If the request is a POST or a PUT, that means the client
 * wants to send some data to the server. This data is found
 * in the request body. This function will extract the data
 * from the request body, provided that the data is either in
 * x-www-form-urlencoded format or JSON format.
 * @param {Object} httpRequest
 * @returns {Promise<Object>} The parsed HTTP request body.
 */
const getRequestBody = async (httpRequest) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    httpRequest.on('data', (chunk) => chunks.push(chunk));
    httpRequest.on('error', (err) => reject(err));
    httpRequest.on('end', () => {
      const contentType = httpRequest.headers['content-type'];
      const body = chunks.join('');
      let result;

      switch (contentType) {
        case 'application/x-www-form-urlencoded':
          result = parse(body);
          break;
        case 'application/json':
          result = JSON.parse(body);
          break;
        default:
          result = '';
      }

      resolve(result);
    });
  });

/**
 * A static file is a file that the client requests for
 * directly. This is anything with a valid file extension.
 * Within the context of the web, this is usually .html,
 * .css, .js, and any image/video/audio file types.
 * @param {string} url
 * @param {Object} response
 */
const getStaticFile = (url, response) => {
  if (url.match(/.*favicon\.ico/)) {
    return response.end();
  }

  const filePath = `.${url}`;

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500);
      return response.end(`${error}`);
    }

    return response.end(content, 'utf-8');
  });
};

module.exports = {
  getRequestBody,
  getStaticFile,
};
