const Controller = require('./Controller');
const Category = require('../models/Category');

class HomeController extends Controller {
  constructor(request, response) {
    super(request, response);
    this.setAction(this.home);
  }

  async home() {
    let all = await Category.findAll();

    let pay = all.map((item) => {
      return {
        id: item.getId(),
        title: item.getTitle(),
        username: item.getUser().getUsername(),
        createdAt: item.getCreatedAt(),
        deletedAt: item.getDeletedAt(),
      };
    });

    return await this.response.setResponse({
      template: 'HomeView',
      title: 'Welcome',
      message: 'Homepage!',
      statusCode: 200,
      payload: pay,
    });
  }
}

module.exports = HomeController;
