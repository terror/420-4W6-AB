const http = require('http');
const todos = require('./todos');
const { renderTemplate } = require('./HandlebarsHelpers');
const { getRequestBody, getStaticFile } = require('./ServerHelpers');

/**
 * Create an HTTP server, and whenever a request is made, execute the callback function.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const server = http.createServer(async (request, response) => {
  if (request.url.match(/.*\..*/)) {
    return getStaticFile(request.url, response);
  }

  const body = await getRequestBody(request);
  let statusCode = 404;
  let responseData = 'Page not found.';

  switch (request.url) {
    case '/todo/add':
      const todo = { description: body.description };
      todos.push(todo);
      statusCode = 200;
      responseData = JSON.stringify(todo);
      break;
    case '/':
      statusCode = 200;
      responseData = await renderTemplate('HomeView.hbs', { todos });
      break;
  }

  response.writeHead(statusCode);
  response.end(responseData);
});

/**
 * Start the HTTP server and listen for requests on port 9000.
 */
server.listen(9000, () => {
  console.log('Listening on port 9000...');
});
