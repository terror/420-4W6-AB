class Url {
	/**
	 * Generates the base url of the application.
	 *
	 * @returns string
	 */
	static base() {
		// See the bottom of this file for where PUBLIC_PATH is defined.
		return Url.PUBLIC_PATH;
	}

	/**
	 * Generates a full url to the desired path.
	 * Can pass optional parameters to map to tokens in url path.
	 *
	 * @param string path
	 * @param array parameters
	 * @returns string
	 */
	static path(path = '', parameters) {
		let url = `${Url.base()}/${path}`;

		if (!parameters) {
			return url;
		}

		// TODO: look into implementing some way for query parameters maybe?
		if (typeof parameters === 'object') {
			Object.keys(parameters).forEach((key) => {
				url = url.replace(`{${key}}`, parameters[key]);
			});
		}
		else {
			url = url.replace('{id}', parameters);
		}

		return url;
	}

	/**
	 * Generates a full url to the desired styles path.
	 *
	 * @param string path
	 * @returns string
	 */
	static styles(path) {
		return Url.path(`${Url.STYLES_PATH}/${path}`);
	}

	/**
	 * Generates a full url to the desired scripts path.
	 *
	 * @param string path
	 * @returns string
	 */
	static scripts(path) {
		return Url.path(`${Url.SCRIPTS_PATH}/${path}`);
	}

	/**
	 * Generates a full url to the desired images path.
	 *
	 * @param string path
	 * @returns string
	 */
	static images(path) {
		return Url.path(`${Url.IMAGES_PATH}/${path}`);
	}
}

/**
 * Current public path of the application.
 */
Url.PUBLIC_PATH = 'http://localhost:8000';

/**
 * Relative path to where the CSS Styles exist.
 */
Url.STYLES_PATH = 'styles';

/**
 * Relative path to where the JS Scripts exist.
 */
Url.SCRIPTS_PATH = 'js';

/**
 * Relative path to where the images exist.
 */
Url.IMAGES_PATH = 'images';

module.exports = Url;
