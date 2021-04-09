const { parse } = require('querystring');
const fs = require('fs');
const http = require('http');

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
  const filePath = `.${url}`;

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500);
      return response.end(`${error}`);
    }

    return response.end(content, 'utf-8');
  });
};

/**
 * Parses the plain-text cookies from the HTTP request
 * into a JavaScript object.
 * @param {http.IncomingMessage} httpRequest
 * @returns {Object}
 */
const getCookies = (httpRequest) => {
  const plainTextCookies = httpRequest.headers.cookie,
    cookies = {};

  plainTextCookies.split(' ').forEach((cookie) => {
    cookie = cookie.split('=');
    // wtf is this
    cookies[cookie[0]] =
      cookie[1].charAt(cookie[1].length - 1) == ';'
        ? cookie[1].slice(0, -1)
        : cookie[1];
  });
  return cookies;
};

module.exports = {
  getRequestBody,
  getStaticFile,
  getCookies,
};
