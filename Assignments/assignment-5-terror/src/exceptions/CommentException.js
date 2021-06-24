const Exception = require('./Exception');

/**
 * This class simply takes the error message and
 * passes it up to the parent Exception class.
 */
class CommentException extends Exception {
	constructor(message, statusCode) {
		super(message, CommentException, statusCode);
	}
}

module.exports = CommentException;
