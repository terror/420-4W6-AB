const crypto = require('crypto');
const Cookie = require('./Cookie');

class Session {
  constructor(data = {}) {
    this.id = crypto.randomBytes(2).toString('hex');
    this.data = data;
    this.cookie = new Cookie('sessionId', this.id);
  }

  getId() {
    return this.id;
  }

  get(name) {
    return this.data[name] ?? null;
  }

  set(name, value) {
    this.data[name] = value;
  }

  exists(name) {
    return this.get(name) !== null;
  }

  /**
   * Adds more time to the cookie expiration.
   * @param {number} time The number of milliseconds from now the cookie should expire.
   */
  refresh(time = Cookie.DEFAULT_TIME) {
    this.cookie.setExpires(time);
  }

  /**
   * Clears the session data and expires the cookie.
   */
  destroy() {
    this.data = {};
    this.cookie.setExpires();
  }

  getCookie() {
    return this.cookie;
  }

  /**
   * Checks if the session cookie has expired.
   * @returns A boolean based on if the cookie has expired.
   */
  isExpired() {
    return this.cookie.getExpires() <= Date.now();
  }
}

module.exports = Session;
