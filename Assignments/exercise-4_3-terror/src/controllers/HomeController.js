const Controller = require('./Controller');

class HomeController extends Controller {
  constructor(request, response, session) {
    super(request, response, session);
    this.setAction(this.home);
  }

  async home() {
    return await this.response.setResponse({
      template: 'HomeView',
      title: 'Welcome',
      message: 'Homepage!',
      statusCode: 200,
      payload: { isLoggedIn: Object.entries(this.session.data).length !== 0 },
    });
  }
}

module.exports = HomeController;
