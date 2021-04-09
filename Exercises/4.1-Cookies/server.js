const http = require('http');
const pageData = require('./pageData');
const {
  registerPartialTemplate,
  renderTemplate,
} = require('./HandlebarsHelpers');
const { getRequestBody, getCookies } = require('./ServerHelpers');

/**
 * Create an HTTP server, and whenever a request is made, execute the callback function.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */

// yeeet
// there has to be a better way than this pile of manure
const go = (l, o) => {
  let x = [],
    keys = Object.keys(o),
    ret = [];

  l
    ? (x = keys.map((k) => {
        return o[k].en ? o[k].en : o[k];
      }))
    : (x = keys.map((k) => {
        return o[k].fr ? o[k].fr : o[k];
      }));

  for (let i = 0; i < keys.length; ++i) ret[keys[i]] = x[i];
  return ret;
};

const server = http.createServer(async (request, response) => {
  const cookies = getCookies(request);
  const body = await getRequestBody(request);
  const en = cookies.language == 'en';

  await registerPartialTemplate('Header', 'views/Partials/Header.hbs');
  await registerPartialTemplate('Footer', 'views/Partials/Footer.hbs');

  if (request.url === '/language') {
    response.setHeader('Location', request.headers.referer);
    response.writeHead(303, {
      'Set-Cookie': [`language=${body.language}`],
    });
    return response.end();
  }

  let html;
  switch (request.url) {
    case '/home':
      html = renderTemplate('views/Page.hbs', go(en, pageData.home));
      break;
    case '/about':
      html = renderTemplate('views/Page.hbs', go(en, pageData.about));
      break;
    case '/contact':
      html = renderTemplate('views/Page.hbs', go(en, pageData.contact));
      break;
    case '/image':
      html = renderTemplate('views/Page.hbs', go(en, pageData.image));
      break;
    case '/items':
      html = renderTemplate('views/Page.hbs', go(en, pageData.items));
      break;
    default:
      response.writeHead(404);
      return response.end();
      break;
  }

  response.writeHead(200);
  return response.end(await html);
});

/**
 * Start the HTTP server and listen for requests on port 8000.
 */
server.listen(8000, () => {
  console.log('Listening on port 8000...');
});
