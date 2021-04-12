const Controller = require('./Controller');

class HomeController extends Controller {
  constructor(request, response) {
    super(request, response);
    this.setAction(this.home);
  }

  async home() {
    return await this.response.setResponse({
      template: 'HomeView',
      title: 'Welcome',
      message: 'Homepage!',
      statusCode: 200,
      payload: {},
    });
  }
}

module.exports = HomeController;
