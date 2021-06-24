const Router = require('./router/Router');
const Request = require('./router/Request');
const Response = require('./router/Response');

/**
 * The App class is responsible for handling the HTTP request
 * and HTTP responses as well as the JS Request and JS Response
 * objects.
 */
class App {
	/**
	 * Parse the body of the HTTP request and instantiate new
	 * Request, Response, and Router objects.
	 * @param {Object} httpRequest
	 */
	async handleRequest(httpRequest) {
		const requestBody = await App.getRequestBody(httpRequest);
		const request = new Request(httpRequest.method, httpRequest.url, requestBody);
		this.router = new Router(request, new Response());
	}

	/**
	 * If the request is a POST or a PUT, that means the client
	 * wants to send some data to the server. This data is found
	 * in the request body. This function will extract the data
	 * from the request body, provided that the data is either in
	 * x-www-form-urlencoded format or JSON format.
	 * @param {Object} httpRequest
	 * @returns {Object} The parsed HTTP request body.
	 */
	static async getRequestBody(httpRequest) {
		return new Promise((resolve, reject) => {
			const chunks = [];

			httpRequest.on('data', (chunk) => chunks.push(chunk));
			httpRequest.on('error', (err) => reject(err));
			httpRequest.on('end', () => {
				const contentType = httpRequest.headers['content-type'];
				const body = chunks.join('');
				let result;

				switch (contentType) {
					case 'application/x-www-form-urlencoded':
						result = body.split('&').reduce((accumulator, parameter) => {
							const [key, value] = parameter.split('=');
							accumulator[key] = value;
							return accumulator;
						}, {});
						break;
					case 'application/json':
						result = JSON.parse(body);
						break;
					default:
						result = '';
				}

				resolve(result);
			});
		});
	}

	/**
	 * Dispatch the router and use the returned Response to send
	 * back an HTTP response to the client.
	 * @param {Object} httpResponse
	 */
	async sendResponse(httpResponse) {
		const response = await this.router.dispatch();

		httpResponse.writeHead(response.getStatusCode(), {
			'Content-Type': 'application/json',
		});

		httpResponse.end(response.toString());
	}
}

module.exports = App;
