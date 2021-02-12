/**
 * The best way to go through this file is start at the
 * very bottom and work your way up. For maximum clarity,
 * I would suggest collapsing all functions, and only expand
 * them once you get to that point in the program. This can be
 * done by placing your cursor in between the line number
 * and function declaration, and click the small down arrow.
 */

const http = require('http');
const fs = require('fs');
const Pokemon = require('./models/Pokemon');

/**
 * A static file is a file that the client requests for
 * directly. This is anything with a valid file extension.
 * Within the context of the web, this is usually .html,
 * .css, .js, and any image/video/audio file types. Since
 * this exercise only needs one static HTML file, this
 * function only serves HTML files.
 * @param {string} url
 * @param {Object} response
 */
const serveStaticFile = (url, response) => {
	let filePath = `.${url}`;

	fs.readFile(filePath, function (error, content) {
		if (error) {
			response.writeHead(500);
			return response.end(`${error}`);
		}

		response.writeHead(200, { 'Content-Type': 'text/html' });
		response.end(content, 'utf-8');
	});
};

/**
 * If the request is a POST or a PUT, that means the client
 * wants to send some data to the server. This data is found
 * in the request body. This function will extract the data
 * from the request body, provided that the data is either in
 * x-www-form-urlencoded format or JSON format.
 * @param {Object} request
 */
const getRequestBody = async (request) => {
	return new Promise((resolve, reject) => {
		const chunks = [];

		request.on('data', (chunk) => chunks.push(chunk));
		request.on('error', (err) => reject(err));
		request.on('end', () => {
			const contentType = request.headers['content-type'];
			let body = chunks.join('');
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
};

/**
 * This function is called whenever an HTTP request is made.
 *
 * If the user wants a static HTML file, then it will be served
 * to them by calling the serveStaticFile function. If not, then
 * a CRUD operation will be performed on a Pokemon depending on
 * the request method and request path (i.e. URL).
 * @param {Object} request
 * @param {Object} response
 */
const handleHttpRequest = async (request, response) => {
	console.log(`Received HTTP ${request.method} request for ${request.url}`);

	if (request.url.match('.*\.html')) {
		return serveStaticFile(request.url, response);
	}
	/**
	 * The browser automatically requests for favicon.ico which is
	 * the little icon that appears in the in the browser tab. For
	 * now we can ignore this.
	 */
	else if (request.url.match('.*favicon\.ico')) {
		return response.end();
	}

	/**
	 * All of these variables are used to parse the HTTP request.
	 * I highly suggest sticking a breakpoint here and walking through
	 * this file line-by-line to understand exactly how the request is
	 * being handled.
	 */
	const requestMethod = request.method;
	const path = request.url;
	const pathParameters = path.split('/').slice(1);
	const model = pathParameters[0];
	const id = pathParameters[1] ? parseInt(pathParameters[1]) : null;
	const { name = null, type = null } = await getRequestBody(request);
	let pokemon = {}, status = 200, message, payload;

	/**
	 * Using the model and requestMethod retrieved from the request,
	 * we can determine which function to call on the Pokemon model.
	 *
	 * This toy application only has one model, but if we had more,
	 * then you can imagine how large this one file would get. It will
	 * be the goal of the next exercises to break up this huge function
	 * into something called the "Router" and "Controllers".
	 */
	switch (model) {
		case 'pokemon':
			switch (requestMethod) {
				case 'POST':
					pokemon = await Pokemon.create(name, type);
					message = "Pokemon created successfully!";
					break;
				case 'GET':
					pokemon = id ? await Pokemon.findById(id) : await Pokemon.findAll();
					message = "Pokemon retrieved successfully!";
					break;
				case 'PUT':
					pokemon = await Pokemon.findById(id);
					if (name) {
						pokemon.setName(name);
					}
					if (type) {
						pokemon.setType(type);
					}
					await pokemon.save();
					message = "Pokemon saved successfully!";
					break;
				case 'DELETE':
					pokemon = await Pokemon.findById(id);
					await pokemon.delete();
					message = "Pokemon deleted successfully!";
					break;
			}
			break;
		default:
			message = "Page not found!";
			status = 404;
	}

	/**
	 * The jsonSerialize function is a function which returns a JSON
	 * representation of the class. We don't want to send all of the
	 * functions and private member variables back to the client, so
	 * the jsonSerialize function takes care of assembling a nice neat
	 * package of relevant data that can be send back to the client.
	 */
	payload = pokemon instanceof Pokemon ? pokemon.jsonSerialize() : pokemon;

	/**
	 * Before sending the response back to the client, we set a couple
	 * of headers to make sure the client understands the type of data
	 * we are sending back. Once that is done, we stringify the final
	 * object we want to send back as an HTTP response. The response
	 * must be a string no matter if the data is JSON, XML, HTML, etc.
	 */
	response
		.writeHead(status, { 'Content-Type': 'application/json' })
		.end(JSON.stringify({ message, payload }));
};

/**
 * Create an HTTP server, and whenever a request is made,
 * call the handleHttpRequest function.
 */
const server = http.createServer(handleHttpRequest);

/**
 * Start the HTTP server and listen for requests on port 8000.
 */
server.listen(8000, () => {
	console.log('Listening on port 8000...');
});
