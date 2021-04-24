const Exception = require('./Exception');

/**
 * This class simply takes the error message and
 * passes it up to the parent Exception class.
 */
class PokemonException extends Exception {
  constructor(message, statusCode) {
    super(message, PokemonException, statusCode);
  }
}

module.exports = PokemonException;
