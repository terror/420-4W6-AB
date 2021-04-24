# Exercise 4.3 - Authentication 🔐

- 💯 **Worth**: 4%
- 📅 **Due**: April 18, 2021 @ 23:59
- 🙅🏽‍ **Penalty**: Late submissions lose 10% per day to a maximum of 3 days. Nothing is accepted after 3 days and a grade of 0% will be given.

## 🎯 Objectives

- **Authenticate** users of the application using cookies and sessions.
- **Restrict** actions and access to UI elements based on session data.

## 🔨 Setup

1. Navigate to `~/web-ii/Exercises`.
2. Clone the Git repo `git clone <paste URL from GitHub>` (without the angle brackets).
3. You should now have a folder inside `Exercises` called `exercise-4_3-githubusername`.
   - If you want, you can rename this folder `4.3-Authentication` for consistency's sake! 😉

You'll find that I've provided a (minimal) baseline for this exercise in case you did not complete E3.3. It is up to you if you wish to use this baseline or not.

- If you want to continue using your own code, **which I highly recommend**, then you can replace the provided MVC/Router files with your MVC/Router files from E3.3.
  1. Modify your controllers to accept a `session` parameter in the constructor and set `this.session = session`.
  2. Modify your `Router` to accept a `session` parameter in the constructor and set `this.session = session`.
  3. Modify the place in your `Router` where you instantiate the controllers to pass in `this.session`.
  4. Modify the place in `Router::dispatch` where you catch an exception and set the status code to use the status code from the exception: `statusCode: error.statusCode`.
- If you choose to use the baseline code, **then it is your sole responsibility to understand what the baseline code is doing**. If you run into trouble with the baseline code, then code your own implementation so you know exactly what the code is doing.

## 🔍 Context

HTTP is the protocol that we use to make web requests and responses. HTTP is _stateless_ which means that by itself, it does not remember any information about the user or what the application is doing from request to request. HTTP needs some help in order to **remember information** about the user and the application. We've accomplished this in this class via a relational database (MySQL) in our assignments to persist data from one request to the next.

### 🍪 Sessions

Let's look at another way of persisting (very small) data using a mechanism called a **session**. You can think of a session as a mini-database that lives in RAM of the Node server process. The only job of this mini-database is to store data about the web clients that are currently using our application. It does this by generating a **session ID** and passing that back to the client in a cookie. When the client makes another request, it passes this **session cookie** back to the server via the request to identify itself.

> 🍪 A cookie is a small piece of data that the server gives to the client when the client first makes a request to the server. The cookie is then kept on the client and sent to the server with every request to "remind" the server who you are. One analogy of this is when you get your hand stamped at a concert or amusement park. The venue (server) marked you (client) with a stamp (cookie) so that every time you leave and reenter the venue (HTTP request), all you (client) have to do is flash the stamp (cookie) at the attendant (server) and they will let you in. You don't have to pay each time you leave and re-enter!

The server can then use the information in the cookie to look up in its mini session database and check if it already has an entry with your session ID. If so, then you have access to all of the session data for that particular session ID.

There are 3 new classes I've provided (`src/auth`) that take care of handling everything related to sessions and cookies:

1. 👩‍💼 `SessionManager` is responsible for:
   - Creating new sessions
   - Retreiving currently running sessions
   - Keeping an array of all currently running sessions
   - Cleaning up sessions that have expired
   - Parsing cookies from the incoming HTTP request
2. 📦 `Session` is responsible for:
   - Generating a new session ID
   - Managing the data properties associated to that session
   - Keeping a cookie that represents the session
3. 🍪 `Cookie` is responsible for:
   - Storing the cookie properties (name, value, expires, etc.)
   - Generating the valid string representation of the cookie to be sent in a response header

It's not crucial that you know how each one of these classes work, but it's always a good idea to dive into them and try to understand them on your own. You will only be explicitly using the `Session` class in your application and I will outline how to use it later in this exercise.

### 🧪 Tests

**Do `http.test.js` before doing `browser.test.js`!** It will be much easier to get all of the session stuff working when making requests for JSON data rather than requests for HTML data. Debugging requests for simple data is easier than debugging requests that have to render messy template files. Once the JSON is good to go, the browser tests should be trivial.

