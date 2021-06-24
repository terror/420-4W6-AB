const TestHelper = require('../TestHelper');
const Url = require('../../src/helpers/Url');

class BrowserTestHelper extends TestHelper {
	static async logIn(email, password, page) {
		await page.goto(Url.base());
		await page.click(`a[href="${Url.path('auth/login')}"]`);

		await page.fill('form#login-form input[name="email"]', email);
		await page.fill('form#login-form input[name="password"]', password);
		await page.click('form#login-form button');
	}

	static async logOut(page) {
		await page.goto(Url.base());
		await page.click(`a[href="${Url.path('auth/logout')}"]`);
	}
}

module.exports = BrowserTestHelper;
