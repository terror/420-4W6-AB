const Session = require('./Session');

class SessionManager {
  constructor() {
    this.sessions = [];
    this.cleanUp = setInterval(this.cleanUpSessions, 1000);
  }

  stopCleanUp() {
    process.nextTick(clearInterval, this.cleanUp);
  }

  /**
   * Returns either a new session or an existing session based on
   * the incoming cookie header.
   * @param {Object} httpRequest
   * @returns A session object.
   */
  getSession(httpRequest) {
    let session;
    const cookies = SessionManager.getCookies(httpRequest);

    if (cookies.sessionId) {
      session = this.get(cookies.sessionId);
    }

    if (session) {
      session.refresh();
    } else {
      session = this.createSession();
    }

    return session;
  }

  get(sessionId) {
    return this.sessions.find((session) => session.getId() === sessionId);
  }

  cleanUpSessions() {
    /**
     * The `filter` method is a useful built-in JS array method that you can read about here:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Filter
     */
    this.sessions = this.sessions?.filter((session) => !session.isExpired());
    // this.sessions.forEach((session) => {
    // console.log(`Session ${session.getId()} time left: ${Math.round((session.getCookie().getExpires() - Date.now()) / 1000)}s`);
    // });
  }

  createSession() {
    const session = new Session();

    this.sessions.push(session);

    return session;
  }

  /**
   * Transforms the plaintext cookie request header to a JS object.
   * @param {Object} httpRequest
   * @returns An object containing cookie key/value pairs.
   */
  static getCookies(httpRequest) {
    if (!httpRequest.headers.cookie) {
      return {};
    }

    /**
     * The `reduce` method is a useful built-in JS array method that you can read about here:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
     */
    return httpRequest.headers.cookie
      .split('; ')
      .reduce((accumulator, parameter) => {
        const [key, value] = parameter.split('=');
        accumulator[key] = value;
        return accumulator;
      }, {});
  }
}

module.exports = new SessionManager();
