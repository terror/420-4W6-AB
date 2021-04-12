const Router = require('./router/Router');
const Request = require('./router/Request');
const JsonResponse = require('./router/JsonResponse');
const HtmlResponse = require('./router/HtmlResponse');
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
		const requestMethod = this.getRequestMethod();
		const request = new Request(requestMethod, this.httpRequest.url, this.requestBody);
		const response = this.getResponseType();

		logger.info(`📨 >> ${requestMethod} ${this.httpRequest.url} ${JSON.stringify(this.requestBody)}`);

		this.router = new Router(request, response);
	}

	/**
	 * Dispatch the router and use the returned Response to send
	 * back an HTTP response to the client.
	 */
	async sendResponse() {
		const response = await this.router.dispatch();
		const status = HttpStatusCode.getStatusFromCode(response.getStatusCode());

		logger.info(`💌 << ${response.getStatusCode()} ${status}`);

		this.httpResponse.writeHead(response.getStatusCode(), response.getHeaders());
		this.httpResponse.end(response.toString());
	}

	getRequestMethod() {
		return this.requestBody.method ?? this.httpRequest.method;
	}

	getResponseType() {
		switch (this.httpRequest.headers.accept) {
			case 'application/json':
				return new JsonResponse();
			default:
				return new HtmlResponse();
		}
	}
}

module.exports = App;
