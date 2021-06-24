class Request {
    constructor(requestMethod = 'GET', controllerName = '', parameters = {}) {
        this.requestMethod = requestMethod;
        this.controllerName = this.parseControllerName(controllerName);
        this.parameters = this.parseParams(parameters, controllerName);
    }

    parseControllerName(m) {
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

    getControllerName() {
        return this.controllerName;
    }

    getParameters() {
        return this.parameters;
    }
}

module.exports = Request;
