const Exception = require('./Exception');

/**
 * This class simply takes the error message and
 * passes it up to the parent Exception class.
 */
class CommentException extends Exception {
	constructor(message) {
		super(message, CommentException);
	}
}

module.exports = CommentException;
