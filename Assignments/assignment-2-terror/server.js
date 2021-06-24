const http = require('http');
const App = require('./src/App');

const logTimestamp = (request) => {
	const date = new Date();
	const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	const formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	console.log(`[${formattedDate} ${formattedTime}] Received HTTP ${request.method} request for ${request.url}`);
};

/**
 * Create an HTTP server, and whenever a request is made,
 * instantiate a new App object. The App object will take care
 * of handling the request, performing the correct CRUD operation
 * and sending the response back to the client.
 * @param {Object} request
 * @param {Object} response
 */
const server = http.createServer(async (request, response) => {
	logTimestamp(request);

	const app = new App();
	await app.handleRequest(request);
	await app.sendResponse(response);
});

/**
 * If there is a problem with the request, send back an error.
 */
server.on('clientError', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

/**
 * Start the HTTP server and listen for requests on port 8000.
 */
server.listen(8000, () => {
	console.log('Listening on port 8000...');
});
