/**
 * This class is responsible for parsing and organizing the HTTP request data.
 */
class Request {
    constructor(requestMethod = 'GET', modelName = '', parameters = {}) {
        this.requestMethod = requestMethod;
        this.modelName = this.parseModelName(modelName);
        this.parameters = this.parseParams(parameters, modelName);
    }

    parseModelName(m) {
        return m.split('/')[1] || '';
    }

    parseParams(a, b) {
        let ret = {};
        const c = b.split('/')[2];
        ret.body = a;
        ret.header = c ? [c] : [];
        return ret;
    }

    getRequestMethod() {
        return this.requestMethod;
    }

    getModelName() {
        return this.modelName;
    }

    getParameters() {
        return this.parameters;
    }
}

module.exports = Request;
