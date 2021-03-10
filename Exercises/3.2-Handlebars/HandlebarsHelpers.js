const fs = require('fs').promises;
const handlebars = require('handlebars');

/**
 * Reads the template file from the file system and compiles it.
 * @param {string} path The path to a .hbs file.
 * @returns {Promise<HandlebarsTemplateDelegate>} The compiled Handlebars template.
 */
const compileTemplate = async (path) =>
  handlebars.compile((await fs.readFile(path)).toString());

/**
 * Reads the template from the file system and registers the compiled template as a Handlebars partial.
 * @param {string} name The name the partial will be referenced by in other templates.
 * @param {string} path The path to a .hbs file.
 */
const registerPartialTemplate = async (name, path) =>
  handlebars.registerPartial(name, await compileTemplate(path));

/**
 * Merges the template placeholders and data together and returns an HTML string.
 * @param {string} path The path to a .hbs file.
 * @param {object} data The data to merge with the template.
 * @returns {Promise<string>} A string of valid HTML.
 */
const renderTemplate = async (path, data) =>
  (await compileTemplate(path))(data);

module.exports = {
  registerPartialTemplate,
  renderTemplate,
  compileTemplate,
};
