const Controller = require('./Controller');

class HomeController extends Controller {
  constructor(request, response) {
    super(request, response);
    this.setAction(this.home);
  }
  home() {
    this.response.setResponse({
      statusCode: 200,
      message: 'Homepage!',
      payload: {},
    });
    return this.response;
  }
}

module.exports = HomeController;