## 🚦 Let's Go

This application will allow Pokemon to register and log into the application. The Pokemon will use their _name_ as the _username_ and their _type_ as the _password_. For example, if Pikachu made an account for this application, his username would be `Pikachu` and his password would be `Electric`. Only a logged-in Pokemon may be able to update and delete information.

### 🗺️ Routes

| Request Method | Path                 | Action                            | Redirect/Template ⭐   | Description                               |
| -------------- | -------------------- | --------------------------------- | ---------------------- | ----------------------------------------- |
| `GET`          | `/`                  | `HomeController::home`            | `HomeView`             | Display the homepage.                     |
| `ANY`          | `/{garbage}`         | `ErrorController::error`          | `ErrorView`            | Display a 404 error page.                 |
| `GET`          | `/auth/register`     | `AuthController::getRegisterForm` | `Pokemon/NewFormView`  | Display a form to register a new Pokemon. |
| `GET`          | `/auth/login`        | `AuthController::getLoginForm`    | `LoginFormView`        | Display a form to log in a Pokemon.       |
| `POST`         | `/auth/login`        | `AuthController::logIn`           | `/pokemon/{id}`        | Log in a Pokemon.                         |
| `GET`          | `/auth/logout`       | `AuthController::logOut`          | `/`                    | Log out the Pokemon.                      |
| `POST`         | `/pokemon`           | `PokemonController::new`          | `/pokemon/{id}`        | Register a new Pokemon.                   |
| `GET`          | `/pokemon/{id}`      | `PokemonController::show`         | `Pokemon/ShowView`     | Display a Pokemon's profile.              |
| `GET`          | `/pokemon`           | `PokemonController::list`         | `Pokemon/ListView`     | List all registered Pokemon.              |
| `GET`          | `/pokemon/{id}/edit` | `PokemonController::getEditForm`  | `Pokemon/EditFormView` | Display a form to edit a Pokemon.         |
| `PUT`          | `/pokemon/{id}`      | `PokemonController::edit`         | `/pokemon/{id}`        | Edit the specified Pokemon.               |
| `DELETE`       | `/pokemon/{id}`      | `PokemonController::destroy`      | `/pokemon`             | Delete the specified Pokemon.             |

> ⭐ `/*` means redirect to that path, otherwise, render the specified view.

### 🔐 Authentication Controller

Create a new controller called `src/Controllers/AuthController.js`. This controller will be in charge of everything related to, you guessed it, authentication! Normally I avoid abbreviations at all costs to make things crystal clear. However, "auth" is the standard way to refer to authentication in the dev community, so I'll make an exception!

Here's all the methods this controller should have:

- `constructor`: The constructor will receive a `Request`, `Response`, and `Session` object just like all the other controllers and assign them to the parent class' corresponding fields. It will then determine what the value of `this.action` should be based on the request method and header parameters. All of the information you need to determine which action should be set can be found in the routes table above.
- `getRegisterForm` and `getLoginForm`: Calls `this.response.setResponse()` and specifies the correct template file to use (see the routes table above) as well as the title that page should have.
- `logIn`: Checks if the supplied credentials are valid, and if so, sets a session property called `pokemon_id` and redirect to the Pokemon's profile page. A more in-depth explantion of the login process can be found below.

- `logout`: Destroys the session and redirects to the homepage. A more in-depth explantion of the logout process can be found below.

#### 🔓 Log In

Here is a detailed description of what the login process looks like and how your application should handle a login request:

1. The user makes a `GET /auth/login` request which will be received by `server.js`. Before we can work with a session, we have to retrieve it:

   ```js
   // server.js:85
   const session = sessionManager.getSession(request);
   ```

   - You can think of this like "connecting" to the session database before you can access data from it.
   - This `session` object will be passed through the app just like `request` and `response` so that we can access the session from the controllers.

