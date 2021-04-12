const Router = require('./router/Router');
const Request = require('./router/Request');
const Response = require('./router/Response');
const HttpStatusCode = require('./helpers/HttpStatusCode');
const logger = require('./helpers/Logger');

/**
 * The App class is responsible for handling the HTTP request
 * and HTTP responses as well as the JS Request and JS Response
 * objects.
 */
class App {
	constructor(httpRequest, httpResponse, requestBody) {
		this.httpRequest = httpRequest;
		this.httpResponse = httpResponse;
		this.requestBody = requestBody;

		logger.toggleConsoleLog(true);
	}

	/**
	 * Parse the body of the HTTP request and instantiate new
	 * Request, Response, and Router objects.
	 */
	async handleRequest() {
		const request = new Request(this.httpRequest.method, this.httpRequest.url, this.requestBody);

		logger.info(`📨 >> ${this.httpRequest.method} ${this.httpRequest.url} ${JSON.stringify(this.requestBody)}`);

		this.router = new Router(request, new Response());
	}

	/**
	 * Dispatch the router and use the returned Response to send
	 * back an HTTP response to the client.
	 */
	async sendResponse() {
		const response = await this.router.dispatch();
		const status = HttpStatusCode.getStatusFromCode(response.getStatusCode());

		logger.info(`💌 << ${response.getStatusCode()} ${status}`);

		this.httpResponse.writeHead(response.getStatusCode(), {
			'Content-Type': 'application/json',
		});
		this.httpResponse.end(response.toString());
	}
}

module.exports = App;
