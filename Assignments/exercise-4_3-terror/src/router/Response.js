const HttpStatusCode = require('../helpers/HttpStatusCode');
const Url = require('../helpers/Url');

/**
 * This class is responsible for getting the data ready to go back to the client.
 */
class Response {
  constructor(statusCode = HttpStatusCode.OK) {
    this.statusCode = statusCode;
    this.headers = {};
  }

  getStatusCode() {
    return this.statusCode;
  }

  getHeaders() {
    return this.headers;
  }

  setStatusCode(statusCode) {
    this.statusCode = statusCode;
  }

  addHeader(name, value) {
    this.headers[name] = value;
  }

  redirect(location) {
    this.addHeader('Location', Url.path(location));
    this.setStatusCode(HttpStatusCode.SEE_OTHER);
  }
}

module.exports = Response;