2. Eventually we'll get routed to the `getLoginForm` method of the `AuthController`. This method sets the correct template inside of the `setResponse` method and returns the response.
3. The user fills out the form and clicks submit, which makes a `POST /auth/login` request. This gets routed to the `logIn` method of the `AuthController`.
4. `AuthController::logIn` accesses the `name` and `type` request body parameters and passes these two fields to a new method inside the `Pokemon` model (that you will have to write) called `logIn`.

   - `Pokemon::logIn` will check if the provided name/type combination exist in the database:

     ```sql
     SELECT * FROM `pokemon` WHERE `name` = ? AND `type` = ?;
     ```

   - If the result of calling `Pokemon::logIn` is empty, that means the user supplied invalid credentials so we should throw an exception.
   - If the result is not empty, then we should add a new session property:

     ```js
     // AuthController.js
     this.session.set('pokemon_id', pokemon.getId());
     ```

     - You can think of this like "inserting" into the session database.

5. Call `this.response.setResponse` which sets a `message`, `payload`, and `redirect` to the Pokemon's profile page.
6. Finally, return the response!

#### 🔒 Log Out

Logging out is much simpler:

1. The user makes a `GET /auth/logout` request which will get routed to the `logOut` method of the `AuthController`.
2. `AuthController::logOut` will destroy the session:

   ```js
   this.session.destroy();
   ```

   - You can think of this like "closing" the connection to the session database.

3. Call `this.response.setResponse` which sets a `message` and `redirect` to the homepage.
4. Finally, return the response!

### ⚡ Pokemon Controller

The tests will check if the user is logged in before they can **update** or **delete** a Pokemon. This means that we need to do an additional check at the top of the `PokemonController::edit` and `PokemonController::destroy` methods to check if the user is logged in before proceeding with the rest of the method logic. Meaning, we have to check if a `pokemon_id` session property is set or not using:

```js
this.session.exists('pokemon_id');
```

If it's not set, then we want to throw a new `PokemonException` with an appropriate message and status code. If you're thinking, _"Wait, how can an exception have a status code? Don't we just pass in an error message when making a new exception?"_, then do I have some good news for you!

### ⚠️ Pokemon Exception

Take a look at `src/exceptions/PokemonException.js` and notice there's an additional parameter being passed into the constructor that was not there in E3.3. We can now pass in an optional status code when throwing an exception. If no status code is passed when throwing a new exception, it will default to a `400 BAD_REQUEST`, which can be seen in `src/exceptions/Exception.js`. The status code will be extracted from the exception in `Router::dispatch` and will be used to set the response.

This is useful because now that we're dealing with authentication, we need some way of setting status codes for:

- `401 UNAUTHORIZED`: when an exception is thrown if an _unauthenticated_ client tries to make a request that is only accessible after they are logged in.
- `403 FORBIDDEN`: when an exception is thrown if an _authenticated_ client tries to make a request for a resource that they do not have access to.

Here's an example:

```js
throw new PokemonException(
  'Cannot update Pokemon: You must be logged in.',
  HttpStatusCode.UNAUTHORIZED
);
```

### 👀 Pokemon List View

The tests will check that **only** a logged-in user can update/delete entries in the list view. To do this, you will have to pass a boolean value to the template that indicates whether the user is logged in or not:

```js
// PokemonController.js
this.response.setResponse({
  isAuthenticated: this.session.exists('pokemon_id'),
  // ... other response fields ...
});
```

- This checks if a specified property exists in the session database.

```handlebars
<!-- ListView.hbs -->
{{#if ../isAuthenticated}}
```

- Most likely you will have this conditional statement inside of an `{{ each payload }}` loop. The `../` is to access the parent scope. Without it, if you just wrote `{{#if isAuthenticated}}`, then you would be accessing `payload.isAuthenticated`, which obviously doesn't exist.

## 📥 Submission

Check that all tests are passing by removing all occurrences of `.only` and running the test suite for the final time. Once you've made your final `git push` to GitHub, here's what you have to do to submit:

1. Go to [Gradescope](https://www.gradescope.ca/courses/828) and click the link for this exercise.
2. Select the correct repository and branch from the dropdown menus.
3. Click _Upload_.
4. Wait for the autograder to finish grading your submission. Once it's done, you should see the final output of the test results as well as your grade on the top right.

![Comic](images/4.3.1-Comic.png)

_Courtesy of [XKCD](https://xkcd.com/936/)_
